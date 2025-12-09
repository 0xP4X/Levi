from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from .models import User, UserProfile
from .serializers import UserSerializer, UserProfileSerializer, UserRegistrationSerializer

class UserListView(generics.ListCreateAPIView):
    """
    View for listing all users or creating a new user
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View for retrieving, updating or deleting a specific user
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    """
    View for retrieving or updating the current user's profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Get or create profile for the current user
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class UserRegistrationView(generics.CreateAPIView):
    """
    View for user registration
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(APIView):
    """
    View for user login
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if email is None or password is None:
            return Response(
                {'error': 'Please provide both email and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(email=email, password=password)
        
        if not user:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Here you would typically generate a token or session
        # For now, we'll just return user data
        serializer = UserSerializer(user)
        return Response(serializer.data)