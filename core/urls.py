from django.urls import path
from . import views

urlpatterns = [
    path('', views.lobby),
    path('create_room/', views.createRoom),
    path('room/', views.room),
    path('get_token/', views.getToken),
    path('get_host/', views.getHost),
    path('create_member/', views.createMember),
    path('get_member/', views.getMember),
    path('delete_member/', views.deleteMember),
    path('delete_room/', views.deleteRoom),
    # path('vote_room/', views.voteRoom),
    # path('check_votes/', views.checkVotes),
]