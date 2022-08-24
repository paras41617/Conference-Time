var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();
recognition.lang = "en-GB";
var transContent = "";
recognition.continuous = true;

let start_transcription = () => {
    document.getElementById('start_transcript').style.display = "none";
    document.getElementById('stop_transcript').style.display = "flex";
    remote_actions('show_important_alert')
    if (transContent.length) {
        transContent += ' ';
    }
    recognition.start();
}

let stop_transcription = async () => {
    document.getElementById('start_transcript').style.display = "flex";
    document.getElementById('stop_transcript').style.display = "none";
    recognition.stop();
    recognition.onresult = function (event) {
        var current = event.resultIndex;
        var transcript = event.results[current][0].transcript;
        transContent = transContent + transcript + "<br>";
        singleMessage = transContent;
        channel.sendMessage({ text: JSON.stringify({ 'type': 'transcription', 'message': singleMessage, 'displayName': NAME }) })
    }
}

if (sessionStorage.getItem('is_host') == 'true') {
    document.getElementById('start_transcript').style.display = "flex";
}

document.getElementById('start_transcript').addEventListener('click', start_transcription);
document.getElementById('stop_transcript').addEventListener('click', stop_transcription);