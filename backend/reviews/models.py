from django.db import models
from users.models import User
from bookings.models import Booking

class ReviewStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'
    REMOVED = 'removed', 'Removed'

class Review(models.Model):
    """
    Review and rating model for services
    """
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_written')
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    title = models.CharField(max_length=200)
    comment = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=ReviewStatus.choices,
        default=ReviewStatus.PENDING
    )
    is_anonymous = models.BooleanField(default=False)
    images = models.ManyToManyField('media_files.MediaFile', blank=True)
    helpful_count = models.PositiveIntegerField(default=0)
    reported_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'Review {self.id} - {self.rating} stars'

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reviewer']),
            models.Index(fields=['reviewee']),
            models.Index(fields=['rating']),
            models.Index(fields=['status']),
        ]

class ReviewComment(models.Model):
    """
    Comments on reviews
    """
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Comment by {self.user.username}'

    class Meta:
        ordering = ['created_at']

class ReviewHelpfulVote(models.Model):
    """
    Helpful votes on reviews
    """
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='helpful_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_helpful = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['review', 'user']
        ordering = ['-created_at']