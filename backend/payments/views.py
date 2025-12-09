from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Payment, Refund
from .serializers import PaymentSerializer, RefundSerializer

class PaymentListView(generics.ListAPIView):
    """
    View for listing all payments (admin only)
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAdminUser]

class PaymentDetailView(generics.RetrieveUpdateAPIView):
    """
    View for retrieving or updating a specific payment
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserPaymentListView(generics.ListAPIView):
    """
    View for listing all payments for the current user's bookings
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return payments for bookings where the current user is client or provider
        return Payment.objects.filter(
            models.Q(booking__client=self.request.user) |
            models.Q(booking__provider=self.request.user)
        )

class BookingPaymentDetailView(generics.RetrieveAPIView):
    """
    View for retrieving the payment for a specific booking
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filter by booking ID from URL parameters
        booking_id = self.kwargs['booking_id']
        return Payment.objects.filter(booking_id=booking_id)
    
    def get_object(self):
        # Override to handle case where payment doesn't exist yet
        try:
            return super().get_object()
        except Payment.DoesNotExist:
            return None

class RefundListView(generics.ListCreateAPIView):
    """
    View for listing all refunds for a payment or creating a new refund
    """
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filter refunds by payment ID from URL parameters
        payment_id = self.kwargs['payment_id']
        return Refund.objects.filter(payment_id=payment_id)
    
    def perform_create(self, serializer):
        # Set the payment from the URL parameter when creating a refund
        payment_id = self.kwargs['payment_id']
        serializer.save(payment_id=payment_id)