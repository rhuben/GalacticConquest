var express= require('express');

var app=express();
var io = require('socket.io').listen(app);

app.listen(8080);


function handler (req, res) {
  fs.readFile(__dirname + '/SocketIOTest.js',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});