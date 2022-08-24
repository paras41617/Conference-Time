from django.db import models

# Create your models here.

class Room(models.Model):
    name = models.CharField(max_length=200)
    host = models.CharField(max_length=200 , default=None)
    code = models.CharField(max_length=200) 
    start = models.DateTimeField()
    expire = models.DateTimeField()
    def __str__(self):
        return self.name

class RoomMember(models.Model):
    name = models.CharField(max_length=200)
    uid = models.CharField(max_length=1000)
    room_name = models.CharField(max_length=200)

    def __str__(self):
        return self.name