/*global RTCPeerConnection, io, RTCSessionDescription, URL, RTCIceCandidate*/

var peer;
var remoteSessionDesciption;
var socket = io.connect();
var action;
var candidatesMessages = [];

var servers = null;

var audio = document.getElementById('audio');

var callButton = document.getElementById('call');

callButton.onclick = function(){
  action = "to offer";
  getUserMedia();
};

function getUserMedia(SDPdata){

  var mediaConstraints = {
    audio: true,
    video: false
  };

  navigator.getUserMedia(mediaConstraints, onMediaSucess, onFailure);
  
  function onMediaSucess(mediaStream){
    
    peer = new RTCPeerConnection(servers);
    
    peer.addStream(mediaStream);
    
    peer.onaddstream = function(event){
      audio.src = URL.createObjectURL(event.stream);
    };

    peer.onicecandidate = function(event){
      
      var candidate = event.candidate;
      
      if(candidate){
        socket.send({
          type: 'icecandidate',
          candidate: candidate
        });
      }
      
    };
    
    if(action == 'to offer'){
      peer.createOffer(function(offerSDP){
        peer.setLocalDescription(offerSDP);
        socket.send(offerSDP);
      }, onFailure);
      
    } else if (action == 'to answer'){
      var offerSPD = SDPdata;
      var remoteDescription = new RTCSessionDescription(offerSPD);
      peer.setRemoteDescription(remoteDescription);
      
      peer.createAnswer(function(answerSDP){
        peer.setLocalDescription(answerSDP);
        socket.send(answerSDP);
      });
    }
    
  }  
}

socket.on('message', function(message){
  var type = message.type;
  
  switch (type) {
    
    case 'offer':
      var offerSPD = message;
      createAnswer(offerSPD);
      action = 'to answer';
      break;

    case 'answer':
      var answerSDP = message;
      var remoteDescription = new RTCSessionDescription(answerSDP);
      peer.setRemoteDescription(remoteDescription);
      break;

    case 'icecandidate':
      
      if(peer){
        
        candidatesMessages.push(message);
        
        candidatesMessages.forEach(function(message){
          
          var candidate = message.candidate.candidate;
          var sdpMLineIndex = message.candidate.sdpMLineIndex;
      
          peer.addIceCandidate(new RTCIceCandidate({
            candidate: candidate,
            sdpMLineIndex: sdpMLineIndex
          }));  
        
        });
          
      }else{
        candidatesMessages.push(message);
      }
      
      break;

    default:
  }
});

function createAnswer(offerSPD){
  getUserMedia(offerSPD);
}

function onFailure(error) {
  console.error(error);
}


