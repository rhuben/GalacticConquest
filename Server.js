var express = require('express');
var app = express();
var fs= require('fs');


app.get('/', function(req, res){
  fs.readFile('HTMLComponentRaw.html', function (err, html) {
      res.send(""+html);
      });
  
});

app.listen(4000);



console.log("Server running at localhost:4000");