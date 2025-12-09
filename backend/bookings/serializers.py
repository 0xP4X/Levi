from rest_framework import serializers
from .models import Booking, BookingChangeLog

class BookingChangeLogSerializer(serializers.ModelSerializer):
    """
    Serializer for the BookingChangeLog model
    """
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = BookingChangeLog
        fields = [
            'id', 'previous_status', 'new_status', 'changed_by', 'changed_by_name',
            'reason', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']

class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer for the Booking model
    """
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    provider_name = serializers.CharField(source='provider.get_full_name', read_only=True)
    service_title = serializers.CharField(source='service.title', read_only=True)
    change_logs = BookingChangeLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'client', 'client_name', 'provider', 'provider_name',
            'service', 'service_title', 'status', 'payment_status',
            'start_time', 'end_time', 'duration', 'price', 'location_type',
            'meeting_link', 'address', 'special_requests', 'cancellation_reason',
            'created_at', 'updated_at', 'cancelled_at', 'change_logs'
        ]
        read_only_fields = ['id', 'client_name', 'provider_name', 'service_title', 'created_at', 'updated_at', 'cancelled_at', 'change_logs']