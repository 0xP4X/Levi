from django.urls import path
from . import views

urlpatterns = [
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/unread/', views.UnreadNotificationListView.as_view(), name='unread-notification-list'),
    path('notifications/<int:pk>/mark-read/', views.MarkNotificationAsReadView.as_view(), name='mark-notification-as-read'),
    path('notifications/preferences/', views.UserNotificationPreferenceView.as_view(), name='user-notification-preferences'),
]