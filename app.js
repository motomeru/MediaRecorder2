const localAudio = document.getElementById('localAudio');
const remoteAudio = document.getElementById('remoteAudio');
const startPeerBtn = document.getElementById('startPeer');

const startLocalRecordingBtn = document.getElementById('startLocalRecording');
const stopLocalRecordingBtn = document.getElementById('stopLocalRecording');
const startRemoteRecordingBtn = document.getElementById('startRemoteRecording');
const stopRemoteRecordingBtn = document.getElementById('stopRemoteRecording');

let localStream;
let remoteStream;

let localRecorder;
let remoteRecorder;

// Basic STUN server configuration
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

const pc1 = new RTCPeerConnection(configuration);
const pc2 = new RTCPeerConnection(configuration);

// Handle the creation of the answer
pc1.onicecandidate = event => pc2.addIceCandidate(event.candidate);
pc2.onicecandidate = event => pc1.addIceCandidate(event.candidate);

// When remote stream arrives, display it in the remote audio element
pc2.ontrack = event => {
    remoteAudio.srcObject = event.streams[0];
    remoteStream = event.streams[0];
};

startPeerBtn.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localAudio.srcObject = stream;
    localStream = stream;

    stream.getTracks().forEach(track => pc1.addTrack(track, stream));

    const offer = await pc1.createOffer();
    await pc1.setLocalDescription(offer);
    await pc2.setRemoteDescription(offer);

    const answer = await pc2.createAnswer();
    await pc2.setLocalDescription(answer);
    await pc1.setRemoteDescription(answer);
});

startLocalRecordingBtn.addEventListener('click', () => {
    localRecorder = new MediaRecorder(localStream);
    localRecorder.start();
    // TODO: Handle ondataavailable for localRecorder as per your requirements
});

stopLocalRecordingBtn.addEventListener('click', () => {
    localRecorder.stop();
});

startRemoteRecordingBtn.addEventListener('click', () => {
    remoteRecorder = new MediaRecorder(remoteStream);
    remoteRecorder.start();
    // TODO: Handle ondataavailable for remoteRecorder as per your requirements
});

stopRemoteRecordingBtn.addEventListener('click', () => {
    remoteRecorder.stop();
});
