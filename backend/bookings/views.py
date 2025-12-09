from rest_framework import generics, permissions, status
from django.db import models
from rest_framework.response import Response
from .models import Booking, BookingChangeLog
from .serializers import BookingSerializer, BookingChangeLogSerializer

class BookingListView(generics.ListCreateAPIView):
    """
    View for listing all bookings or creating a new booking
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Admins can see all bookings
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Booking.objects.all()
            
        # Users can see their own bookings as client or provider
        # Also ensure we are filtering correctly using Q objects
        return Booking.objects.filter(
            models.Q(client=self.request.user) | models.Q(provider=self.request.user)
        )
    
    def perform_create(self, serializer):
        # Set client to current user when creating a booking
        serializer.save(client=self.request.user)

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View for retrieving, updating or deleting a specific booking
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        # Get the existing booking instance
        instance = self.get_object()
        old_status = instance.status
        
        # Perform the update
        response = super().update(request, *args, **kwargs)
        
        # Create a change log if status was updated
        if 'status' in request.data and request.data['status'] != old_status:
            BookingChangeLog.objects.create(
                booking=instance,
                previous_status=old_status,
                new_status=request.data['status'],
                changed_by=request.user,
                reason=request.data.get('reason', '')
            )
        
        return response

class ClientBookingListView(generics.ListAPIView):
    """
    View for listing all bookings for the current client
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return bookings where the current user is the client
        return Booking.objects.filter(client=self.request.user)

class ProviderBookingListView(generics.ListAPIView):
    """
    View for listing all bookings for the current provider
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return bookings where the current user is the provider
        return Booking.objects.filter(provider=self.request.user)

class BookingChangeLogListView(generics.ListAPIView):
    """
    View for listing all change logs for a specific booking
    """
    serializer_class = BookingChangeLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filter change logs by booking ID from URL parameters
        booking_id = self.kwargs['booking_id']
        return BookingChangeLog.objects.filter(booking_id=booking_id)