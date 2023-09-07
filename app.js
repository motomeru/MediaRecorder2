var getUserMedia = navigator.mediaDevices.getUserMedia;

function gatherWebRTCStream() {
  var constraints = {
    audio: true,
    video: true
  };

  getUserMedia(constraints).then(function(stream) {
    var peerConnection = new RTCPeerConnection();

    peerConnection.onnegotiationneeded = function() {
      var offer = peerConnection.createOffer();
      peerConnection.setLocalDescription(offer);

      // Send the offer to the remote site.
    };

    peerConnection.onicecandidate = function(event) {
      // Send the ICE candidate to the remote site.
    };

    peerConnection.onconnectionsuccess = function() {
      // Get the stream from the remote site.
      var remoteStream = peerConnection.getStream();

      // Create a download button.
      var downloadButton = document.querySelector('button');

      downloadButton.onclick = function() {
        var blob = await remoteStream.getBlob();

        // Create a download link.
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'my-stream.webm';

        // Show the download link.
        document.body.appendChild(link);

        // Click the download link to download the stream.
        link.click();
      };
    };

    peerConnection.connect();
  });
}