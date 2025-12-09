from rest_framework import generics, permissions
from .models import Category, Service, ServiceImage, Availability
from .serializers import CategorySerializer, ServiceSerializer, ServiceImageSerializer, AvailabilitySerializer

class CategoryListView(generics.ListCreateAPIView):
    """
    View for listing all categories or creating a new category
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View for retrieving, updating or deleting a specific category
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class ServiceListView(generics.ListCreateAPIView):
    """
    View for listing all services or creating a new service
    """
    queryset = Service.objects.filter(is_available=True)
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Set the provider to the current user when creating a service
        serializer.save(provider=self.request.user)

class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View for retrieving, updating or deleting a specific service
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProviderServiceListView(generics.ListAPIView):
    """
    View for listing all services by a specific provider
    """
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return services for the current provider
        return Service.objects.filter(provider=self.request.user, is_available=True)

class ServiceImageListView(generics.ListCreateAPIView):
    """
    View for listing all images for a service or adding a new image
    """
    serializer_class = ServiceImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filter images by service ID from URL parameters
        service_id = self.kwargs['service_id']
        return ServiceImage.objects.filter(service_id=service_id)
    
    def perform_create(self, serializer):
        # Set the service from the URL parameter when creating an image
        service_id = self.kwargs['service_id']
        serializer.save(service_id=service_id)

class AvailabilityListView(generics.ListCreateAPIView):
    """
    View for listing all availability slots for a service or adding a new slot
    """
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filter availability by service ID from URL parameters
        service_id = self.kwargs['service_id']
        return Availability.objects.filter(service_id=service_id)
    
    def perform_create(self, serializer):
        # Set the service from the URL parameter when creating availability
        service_id = self.kwargs['service_id']
        serializer.save(service_id=service_id)