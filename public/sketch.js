const video = document.getElementById("myvideo")
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");

let isVideo = false;
let model = null;


let socket = io();
let users = {}

const modelParams = {
    flipHorizontal: true,   // flip e.g for video
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

socket.on("connect", function(){
  console.log("connected to server")
})

function preload(){
  handEmoji = loadImage("hand.png")
}

function setup(){
  createCanvas(windowWidth, windowHeight);

  // socket.on("dataB", function(data){
  //   console.log(data)
  //   ellipse(data.x, data.y, 10, 10)
  // })
  socket.on("dataB", message => {
    // console.log(message)
    let id = message.id;
    let data = message.data;

    // if (!!users[id]){
    //   users[id].predictions = data
    // } else {
    //   users[id] = {predictions: data}
    // }
    users[id] = {predictions: data}
    // console.log(users);
    // if(id in users){
    //   users[id].ppos = users[id].pos;
    //   users[id].pos = data;
    // }
    // else{
    //   users[id] = {pos: data, ppos: data}
    // }
  })
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}



function runDetection() {
    model.detect(video).then(predictions => {
        // console.log("Predictions: ", predictions);
        socket.emit("dataA", predictions)
        // model.renderPredictions(predictions, canvas, context, video);
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    trackButton.disabled = false
});

function draw(){
  background(200);

  // image(handEmoji, 10, 10)


  //line(mouseX, mouseY, pmouseX, pmouseY);

  // for(let u in users){
  //   let user = users[u]
  //   let pos = user.pos;
  //   let ppos = user.pos;
  //   line(pos.x, pos.y, ppos.x, ppos.y)
  // }

  console.log(users)
  for (let u in users){
    let user = users[u]
    let predictions = user.predictions
    if (!!predictions[0]){
      predictions.forEach(prediction => {
        coordinates = prediction.bbox
        image(handEmoji, prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3])
        // console.log("hit")
      })
    }
  }


}

// function mouseMoved(){
//   socket.emit("dataA", {x: mouseX, y:mouseY})
// }
