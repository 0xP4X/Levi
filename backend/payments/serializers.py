from rest_framework import serializers
from .models import Payment, Refund

class RefundSerializer(serializers.ModelSerializer):
    """
    Serializer for the Refund model
    """
    payment_amount = serializers.DecimalField(source='payment.amount', read_only=True, max_digits=10, decimal_places=2)
    payment_currency = serializers.CharField(source='payment.currency', read_only=True)
    
    class Meta:
        model = Refund
        fields = [
            'id', 'payment', 'payment_amount', 'payment_currency',
            'amount', 'reason', 'stripe_refund_id', 'status',
            'processed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'payment_amount', 'payment_currency', 'status', 'processed_at', 'created_at', 'updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Payment model
    """
    booking_client_name = serializers.CharField(source='booking.client.get_full_name', read_only=True)
    booking_provider_name = serializers.CharField(source='booking.provider.get_full_name', read_only=True)
    booking_service_title = serializers.CharField(source='booking.service.title', read_only=True)
    booking_start_time = serializers.DateTimeField(source='booking.start_time', read_only=True)
    refunds = RefundSerializer(many=True, read_only=True)
    total_refunded = serializers.SerializerMethodField()
    balance_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'booking_client_name', 'booking_provider_name',
            'booking_service_title', 'booking_start_time', 'amount', 'currency',
            'payment_method', 'status', 'transaction_id', 'stripe_payment_intent_id',
            'stripe_charge_id', 'customer_email', 'customer_name', 'billing_address',
            'tax_amount', 'service_fee', 'total_amount', 'refund_amount', 'is_refunded',
            'refunded_at', 'refund_reason', 'created_at', 'updated_at', 'processed_at',
            'failed_at', 'failure_reason', 'refunds', 'total_refunded', 'balance_remaining'
        ]
        read_only_fields = [
            'id', 'booking_client_name', 'booking_provider_name', 'booking_service_title',
            'booking_start_time', 'status', 'transaction_id', 'stripe_payment_intent_id',
            'stripe_charge_id', 'total_amount', 'is_refunded', 'refunded_at', 'created_at',
            'updated_at', 'processed_at', 'failed_at', 'failure_reason', 'refunds',
            'total_refunded', 'balance_remaining'
        ]
    
    def get_total_refunded(self, obj):
        """
        Calculate total amount refunded for this payment
        """
        return obj.refunds.aggregate(
            total=models.Sum('amount')
        )['total'] or 0
    
    def get_balance_remaining(self, obj):
        """
        Calculate remaining balance after refunds
        """
        return obj.amount - self.get_total_refunded(obj)