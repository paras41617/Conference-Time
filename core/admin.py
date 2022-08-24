from django.contrib import admin

# Register your models here.

from .models import RoomMember ,Room


admin.site.register(RoomMember)
admin.site.register(Room)