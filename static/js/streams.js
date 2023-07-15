const APP_ID = '1fbdb360d32d45c3aabfa196b4293d8d'
const TOKEN = sessionStorage.getItem('token')
const CHANNEL = sessionStorage.getItem('code')
let UID = sessionStorage.getItem('UID')
let token_rtm = sessionStorage.getItem('token_rtm')

let NAME = sessionStorage.getItem('name')

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

let localTracks = []
let remoteUsers = {}
let rtmClient;
let channel
let total_users = 1;
let extras = 2;
let votes_yes = 0;
let votes_no = 0;
let id_timeout = 0;
let start;
let id_large;
let sharing_screen = false;
let localScreenTracks;

let joinAndDisplayLocalStream = async () => {
    document.getElementById('room_ans').innerText = "Room : " + CHANNEL
    if (sessionStorage.getItem('is_host') == "true") {
        create_room();
    }
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    try {
        rtmClient = await AgoraRTM.createInstance(APP_ID, { enableLogUpload: false })
        await rtmClient.login({ uid: UID, token: token_rtm })
        await rtmClient.addOrUpdateLocalUserAttributes({ 'name': sessionStorage.getItem('name') })

        channel = await rtmClient.createChannel(sessionStorage.getItem('code'))
        await channel.join()
        rtmClient.on('MessageFromPeer', function ({
            text
        }, peerId) {
            if (text == "video") {
                document.getElementById('camera-btn').click()
            }
            else if (text == "audio") {
                document.getElementById('mic-btn').click()
            }
            else if (text == "show_poll") {
                document.getElementById('poll').style.display = "block"
                document.getElementById('timing_form').style.display = "block"
                document.getElementById('main_div').style.display = "none"
            }
            else if (text == "yes") {
                votes_yes++;
            }
            else if (text == "no") {
                votes_no++;
            }
            else if (text == "extended") {
                show_extended()
            }
            else if (text == "show_important_alert") {
                show_important_alert();
            }
        })
        channel.on('MemberJoined', handleMemberJoined)
        channel.on('MemberLeft', handleMemberLeft)
        channel.on('ChannelMessage', handleChannelMessage)
        getMembers()
        addBotMessageToDom(`Welcome to the room ${sessionStorage.getItem('name')}! 👋`)
        UID = await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch (error) {
        console.error(error)
        window.open('/', '_self')
    }

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let member = await createMember()

    let player = `<div  class="video-container" id="user-container-${UID}">
                     <div class="video-player" id="user-${UID}"></div>
                     <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                  </div>`

    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    document.getElementById(`user-container-${UID}`).addEventListener('click', expandVideoFrame)
    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[0], localTracks[1]])
}

let handleUserJoined = async (user, mediaType) => {
    total_users += 1;
    remoteUsers[user.uid] = user

    await client.subscribe(user, mediaType)

    if (mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null) {
            player.remove()
        }

        let member = await getMember(user)

        player = `<div  class="video-container" id="user-container-${user.uid}">
            <div class="video-player" id="user-${user.uid}"></div>
            <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
        </div>`

        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame)
        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio') {
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    total_users -= 1;
    if (user.uid == sessionStorage.getItem('uid_host')) {
        leaveAndRemoveLocalStream();
    }
    delete remoteUsers[user.uid]
}

let leaveAndRemoveLocalStream = async () => {
    for (let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    await rtmClient.logout();
    if (sessionStorage.getItem('is_host') == "true") {
        deleteRoom()
    }
    else {
        deleteMember()
    }
    window.open('/', '_self')
}

let toggleCamera = async (e) => {
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
}

let toggleMic = async (e) => {
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
}

let createMember = async () => {
    let response = await fetch('/create_member/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'name': NAME, 'room_name': CHANNEL, 'UID': UID })
    })
    let member = await response.json()
    return member
}


let getMember = async (user) => {
    let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member
}

let deleteMember = async () => {
    let response = await fetch('/delete_member/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'UID': UID })
    })
    let member = await response.json()
    leaveAndRemoveLocalStream()
}

let deleteRoom = async () => {
    let response = await fetch('/delete_room/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'code': sessionStorage.getItem('code'), 'uid': UID })
    })
    let member = await response.json()
    leaveAndRemoveLocalStream()
}

let handleMemberJoined = async (MemberId) => {
    addMemberToDom(MemberId)

    let members = await channel.getMembers()
    updateMemberTotal(members)

    let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])
    addBotMessageToDom(`Welcome to the room ${name}! 👋`)
}

let updateMemberTotal = async (members) => {
    let total = document.getElementById('members__count')
    total.innerText = members.length
    total_users = members.length
}

