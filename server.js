let http = require('http');
let PORT = process.env.PORT || 8000;

let express = require('express');
let app = express();

// let server = http.createServer((req, res) => {
//   res.writeHead(200)
//   res.end("hello world", req)
// });

let server = http.createServer(app);

server.listen(PORT, ()=>{
  console.log(`server listening on ${PORT}`)
});

app.use(express.static("public"));

let io = require("socket.io").listen(server);

io.sockets.on("connection", function(socket){
  console.log(socket.id + "just connected")

  //listen for inc data
  socket.on("dataA", function(data){
    console.log("inc data:" + data);

    let message = {
      id: socket.id,
      data: data
    }

    io.sockets.emit("dataB", message);
  })

  socket.on('disconnect', function(){
    console.log(socket.id + "just disconnected")
  })
})
