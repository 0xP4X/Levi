from django.urls import path
from . import views

urlpatterns = [
    path('payments/', views.PaymentListView.as_view(), name='payment-list'),
    path('payments/<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    path('users/<int:user_id>/payments/', views.UserPaymentListView.as_view(), name='user-payment-list'),
    path('bookings/<int:booking_id>/payment/', views.BookingPaymentDetailView.as_view(), name='booking-payment-detail'),
    path('payments/<int:payment_id>/refunds/', views.RefundListView.as_view(), name='refund-list'),
]