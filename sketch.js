let handpose;
let video;
let xoff, yoff;
let hand = [];
let string = "Pinch!";
let vidWidth, vidHeight;
let ratio = 480 / 640;

function setup() {
  createCanvas(windowWidth, windowWidth * ratio);
  video = createCapture(VIDEO);
  // console.log(video)
  video.size(width, height);
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
  video.hide();
  textFont("Recursive");
}

function modelReady() {
  select("#status").html(
    "Hold your hand up to the camera"
  );
}

function draw() {
  clear();
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

    push();
    stroke(0, 0, 255);
    strokeWeight(1);
    line(dig1[3][0], dig1[3][1], dig2[3][0], dig2[3][1]);
    stroke(255, 0, 0);

    let d = dist(dig1[3][0], dig1[3][1], dig2[3][0], dig2[3][1]);

    let textScaler = (d / string.length) * 2;

    push();
    noStroke();
    translate(dig1[3][0], dig1[3][1]);
    let a = atan2(dig2[3][1] - dig1[3][1], dig2[3][0] - dig1[3][0]);
    rotate(a);
    textSize(textScaler);

    noStroke();
    fill(0);
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
      fill(0, 100);
      circle(keypoint[0], keypoint[1], 10);
      pop();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowWidth * ratio);
  video.size(width, height);
}
