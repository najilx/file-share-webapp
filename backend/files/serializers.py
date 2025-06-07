# files/serializers.py
from rest_framework import serializers
from .models import File, SharedFile

MAX_FILE_SIZE_MB = 100
MAX_TOTAL_STORAGE_MB = 1024  # 1GB

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'filename', 'file', 'size', 'uploaded_at']
        read_only_fields = ['filename', 'size', 'uploaded_at']

    def validate_file(self, file):
        if file.size > MAX_FILE_SIZE_MB * 1024 * 1024:
            raise serializers.ValidationError("File size exceeds 100MB limit.")
        return file

    def create(self, validated_data):
        user = self.context['request'].user
        total_size = sum(f.size for f in user.files.all())
        new_file_size = validated_data['file'].size

        if total_size + new_file_size > MAX_TOTAL_STORAGE_MB * 1024 * 1024:
            raise serializers.ValidationError("User storage quota of 1GB exceeded.")

        validated_data['filename'] = validated_data['file'].name
        validated_data['size'] = new_file_size
        validated_data['owner'] = user
        return super().create(validated_data)


class SharedFileSerializer(serializers.ModelSerializer):
    """
    Used both for creating a share (owner → recipient) and listing shared files.
    """
    file = serializers.PrimaryKeyRelatedField(queryset=File.objects.all(), write_only=True)
    filename = serializers.CharField(source='file.filename', read_only=True)
    file_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SharedFile
        fields = [
            'id',
            'file',             # (write-only) ID of the File being shared
            'filename',         # (read-only) the file’s name, for listing
            'recipient_email',
            'message',
            'expiration',
            'shared_at',
            'accessed',
            'file_url',         # (read-only) publicly accessible URL for frontend display
        ]
        read_only_fields = ['id', 'shared_at', 'accessed', 'filename', 'file_url']

    def get_file_url(self, obj):
        """
        Build absolute URL to the underlying FileField so that
        authenticated user can see it in shared‐list results.
        """
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.file.file.url)
        return None

    def validate_file(self, value):
        """
        Ensure the user is sharing their own file.
        """
        user = self.context['request'].user
        if value.owner != user:
            raise serializers.ValidationError("You can only share your own files.")
        return value