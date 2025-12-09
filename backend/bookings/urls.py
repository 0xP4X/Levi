from django.urls import path
from . import views

urlpatterns = [
    path('bookings/', views.BookingListView.as_view(), name='booking-list'),
    path('bookings/<int:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
    path('clients/<int:client_id>/bookings/', views.ClientBookingListView.as_view(), name='client-booking-list'),
    path('providers/<int:provider_id>/bookings/', views.ProviderBookingListView.as_view(), name='provider-booking-list'),
    path('bookings/<int:booking_id>/change-logs/', views.BookingChangeLogListView.as_view(), name='booking-change-log-list'),
]