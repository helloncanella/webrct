/*global RTCPeerConnection, io, RTCSessionDescription*/

var remoteSessionDesciption;
var socket = io.connect();

var servers = null;
var connection = new RTCPeerConnection(servers);

var callButton = document.getElementById('call');

callButton.onclick = function(){
  connection.createOffer(getOfferSDP, onFailure);
}

socket.on('message', function(message){
  var type = message.type;

  switch (type) {
    
    case 'offer':
      var offer = message;
      setRemoteDescription(offer);
      createAnswer();
      break;

    case 'answer':
      var answer = message;
      setRemoteDescription(answer);
      break;

    default:
  }
});

function createAnswer(){
  connection.createAnswer(getAnswerSDP, onFailure)
}


function getOfferSDP(offerSDP) {
  setLocalDescription(offerSDP);
  socket.send(offerSDP);
}


function setLocalDescription(sdp){
  connection.setLocalDescription(sdp);
}

function onFailure(error) {
  console.log(error);
}

function setRemoteDescription(offer){
  remoteSessionDesciption = new RTCSessionDescription(offer);
  connection.setRemoteDescription(remoteSessionDesciption);
}

function getAnswerSDP(answerSDP){
  setLocalDescription(answerSDP);
  socket.send(answerSDP);
}
