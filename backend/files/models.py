# files/models.py
from django.db import models
from django.conf import settings
import uuid
from django.utils import timezone

def user_directory_path(instance, filename):
    return f'user_{instance.owner.id}/{filename}'

class File(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to=user_directory_path)
    filename = models.CharField(max_length=255)
    size = models.BigIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename


class SharedFile(models.Model):
    """
    Stores each “share” of a File, with a unique UUID token, expiration, and accessed flag.
    """
    file = models.ForeignKey(
        File,
        on_delete=models.CASCADE,
        related_name='shares'
    )
    recipient_email = models.EmailField()
    message = models.TextField(blank=True)
    token = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False
    )
    expiration = models.DateTimeField()
    shared_at = models.DateTimeField(auto_now_add=True)
    accessed = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expiration

    def __str__(self):
        return f"Share {self.token} → {self.recipient_email}"