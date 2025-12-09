from rest_framework import serializers
from .models import Category, Service, ServiceImage, Availability

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for the Category model
    """
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'icon', 'parent',
            'parent_name', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ServiceImageSerializer(serializers.ModelSerializer):
    """
    Serializer for the ServiceImage model
    """
    class Meta:
        model = ServiceImage
        fields = ['id', 'image', 'is_primary', 'alt_text', 'created_at']
        read_only_fields = ['id', 'created_at']


class AvailabilitySerializer(serializers.ModelSerializer):
    """
    Serializer for the Availability model
    """
    class Meta:
        model = Availability
        fields = ['id', 'day_of_week', 'start_time', 'end_time', 'is_available']
        read_only_fields = ['id']


class ServiceSerializer(serializers.ModelSerializer):
    """
    Serializer for the Service model
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    provider_name = serializers.CharField(source='provider.get_full_name', read_only=True)
    images = ServiceImageSerializer(many=True, read_only=True)
    availability = AvailabilitySerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            'id', 'provider', 'provider_name', 'category', 'category_name',
            'title', 'description', 'price', 'duration', 'location_type',
            'service_area', 'is_available', 'is_featured', 'images',
            'availability', 'average_rating', 'review_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'provider_name', 'category_name', 'images', 'availability', 'average_rating', 'review_count', 'created_at', 'updated_at']
    
    def get_average_rating(self, obj):
        """
        Get the average rating for this service
        """
        # This will be implemented when we add reviews
        return 0
    
    def get_review_count(self, obj):
        """
        Get the number of reviews for this service
        """
        # This will be implemented when we add reviews
        return 0