from asyncio import constants
import code
from tracemalloc import start
from unicodedata import name
from django.shortcuts import render
from django.http import JsonResponse
import random
import time
from agora_token_builder import RtcTokenBuilder, RtmTokenBuilder
from .models import RoomMember, Room
import json
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
import json
import requests

# Create your views here.


def lobby(request):
    return render(request, "lobby.html")


def room(request):
    return render(request, "room.html")


@csrf_exempt
def createRoom(request):
    data = json.loads(request.body)
    room, created = Room.objects.get_or_create(
        name=data["name"],
        code=data["code"],
        host=data["host"],
        start=datetime.now(),
        expire=datetime.now() + timedelta(seconds=int(data["expire"])),
    )
    return JsonResponse({"name": data["name"]}, safe=False)


def getToken(request):
    appId = "1fbdb360d32d45c3aabfa196b4293d8d"
    appCertificate = "a1e49f0130714a8d92a64c54ae4a4859"
    channelName = request.GET.get("channel")
    uid = str(random.randint(1, 230))
    expirationTimeInSeconds = 3600
    currentTimeStamp = int(time.time())
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1

    token = RtcTokenBuilder.buildTokenWithAccount(
        appId, appCertificate, channelName, uid, role, privilegeExpiredTs
    )
    token_rtm = RtmTokenBuilder.buildToken(
        appId, appCertificate, uid, role, privilegeExpiredTs
    )
    return JsonResponse(
        {"token": token, "uid": uid, "token_rtm": token_rtm}, safe=False
    )


@csrf_exempt
def getHost(request):
    data = json.loads(request.body)
    room = Room.objects.get(code=data["code"])
    host = room.host
    # start = room.start.strftime("%B %d , %Y %H:%M:%S")
    # expire = room.expire.strftime("%B %d , %Y %H:%M:%S")
    user = RoomMember.objects.get(uid=host)
    uid = user.uid
    return JsonResponse({"host": host, "uid": uid}, safe=False)


@csrf_exempt
def createMember(request):
    data = json.loads(request.body)
    member, created = RoomMember.objects.get_or_create(
        name=data["name"],
        uid=data["UID"],
        room_name=data["room_name"],
    )
    return JsonResponse({"name": data["name"]}, safe=False)


def getMember(request):
    uid = request.GET.get("UID")
    room_name = request.GET.get("room_name")

    member = RoomMember.objects.get(
        uid=uid,
        room_name=room_name,
    )
    name = member.name
    return JsonResponse({"name": member.name}, safe=False)


@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)
    member = RoomMember.objects.get(
        uid=data["UID"],
    )
    member.delete()
    return JsonResponse("Member deleted", safe=False)


@csrf_exempt
def deleteRoom(request):
    data = json.loads(request.body)
    room = Room.objects.get(code=data["code"])
    room.delete()
    member = RoomMember.objects.get(
        uid=data["uid"],
    )
    member.delete()
    return JsonResponse("Room deleted", safe=False)

@csrf_exempt
def createWhiteboard(request):
    url = "https://api.netless.link/v5/rooms"
    headers = {
        "token": "NETLESSSDK_YWs9amZFbjZTX3hnQVZJRThZdyZub25jZT0yN2MzOGYwMC0yMmZhLTExZWUtYTEzOS02OTk3ZjkwNzdkYTImcm9sZT0wJnNpZz03OTcwOTBlMmYwMDhiMDQxNzNjNDY0NjhjYzBjNDI1ZDA3NjVjYTBiYmVkMDY1NmEwNjI0ODZlNmIxNTYwYjIw",
        "Content-Type": "application/json",
        "region": "us-sv"
    }
    data = {
        "isRecord": False
    }

    response = requests.post(url, headers=headers, json=data)
    response_json = response.json()
    uuid = response_json["uuid"]
    url = f'https://api.netless.link/v5/tokens/rooms/{uuid}'
    headers = {
        "token": "NETLESSSDK_YWs9amZFbjZTX3hnQVZJRThZdyZub25jZT0yN2MzOGYwMC0yMmZhLTExZWUtYTEzOS02OTk3ZjkwNzdkYTImcm9sZT0wJnNpZz03OTcwOTBlMmYwMDhiMDQxNzNjNDY0NjhjYzBjNDI1ZDA3NjVjYTBiYmVkMDY1NmEwNjI0ODZlNmIxNTYwYjIw",
        "Content-Type": "application/json",
        "region": "us-sv"
    }
    data = {
        "lifespan": 3600000,
        "role": "admin"
    }

    response = requests.post(url, headers=headers, json=data)
    response_json = response.json()
    room_token = response_json
    return JsonResponse({"uid":uuid, "token":room_token },safe=False)