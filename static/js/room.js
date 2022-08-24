let displayFrame = document.getElementById('stream__box')
let videoFrames = document.getElementsByClassName('video-container')
let userIdInDisplayFrame = null;

let expandVideoFrame = (e) => {

  displayFrame.style.display = 'flex'
  displayFrame.appendChild(e.currentTarget)
  userIdInDisplayFrame = e.currentTarget.id
  document.getElementById('video-streams').style.display = "none";

}



let hideDisplayFrame = () => {
    userIdInDisplayFrame = null
    displayFrame.style.display = 'none'

    let child = displayFrame.children[0]
    document.getElementById('video-streams').appendChild(child)
    document.getElementById('video-streams').style.display = 'flex'
}

displayFrame.addEventListener('click', hideDisplayFrame)