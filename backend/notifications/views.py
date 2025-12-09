from rest_framework import generics, permissions
from .models import Notification, UserNotificationPreference
from .serializers import NotificationSerializer, UserNotificationPreferenceSerializer

class NotificationListView(generics.ListAPIView):
    """
    View for listing all notifications for the current user
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return notifications for the current user, ordered by creation date
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by('-created_at')

class UnreadNotificationListView(generics.ListAPIView):
    """
    View for listing all unread notifications for the current user
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return unread notifications for the current user
        return Notification.objects.filter(
            recipient=self.request.user,
            is_read=False
        ).order_by('-created_at')

class MarkNotificationAsReadView(generics.UpdateAPIView):
    """
    View for marking a notification as read
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        # Get the notification instance
        instance = self.get_object()
        
        # Check if the notification belongs to the current user
        if instance.recipient != request.user:
            return Response(
                {'error': 'You do not have permission to mark this notification as read'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Mark as read and set read_at timestamp
        instance.is_read = True
        if not instance.read_at:
            instance.read_at = timezone.now()
        instance.save()
        
        # Return updated notification data
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class UserNotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """
    View for retrieving or updating the current user's notification preferences
    """
    serializer_class = UserNotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Get or create preferences for the current user
        preferences, created = UserNotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preferences