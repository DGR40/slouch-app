import { useState, useEffect, useRef } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
import "./App.css";
import Webcam from "react-webcam";
import { drawCanvas } from "./utils/draw.jsx";

function App() {
  const [totalSlouches, setTotalSlouches] = useState(0);
  const [sensitivity, setSensitivity] = useState(5);
  const MAX_CALIBRATION_COUNT = 10;
  const [angles, setAngles] = useState([]);

  // calculate angle average, rather than store in another state var
  const average_angle =
    angles.length > 0 ? angles.reduce((a, b) => a + b, 0) / angles.length : 0;
  console.log(average_angle);

  // STATE VARS
  const [detectorState, setDetectorState] = useState(null);

  // is either loading, waiting, calibrating, calibrated
  const [mode, setMode] = useState("loading");

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);

  const initializeTensorFlow = async () => {
    try {
      await tf.setBackend("webgl"); // Explicitly set the WebGL backend
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        scale: 0.5,
      };
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      console.log("successfully loaded model");
      setDetectorState(detector);
    } catch (error) {
      console.error(
        "Error initializing TensorFlow.js and pose detection model:",
        error
      );
      // Handle initialization error here
    }
  };

  useEffect(() => {
    initializeTensorFlow();
  }, []);

  useEffect(() => {
    if (detectorState && mode !== "loading") {
      timerRef.current = setInterval(() => {
        detect(detectorState);
      }, 1000);
      // Cleanup function to clear interval when component unmounts or when dependencies change
      return () => {
        clearInterval(timerRef.current);
      };
    }
  }, [detectorState, mode, angles]); // Dependency on stateDetector

  function calculateAngle(neck, shoulderLeft, shoulderRight) {
    // Calculate the angle using trigonometry
    const angleRad =
      Math.atan2(neck.y - shoulderLeft.y, neck.x - shoulderLeft.x) -
      Math.atan2(neck.y - shoulderRight.y, neck.x - shoulderRight.x);
    const angleDeg = Math.abs(angleRad * (180 / Math.PI));
    console.log("angle deg", angleDeg);
    return angleDeg;
  }

  function calculatePercentChange(angle, average) {
    console.log("angle", angle, "ag angle", average_angle);
    let pChange = Math.round(((angle - average) / average) * 100, 3);
    if (pChange > 0) {
      return pChange;
    }
    return 0;
  }

  const detect = async (detector) => {
    // check if calibrated
    if (angles.length >= MAX_CALIBRATION_COUNT) {
      setMode("calibrated");
      console.log("calibrated!");
    }

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      const pose = await detector.estimatePoses(video);
      if (pose.length > 0) {
        const keypoints = pose[0].keypoints;

        drawCanvas(keypoints, canvasRef, videoWidth, videoHeight, "green");

        // insert logic for slouch detection here
        const angle = calculateAngle(keypoints[0], keypoints[5], keypoints[6]);

        if (mode === "calibrating") {
          // accum angles in angle array
          setAngles([...angles, angle]);
        }

        if (mode === "calibrated") {
          const percentChange = calculatePercentChange(angle, average_angle);
          console.log("percent change is", percentChange);
        }
      }
    }
  };

  function renderControlPanel() {
    if (mode === "calibrated") {
      // add dashboard and sensitivity meter
    } else if (mode === "waiting") {
      return (
        <button
          className="start-button"
          onClick={() => {
            setMode("calibrating");
            console.log("switched to calibrating mode");
          }}
        >
          Calibrate
        </button>
      );
    } else {
      // add in loading bar
    }
  }

  function handleWebcamLoad() {
    setTimeout(() => {
      setMode("waiting");
      console.log("set to waiting");
    }, 1500);
  }

  function renderMessage() {
    let message;
    switch (mode) {
      case "loading":
        message = "Welcome to Sit Up. Give us one moment...";
        break;
      case "waiting":
        message =
          'Click "Calibrate" to begin teaching us your typical posture...';
        break;
      case "calibrating":
        message = "Just give us a few moments...";
        break;
      case "calibrated":
        message =
          "All set! Resume normal work and we will ping you if your posture needs correcting!";
        break;
    }
    return message;
  }

  const videoConstraints = {
    width: { min: window.height / 1.5 },
    height: { min: 720 },
    aspectRatio: 0.6666666667,
  };

  return (
    <div className="container">
      <div className="header">
        <div className="header__inner">
          <h1>Sit Up</h1>
          <p>{renderMessage()}</p>
        </div>
      </div>
      {mode === "loading" && <h2>Loading...</h2>}
      {renderControlPanel()}
      <div className="midsection">
        <div className="video-container">
          <Webcam
            videoConstraints={videoConstraints}
            ref={webcamRef}
            className="webcam"
            onUserMedia={handleWebcamLoad}
          />
          {mode !== "loading" && (
            <canvas
              ref={canvasRef}
              className="canvas"
              height={webcamRef.current.video.videoHeight}
              width={webcamRef.current.video.videoWidth}
            />
          )}
        </div>
        <div className="dashboard">
          <p>Dashboard</p>
        </div>
      </div>
      <div className="footer">
        <p>Created by Danny Rusk using React and Tensorflow's Movenet model</p>
      </div>
    </div>
  );
}

export default App;
