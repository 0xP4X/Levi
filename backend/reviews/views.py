from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Review, ReviewComment, ReviewHelpfulVote
from .serializers import ReviewSerializer, ReviewCommentSerializer, ReviewHelpfulVoteSerializer

class ReviewListView(generics.ListCreateAPIView):
    """
    View for listing all reviews or creating a new review
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can see all approved reviews, but only their own pending ones
        return Review.objects.filter(
            models.Q(status=Review.ReviewStatus.APPROVED) |
            models.Q(reviewer=self.request.user)
        )
    
    def perform_create(self, serializer):
        # Set reviewer to current user when creating a review
        serializer.save(reviewer=self.request.user)

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View for retrieving, updating or deleting a specific review
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserReviewListView(generics.ListAPIView):
    """
    View for listing all reviews written by the current user
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return reviews where the current user is the reviewer
        return Review.objects.filter(reviewer=self.request.user)

class ServiceReviewListView(generics.ListAPIView):
    """
    View for listing all reviews for a specific service
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        # Filter reviews by service ID from URL parameters
        service_id = self.kwargs['service_id']
        return Review.objects.filter(service_id=service_id, status=Review.ReviewStatus.APPROVED)

class ReviewCommentListView(generics.ListCreateAPIView):
    """
    View for listing all comments for a review or adding a new comment
    """
    serializer_class = ReviewCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filter comments by review ID from URL parameters
        review_id = self.kwargs['review_id']
        return ReviewComment.objects.filter(review_id=review_id)
    
    def perform_create(self, serializer):
        # Set the review from the URL parameter when creating a comment
        review_id = self.kwargs['review_id']
        serializer.save(review_id=review_id)

class ReviewHelpfulVoteListView(generics.ListCreateAPIView):
    """
    View for listing all helpful votes for a review or adding a new vote
    """
    serializer_class = ReviewHelpfulVoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filter helpful votes by review ID from URL parameters
        review_id = self.kwargs['review_id']
        return ReviewHelpfulVote.objects.filter(review_id=review_id)
    
    def perform_create(self, serializer):
        # Set the review and user when creating a helpful vote
        review_id = self.kwargs['review_id']
        serializer.save(review_id=review_id, user=self.request.user)