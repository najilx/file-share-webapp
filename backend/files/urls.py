# files/urls.py
from django.urls import path
from .views import (
    FileUploadView, FileListView, FileDeleteView, FileDownloadView,
    ShareFileView, PublicSharedFileDownloadView, SharedFileListView
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('list/', FileListView.as_view(), name='file-list'),
    path('delete/<int:pk>/', FileDeleteView.as_view(), name='file-delete'),
    path('download/<int:pk>/', FileDownloadView.as_view(), name='file-download'),

    path('share/', ShareFileView.as_view(), name='file-share'),
    # (Authenticated user POSTS here: { file, recipient_email, expiration_hours, message })
    path('shared/<uuid:token>/', PublicSharedFileDownloadView.as_view(), name='public-download'),
    # (No auth needed. GET with token to download.)
    path('shared-list/', SharedFileListView.as_view(), name='shared-file-list'),
    # (Authenticated user GETs a list of all shares they’ve created.)
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)