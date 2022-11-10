let handpose;
let video;
let xoff, yoff;
let hand = [];
let string = "Pinch!";
let vidWidth, vidHeight;
let myCanvas;

let constraints = {
  video: {
    // mandatory: {
    //   minWidth: 1280,
    //   minHeight: 720
    // },
    video: {
      width: { ideal: 640 },
      height: { ideal: 640 },
    },
    optional: [{ maxFrameRate: 20 }],
  },
  audio: false,
};

function getCameraStream() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((mediaStream) => {
      const video = document.querySelector("video");
      video.srcObject = mediaStream;
      video.onloadedmetadata = () => {
        video.play();
        // console.log(video)
        vidWidth = video.width;
        vidHeight = video.height;
        myCanvas = createCanvas(
          windowWidth,
          (windowWidth * vidHeight) / vidWidth
        );
        myCanvas.parent("canvas-parent");
        let containerEl = document.getElementById("video-parent");
        // let videoEl = document.getElementsByTagName('video');
        // console.log(videoEl)
        containerEl.appendChild(video);
      };
    })
    .catch((err) => {
      // always check for errors at the end.
      console.error(`${err.name}: ${err.message}`);
    });
}

function preload() {
  getCameraStream();
}

function setup() {
  //
  //   if(vidWidth && vidHeight) {createCanvas(windowWidth, windowWidth * vidHeight/vidWidth)}

  video = createCapture(constraints, function (stream) {});

  // video = createCapture(VIDEO);
  // console.log(video)
  // video.size(width, height);
  const options = {
    flipHorizontal: true, // boolean value for if the video should be flipped, defaults to false
    maxContinuousChecks: Infinity, // How many frames to go without running the bounding box detector. Defaults to infinity, but try a lower value if the detector is consistently producing bad predictions.
    detectionConfidence: 0.5, // Threshold for discarding a prediction. Defaults to 0.8.
    scoreThreshold: 0.75, // A threshold for removing multiple (likely duplicate) detections based on a "non-maximum suppression" algorithm. Defaults to 0.75
    iouThreshold: 0.3, // A float representing the threshold for deciding whether boxes overlap too much in non-maximum suppression. Must be between [0, 1]. Defaults to 0.3.
  };
  handpose = ml5.handpose(video, options, modelReady);

  // This sets up an event that fills the global variable "hand"
  // with an array every time new hand poses are detected
  handpose.on("predict", (results) => {
    hand = results;
  });

  // Hide the video element, and just show the canvas
  // video.hide();
  textFont("Recursive");
}

function modelReady() {
  select("#status").html("Hold your hand up to the camera");
}

function draw() {
  clear();
  background(0);
  // image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
  makeText();
  drawKeypoints();
}

// A function to draw ellipses over the detected keypoints
function makeText() {
  if (hand.length > 0) {
    let index = hand[0].annotations.indexFinger;
    let thumb = hand[0].annotations.thumb;

    let dig1, dig2;

    if (index[3][0] < thumb[3][0]) {
      dig1 = index;
      dig2 = thumb;
    } else {
      dig1 = thumb;
      dig2 = index;
    }

    let d1x = (dig1[3][0] * width) / vidWidth;
    let d1y = (dig1[3][1] * height) / vidHeight;
    let d2x = (dig2[3][0] * width) / vidWidth;
    let d2y = (dig2[3][1] * height) / vidHeight;

    push();
    stroke(0, 0, 255);
    strokeWeight(1);
    line(d1x, d1y, d2x, d2y);
    stroke(255, 0, 0);

    let d = dist(d1x, d1y, d2x, d2y);

    let textScaler = (d / string.length) * 2;

    push();
    noStroke();
    translate(d1x, d1y);
    let a = atan2(d2y - d1y, d2x - d1x);
    rotate(a);
    textSize(textScaler);

    noStroke();
    fill(255);
    text(string, 0, 0);
    pop();
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  for (let i = 0; i < hand.length; i += 1) {
    const prediction = hand[i];
    for (let j = 0; j < prediction.landmarks.length; j += 1) {
      const keypoint = prediction.landmarks[j];

      push();
      noStroke();
      fill(255, 100);
      circle(
        (keypoint[0] * width) / vidWidth,
        (keypoint[1] * height) / vidHeight,
        10
      );
      pop();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, (windowWidth * vidHeight) / vidWidth);
  // video.size(width, height);
}