let addMemberToDom = async (MemberId) => {
    let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])

    let membersWrapper = document.getElementById('member__list')
    let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${name}</p>
                    </div>`

    membersWrapper.insertAdjacentHTML('beforeend', memberItem)
}


let handleMemberLeft = async (MemberId) => {
    removeMemberFromDom(MemberId)

    let members = await channel.getMembers()
    updateMemberTotal(members)
}

let removeMemberFromDom = async (MemberId) => {
    let memberWrapper = document.getElementById(`member__${MemberId}__wrapper`)
    let name = memberWrapper.getElementsByClassName('member_name')[0].textContent
    addBotMessageToDom(`${name} has left the room.`)

    memberWrapper.remove()
}

let getMembers = async () => {
    let members = await channel.getMembers()
    updateMemberTotal(members)
    for (let i = 0; members.length > i; i++) {
        addMemberToDom(members[i])
    }
}

let send_message = (message, to) => {
    rtmClient.sendMessageToPeer({
        text: message
    },
        to,
    ).then(sendResult => {
        if (sendResult.hasPeerReceived) {
        } else {
        }
    })
}

let remote_actions = (action) => {
    for (let key in remoteUsers) {
        send_message(action, key)
    }
}
let mute_remote_audio = () => {
    for (let key in remoteUsers) {
        send_message("audio", key)
    }
}

let mute_remote_video = () => {
    for (let key in remoteUsers) {
        send_message("video", key)
    }
}

let wrap_up = () => {
    document.getElementById('extend_div').style.display = "block";
    let new_alert = `<div class="alert">
            <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
            <strong>Alert!</strong>&nbsp;&nbsp; Wrap up Fast.
        </div>`

    document.getElementById('alerts').insertAdjacentHTML('beforeend', new_alert)
    clearTimeout(id_timeout);
    let current = new Date().getTime()
    let duration = (start + (sessionStorage.getItem('duration') * 1000))
    let time_out = duration - current
    id_timeout = setTimeout(check_votes, time_out);
}

let delete_all = () => {
    deleteRoom();
    deleteMember()
}

let check_votes = () => {
    if (votes_no > votes_yes || votes_yes == 0) {
        leaveAndRemoveLocalStream();
    }
    else {
        extras--;
        for (let key in remoteUsers) {
            send_message("extended", key)
        }
        votes_no = 0;
        votes_yes = 0;
        show_extended();
        clearTimeout(id_timeout)
        let duration = sessionStorage.getItem('duration')
        let ans = parseInt(duration) + 300
        sessionStorage.setItem('duration', ans)
        id_timeout = setTimeout(wrap_up, 180000);
    }
}

let show_extended = () => {
    let new_alert = `<div class="alert">
            <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
            <strong>Alert!</strong>&nbsp;&nbsp; Meeting Extended
        </div>`

    document.getElementById('alerts').insertAdjacentHTML('beforeend', new_alert)

}

let vote = () => {
    let option = document.querySelector('input[name="selector_1"]:checked').value;
    document.getElementById('poll').style.display = "none"
    document.getElementById('timing_form').style.display = "none"
    document.getElementById('main_div').style.display = "flex"
    send_message(option, sessionStorage.getItem('uid_host'))
}

let show_more_panel = (e) => {
    if (sessionStorage.getItem('is_host') == 'true') {
    }
    if (document.getElementById('more_controls').style.display == "block") {
        document.getElementById('more_controls').style.display = "none";
        document.getElementById('video-streams').style.paddingTop = "2%"
        document.getElementById('video-streams').style.paddingBottom = "1%"
        document.getElementById('message__form').style.width = "16.25rem"
        e.target.style.backgroundColor = '#fff'
    } else {
        document.getElementById('more_controls').style.display = "block";
        document.getElementById('video-streams').style.paddingTop = "2.5%"
        document.getElementById('video-streams').style.paddingBottom = "2.5%"
        document.getElementById('message__form').style.width = "13.5rem"
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
}



let handleChannelMessage = async (messageData, MemberId) => {
    let data = JSON.parse(messageData.text)

    if (data.type === 'chat') {
        addMessageToDom(data.displayName, data.message)
    }

    if (data.type == 'transcription') {
        addImportantToDom(data.displayName, data.message)
    }
}

let sendMessage = async (e) => {
    e.preventDefault()

    let message = e.target.message.value
    channel.sendMessage({ text: JSON.stringify({ 'type': 'chat', 'message': message, 'displayName': sessionStorage.getItem('name') }) })
    addMessageToDom(sessionStorage.getItem('name'), message)
    e.target.reset()
}

let addMessageToDom = (name, message) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage = `<div class="message__wrapper">
    <div class="message__body">
    <strong class="message__author">${name}</strong>
                            <p class="message__text">${message}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if (lastMessage) {
        lastMessage.scrollIntoView()
    }
}

