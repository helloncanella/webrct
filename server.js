var express = require("express");
var app = express();

var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res) {
  res.sendFile('index.html');
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0");

io.on('connection', function(socket){
  socket.on('message', function(message){
    socket.broadcast.emit('message', message);
  });
})






