from rest_framework import serializers
from .models import Notification, UserNotificationPreference

class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Notification model
    """
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'recipient_name', 'type', 'channel', 'status',
            'title', 'message', 'data', 'is_read', 'read_at', 'sent_at',
            'delivered_at', 'failed_at', 'failure_reason', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'recipient_name', 'status', 'sent_at', 'delivered_at', 'failed_at', 'failure_reason', 'created_at', 'updated_at']

class UserNotificationPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserNotificationPreference model
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = UserNotificationPreference
        fields = [
            'id', 'user', 'user_name', 'email_notifications_enabled',
            'sms_notifications_enabled', 'push_notifications_enabled',
            'in_app_notifications_enabled', 'booking_notifications',
            'review_notifications', 'promotion_notifications', 'system_notifications',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_name', 'created_at', 'updated_at']