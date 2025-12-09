from django.db import models

from django.db import models

class MediaFile(models.Model):
    """
    Generic media file model for storing images, videos, and other files
    """
    FILE_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),
        ('audio', 'Audio'),
    ]
    
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='media/')
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES)
    mime_type = models.CharField(max_length=100)
    size = models.PositiveIntegerField(help_text="File size in bytes")
    alt_text = models.CharField(max_length=200, blank=True, help_text="Alternative text for accessibility")
    description = models.TextField(blank=True)
    uploaded_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='uploaded_files')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
