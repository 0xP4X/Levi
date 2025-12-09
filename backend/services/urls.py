from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('services/', views.ServiceListView.as_view(), name='service-list'),
    path('services/<int:pk>/', views.ServiceDetailView.as_view(), name='service-detail'),
    path('providers/<int:provider_id>/services/', views.ProviderServiceListView.as_view(), name='provider-service-list'),
    path('services/<int:service_id>/images/', views.ServiceImageListView.as_view(), name='service-image-list'),
    path('services/<int:service_id>/availability/', views.AvailabilityListView.as_view(), name='service-availability-list'),
]