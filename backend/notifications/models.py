from django.db import models
from users.models import User

class NotificationType(models.TextChoices):
    BOOKING_CONFIRMED = 'booking_confirmed', 'Booking Confirmed'
    BOOKING_CANCELLED = 'booking_cancelled', 'Booking Cancelled'
    BOOKING_REMINDER = 'booking_reminder', 'Booking Reminder'
    NEW_MESSAGE = 'new_message', 'New Message'
    NEW_REVIEW = 'new_review', 'New Review'
    PROMOTION = 'promotion', 'Promotion'
    SYSTEM_ALERT = 'system_alert', 'System Alert'
    PAYMENT_CONFIRMED = 'payment_confirmed', 'Payment Confirmed'
    PAYMENT_FAILED = 'payment_failed', 'Payment Failed'

class NotificationChannel(models.TextChoices):
    EMAIL = 'email', 'Email'
    SMS = 'sms', 'SMS'
    PUSH = 'push', 'Push Notification'
    IN_APP = 'in_app', 'In-App Notification'

class NotificationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    SENT = 'sent', 'Sent'
    DELIVERED = 'delivered', 'Delivered'
    READ = 'read', 'Read'
    FAILED = 'failed', 'Failed'

class Notification(models.Model):
    """
    Notification model for user alerts and messages
    """
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50, choices=NotificationType.choices)
    channel = models.CharField(max_length=20, choices=NotificationChannel.choices)
    status = models.CharField(
        max_length=20,
        choices=NotificationStatus.choices,
        default=NotificationStatus.PENDING
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True, help_text="Additional data payload")
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.get_type_display()} - {self.recipient.username}'

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient']),
            models.Index(fields=['type']),
            models.Index(fields=['channel']),
            models.Index(fields=['status']),
            models.Index(fields=['is_read']),
        ]

class UserNotificationPreference(models.Model):
    """
    User notification preferences
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    email_notifications_enabled = models.BooleanField(default=True)
    sms_notifications_enabled = models.BooleanField(default=False)
    push_notifications_enabled = models.BooleanField(default=True)
    in_app_notifications_enabled = models.BooleanField(default=True)
    booking_notifications = models.BooleanField(default=True)
    review_notifications = models.BooleanField(default=True)
    promotion_notifications = models.BooleanField(default=True)
    system_notifications = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Preferences for {self.user.username}'