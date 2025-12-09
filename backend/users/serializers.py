from rest_framework import serializers
from .models import User, UserProfile

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'date_of_birth', 'is_provider', 'is_admin',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserProfile model
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'bio', 'location', 'website',
            'social_media_links', 'preferred_categories', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'phone_number', 'date_of_birth',
            'is_provider'
        ]

    def validate(self, data):
        """
        Validate that passwords match
        """
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        """
        Create a new user with hashed password
        """
        # Remove confirm_password from validated_data
        validated_data.pop('confirm_password')
        
        # Create user with hashed password
        user = User.objects.create_user(**validated_data)
        return user