let addImportantToDom = (name, message) => {
    let messagesWrapper = document.getElementById('important_messages')

    let newMessage = `<div class="message__wrapper">
    <div class="message__body">
    <strong class="message__author">${name}</strong>
                            <p class="message__text">${message}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if (lastMessage) {
        lastMessage.scrollIntoView()
    }
}

let addBotMessageToDom = (botMessage) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage = `<div class="message__wrapper">
                        <div class="message__body__bot">
                            <strong class="message__author__bot">🤖 Conference Time Bot</strong>
                            <p class="message__text__bot">${botMessage}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if (lastMessage) {
        lastMessage.scrollIntoView()
    }
}

let extend_meeting = () => {
    document.getElementById('extend_div').style.display = "none"
    if (extras <= 0) {
        alert('Meeting can not be extended any more')
    }
    else {
        remote_actions("show_poll")
    }
}

let create_room = async () => {
    let response = await fetch('/create_room/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // "X-CSRFToken": csrftoken
        },
        body: JSON.stringify({ 'name': sessionStorage.getItem('room'), 'code': sessionStorage.getItem('code'), 'expire': sessionStorage.getItem('duration'), 'host': sessionStorage.getItem('UID') })
    })
    let room = await response.json();
    call_reminder()
}

let call_reminder = () => {
    let current = new Date().getTime()
    start = current;
    let duration = current + (sessionStorage.getItem('duration') * 1000) - 300000
    let time_out = duration - current
    id_timeout = setTimeout(wrap_up, time_out);
}

let switchToCamera = async () => {
    let player = `<div  class="video-container" id="user-container-${UID}">
                     <div class="video-player" id="user-${UID}"></div>
                     <div class="username-wrapper"><span class="user-name">${NAME}</span></div>
                  </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    document.getElementById(`user-container-${UID}`).addEventListener('click', expandVideoFrame)

    await localTracks[0].setMuted(true)
    await localTracks[1].setMuted(true)
    document.getElementById('mic-btn').style.backgroundColor = 'rgb(255, 80, 80, 1)'
    document.getElementById('camera-btn').style.backgroundColor = 'rgb(255, 80, 80, 1)'
    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[1]])
    document.getElementById('video-streams').style.display = 'flex';
    document.getElementById('stream__box').style.display = 'none';
}

let toggleScreen = async (e) => {
    if (sharing_screen == false) {
        sharing_screen = true;
        document.getElementById('screen-btn').style.backgroundColor = 'rgb(255, 80, 80, 1)'
        document.getElementById('camera-btn').style.display = "none";
        localScreenTracks = await AgoraRTC.createScreenVideoTrack()

        document.getElementById(`user-container-${UID}`).remove()
        let player = `<div  class="video-container" id="user-container-${UID}">
                     <div class="video-player" id="user-${UID}"></div>
                     <div class="username-wrapper"><span class="user-name">${NAME}</span></div>
                  </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${UID}`).addEventListener('click', expandVideoFrame)
        localScreenTracks.play(`user-${UID}`)

        await client.unpublish([localTracks[1]])
        await client.publish([localScreenTracks])
    }
    else {
        sharing_screen = false
        document.getElementById('camera-btn').style.display = "block";
        document.getElementById(`user-container-${UID}`).remove()
        await client.unpublish([localScreenTracks])
        localScreenTracks.stop()
        localScreenTracks.close()
        document.getElementById('screen-btn').style.backgroundColor = '#fff'
        switchToCamera()
    }
}

let show_important_alert = () => {
    let new_alert = `<div class="alert">
            <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
            <strong>Alert!</strong>&nbsp;&nbsp; Pay Attention
        </div>`

    document.getElementById('alerts').insertAdjacentHTML('beforeend', new_alert)
}

let switch_chat_important = () => {
    let button = document.getElementById('switch_button')
    if (button.textContent == "Chat") {
        button.textContent = "Important"
        document.getElementById('messages').style.display = "none";
        document.getElementById('important_messages').style.display = "block"
        document.getElementById('message__form').style.display = "none"
        document.getElementById('messages__container').style.height = "100vh";
    }
    else if (button.textContent == "Important") {
        button.textContent = "Chat"
        document.getElementById('messages').style.display = "block";
        document.getElementById('important_messages').style.display = "none"
        document.getElementById('message__form').style.display = "block"
        document.getElementById('messages__container').style.height = "93vh";
    }
}

let messageForm = document.getElementById('message__form')

joinAndDisplayLocalStream()

window.addEventListener("beforeunload", delete_all);

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('screen-btn').addEventListener('click', toggleScreen)
document.getElementById('more-btn').addEventListener('click', show_more_panel)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('extend_meeting').addEventListener('click', extend_meeting)
document.getElementById('switch_button').addEventListener('click', switch_chat_important)
messageForm.addEventListener('submit', sendMessage)
document.getElementById('send_poll_result').addEventListener('click', vote)
