from django.db import models
from users.models import User
from bookings.models import Booking

class PaymentMethod(models.TextChoices):
    CREDIT_CARD = 'credit_card', 'Credit Card'
    DEBIT_CARD = 'debit_card', 'Debit Card'
    PAYPAL = 'paypal', 'PayPal'
    STRIPE = 'stripe', 'Stripe'
    APPLE_PAY = 'apple_pay', 'Apple Pay'
    GOOGLE_PAY = 'google_pay', 'Google Pay'

class PaymentStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    PROCESSING = 'processing', 'Processing'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    REFUNDED = 'refunded', 'Refunded'
    PARTIALLY_REFUNDED = 'partially_refunded', 'Partially Refunded'
    CANCELLED = 'cancelled', 'Cancelled'

class Currency(models.TextChoices):
    USD = 'USD', 'US Dollar'
    EUR = 'EUR', 'Euro'
    GBP = 'GBP', 'British Pound'
    CAD = 'CAD', 'Canadian Dollar'
    AUD = 'AUD', 'Australian Dollar'

class Payment(models.Model):
    """
    Payment model for booking transactions
    """
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(
        max_length=3,
        choices=Currency.choices,
        default=Currency.USD
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices
    )
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )
    transaction_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    stripe_payment_intent_id = models.CharField(max_length=100, blank=True)
    stripe_charge_id = models.CharField(max_length=100, blank=True)
    customer_email = models.EmailField()
    customer_name = models.CharField(max_length=100)
    billing_address = models.TextField(blank=True)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    service_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_refunded = models.BooleanField(default=False)
    refunded_at = models.DateTimeField(null=True, blank=True)
    refund_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.TextField(blank=True)

    def __str__(self):
        return f'Payment {self.id} - {self.amount} {self.currency}'

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking']),
            models.Index(fields=['status']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['stripe_payment_intent_id']),
            models.Index(fields=['created_at']),
        ]

class Refund(models.Model):
    """
    Refund model for partial or full refunds
    """
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    stripe_refund_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Refund {self.id} - {self.amount}'

    class Meta:
        ordering = ['-created_at']
