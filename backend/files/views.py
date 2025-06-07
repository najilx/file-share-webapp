# files/views.py
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import File,SharedFile
from .serializers import FileSerializer, SharedFileSerializer
from django.http import FileResponse, Http404
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

class FileUploadView(generics.CreateAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        files = request.FILES.getlist('files[]')  # important: use 'files[]'
        if not files:
            return Response({'error': 'No files uploaded.'}, status=400)

        results = []
        errors = []

        for file in files:
            serializer = self.get_serializer(data={'file': file}, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                results.append(serializer.data)
            else:
                errors.append({file.name: serializer.errors})

        if errors:
            return Response({'uploaded': results, 'errors': errors}, status=207)  # Multi-Status
        return Response(results, status=201)


class FileListView(generics.ListAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['filename']

    def get_queryset(self):
        return File.objects.filter(owner=self.request.user).order_by('-uploaded_at')

class FileDeleteView(generics.DestroyAPIView):
    queryset = File.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        file = super().get_object()
        if file.owner != self.request.user:
            raise Http404
        return file

class FileDownloadView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            file = File.objects.get(pk=pk, owner=request.user)
            return FileResponse(file.file, as_attachment=True, filename=file.filename)
        except File.DoesNotExist:
            raise Http404


class ShareFileView(generics.CreateAPIView):
    """
    POST: Authenticated user shares a file with an external email address.
    Required fields in request.data:
      - file: ID of an existing File object (must belong to request.user)
      - recipient_email: email to send the link
      - expiration_hours: integer (hours from now until link expires)
      - message: optional text message to include in email
    """
    serializer_class = SharedFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file_id = request.data.get('file')
        recipient = request.data.get('recipient_email')
        exp_hours = int(request.data.get('expiration_hours', 24))
        message = request.data.get('message', '')

        # 1. Validate the file exists and belongs to the user
        file_obj = get_object_or_404(File, id=file_id, owner=request.user)

        # 2. Compute expiration datetime
        expiration_dt = timezone.now() + timezone.timedelta(hours=exp_hours)

        # 3. Create the SharedFile entry
        shared = SharedFile.objects.create(
            file=file_obj,
            recipient_email=recipient,
            message=message,
            expiration=expiration_dt
        )

        # 4. Build a share URL (public download endpoint)
        share_url = request.build_absolute_uri(f"/api/files/shared/{shared.token}/")

        # 5. Send email
        subject = f"{request.user.email} has shared a file with you"
        email_body = (
            f"{request.user.email} shared a file: {file_obj.filename}\n\n"
            f"Message:\n{message}\n\n"
            f"Download within {exp_hours} hour(s):\n"
            f"{share_url}\n\n"
            "If you did not expect this, you can ignore this email."
        )
        send_mail(
            subject=subject,
            message=email_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )

        return Response(
            {"detail": "File shared and email sent."},
            status=status.HTTP_201_CREATED
        )


class PublicSharedFileDownloadView(generics.GenericAPIView):
    """
    GET: Anyone (no auth) can download the file if the token is valid & not expired.
    URL pattern uses token (UUID) to look up SharedFile. Marks it as accessed=true.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        shared = get_object_or_404(SharedFile, token=token)
        if shared.is_expired():
            return Response({"error": "Link expired."}, status=status.HTTP_403_FORBIDDEN)

        # Mark as accessed, save
        if not shared.accessed:
            shared.accessed = True
            shared.save(update_fields=['accessed'])

        # Return the binary file as an attachment
        return FileResponse(
            shared.file.file,
            as_attachment=True,
            filename=shared.file.filename
        )


class SharedFileListView(generics.ListAPIView):
    """
    GET: Authenticated user sees all SharedFile entries for files they own.
    Fields returned via SharedFileSerializer:
      - id, filename, recipient_email, message, expiration, shared_at, accessed, file_url
    """
    serializer_class = SharedFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # or you can keep default pagination

    def get_queryset(self):
        # Only shares where the underlying File.owner == request.user
        return SharedFile.objects.filter(file__owner=self.request.user).order_by('-shared_at')