from django.urls import path
from . import views

urlpatterns = [
    path('reviews/', views.ReviewListView.as_view(), name='review-list'),
    path('reviews/<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    path('users/<int:user_id>/reviews/', views.UserReviewListView.as_view(), name='user-review-list'),
    path('services/<int:service_id>/reviews/', views.ServiceReviewListView.as_view(), name='service-review-list'),
    path('reviews/<int:review_id>/comments/', views.ReviewCommentListView.as_view(), name='review-comment-list'),
    path('reviews/<int:review_id>/helpful-votes/', views.ReviewHelpfulVoteListView.as_view(), name='review-helpful-vote-list'),
]