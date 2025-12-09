from django.db import models
from users.models import User
from services.models import Service

class BookingStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    CONFIRMED = 'confirmed', 'Confirmed'
    COMPLETED = 'completed', 'Completed'
    CANCELLED = 'cancelled', 'Cancelled'
    REJECTED = 'rejected', 'Rejected'
    NO_SHOW = 'no_show', 'No Show'

class PaymentStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    PAID = 'paid', 'Paid'
    FAILED = 'failed', 'Failed'
    REFUNDED = 'refunded', 'Refunded'
    PARTIALLY_REFUNDED = 'partially_refunded', 'Partially Refunded'

class Booking(models.Model):
    """
    Booking model for service appointments
    """
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_as_client')
    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_as_provider')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings')
    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    location_type = models.CharField(
        max_length=20,
        choices=[
            ('in_person', 'In Person'),
            ('online', 'Online')
        ]
    )
    meeting_link = models.URLField(blank=True, help_text="Video call link for online services")
    address = models.TextField(blank=True, help_text="Address for in-person services")
    special_requests = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'Booking {self.id} - {self.service.title}'

    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['client']),
            models.Index(fields=['provider']),
            models.Index(fields=['start_time']),
            models.Index(fields=['status']),
        ]

class BookingChangeLog(models.Model):
    """
    Log of changes to booking status
    """
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='change_logs')
    previous_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.booking.id} - {self.previous_status} → {self.new_status}'

    class Meta:
        ordering = ['-timestamp']