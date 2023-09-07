const startRecordingBtn = document.getElementById('startRecording');
const stopRecordingBtn = document.getElementById('stopRecording');
const recordingsList = document.getElementById('recordingsList');

let localStream;
let remoteStream;
let localRecorder;
let remoteRecorder;
let localChunks = [];
let remoteChunks = [];

// Basic STUN server configuration
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

const pc1 = new RTCPeerConnection(configuration);
const pc2 = new RTCPeerConnection(configuration);

pc1.onicecandidate = event => pc2.addIceCandidate(event.candidate);
pc2.onicecandidate = event => pc1.addIceCandidate(event.candidate);

pc2.ontrack = event => {
    remoteStream = event.streams[0];
    remoteRecorder = new MediaRecorder(remoteStream);
    remoteRecorder.ondataavailable = event => {
        remoteChunks.push(event.data);
    };
    remoteRecorder.onstop = createDownloadLinkForRemote;
    remoteRecorder.start();
};

async function startRecording() {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localRecorder = new MediaRecorder(localStream);
    localRecorder.ondataavailable = event => {
        localChunks.push(event.data);
    };
    localRecorder.onstop = createDownloadLinkForLocal;
    localRecorder.start();

    localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));

    const offer = await pc1.createOffer();
    await pc1.setLocalDescription(offer);
    await pc2.setRemoteDescription(offer);
    
    const answer = await pc2.createAnswer();
    await pc2.setLocalDescription(answer);
    await pc1.setRemoteDescription(answer);
}

function stopAllRecording() {
    if (localRecorder && localRecorder.state === "recording") {
        localRecorder.stop();
    }

    if (remoteRecorder && remoteRecorder.state === "recording") {
        remoteRecorder.stop();
    }
}

function createDownloadLinkForLocal() {
    const blob = new Blob(localChunks, { type: "audio/ogg; codecs=opus" });
    const url = URL.createObjectURL(blob);
    createDownloadElement("Local Recording", url);
}

function createDownloadLinkForRemote() {
    const blob = new Blob(remoteChunks, { type: "audio/ogg; codecs=opus" });
    const url = URL.createObjectURL(blob);
    createDownloadElement("Remote Recording", url);
}

function createDownloadElement(label, url) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${label}.ogg`;
    a.innerHTML = a.download;
    li.appendChild(a);
    recordingsList.appendChild(li);
}

startRecordingBtn.addEventListener('click', startRecording);
stopRecordingBtn.addEventListener('click', stopAllRecording);
