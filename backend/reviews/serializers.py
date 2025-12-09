from rest_framework import serializers
from .models import Review, ReviewComment, ReviewHelpfulVote

class ReviewHelpfulVoteSerializer(serializers.ModelSerializer):
    """
    Serializer for the ReviewHelpfulVote model
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = ReviewHelpfulVote
        fields = ['id', 'user', 'user_name', 'is_helpful', 'created_at']
        read_only_fields = ['id', 'created_at']

class ReviewCommentSerializer(serializers.ModelSerializer):
    """
    Serializer for the ReviewComment model
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = ReviewComment
        fields = ['id', 'user', 'user_name', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for the Review model
    """
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    reviewee_name = serializers.CharField(source='reviewee.get_full_name', read_only=True)
    service_title = serializers.CharField(source='service.title', read_only=True)
    helpful_votes = ReviewHelpfulVoteSerializer(many=True, read_only=True)
    comments = ReviewCommentSerializer(many=True, read_only=True)
    helpful_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'booking', 'reviewer', 'reviewer_name', 'reviewee', 'reviewee_name',
            'service', 'service_title', 'rating', 'title', 'comment', 'status',
            'is_anonymous', 'images', 'helpful_count', 'reported_count', 'created_at',
            'updated_at', 'approved_at', 'rejected_at', 'helpful_votes', 'comments'
        ]
        read_only_fields = [
            'id', 'reviewer_name', 'reviewee_name', 'service_title', 'helpful_count',
            'reported_count', 'created_at', 'updated_at', 'approved_at', 'rejected_at',
            'helpful_votes', 'comments'
        ]
    
    def get_helpful_count(self, obj):
        """
        Get the count of helpful votes for this review
        """
        return obj.helpful_votes.filter(is_helpful=True).count()