import { useState, useEffect, useRef } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
import "./App.css";
import Webcam from "react-webcam";
import { drawCanvas } from "./utils/draw.jsx";
import ProgressBar from "./components/CustomProgressBar.jsx";
import Timer from "./components/Timer.jsx";
import StatCard from "./components/StatCard.jsx";
import StatCardCircular from "./components/StatCardCircular.jsx";
import CustomSlider from "./components/CustomSlider.jsx";
import useSound from "use-sound";
import Bell from "./assets/mixkit-bell-notification-933.wav";
import PostureGrade from "./components/PostureGrade.jsx";
import StartButton from "./components/StartButton.jsx";
import CustomProgressBar from "./components/CustomProgressBar.jsx";
import Dashboard from "./components/Dashboard.jsx";

function App() {
  const [totalSlouches, setTotalSlouches] = useState(0);
  const [slouchTally, setSlouchTally] = useState(0);
  const [slouchRunningCount, setSlouchRunningCount] = useState(0);
  const [sensitivity, setSensitivity] = useState(5);
  const [firstDrawn, setFirstDrawn] = useState(false);
  const MAX_CALIBRATION_COUNT = 3;
  const [angles, setAngles] = useState([]);
  const [percentChanges, setPercentChanges] = useState([]);
  const [runningTime, setRunningTime] = useState(1);
  const [showMore, setShowMore] = useState(false);
  const [isSlouching, setIsSlouching] = useState(false);

  // bring in sound effect
  const [playSound] = useSound(Bell);

  // calculate angle average, rather than store in another state var
  const average_angle =
    angles.length > 0 ? angles.reduce((a, b) => a + b, 0) / angles.length : 0;

  const averagePercentChange =
    percentChanges.length > 0
      ? percentChanges.reduce((a, b) => a + b, 0) / percentChanges.length
      : 0;

  const calibrationProgress = angles.length / MAX_CALIBRATION_COUNT;

  // STATE VARS
  const [detectorState, setDetectorState] = useState(null);

  // is either loading, waiting, firstDrawn, calibrating, calibrated
  const [mode, setMode] = useState("loading");

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const videoContainerRef = useRef(null);

  const videoConstraintsRef = useRef({
    width: { min: window.innerWidth * 0.6 },
    height: { min: window.innerHeight * 0.4 },
    aspectRatio: 16 / 9,
  });

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
  }, [
    detectorState,
    mode,
    angles,
    slouchTally,
    totalSlouches,
    slouchRunningCount,
    runningTime,
  ]); // Dependency on stateDetector

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
    if (angles.length >= MAX_CALIBRATION_COUNT && mode === "calibrating") {
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

        // insert logic for slouch detection here
        const angle = calculateAngle(keypoints[0], keypoints[5], keypoints[6]);

        if (mode === "calibrating") {
          // accum angles in angle array
          setAngles([...angles, angle]);
        }

        let color = "white";

        // only detect slouch if calibrated and running count is greater than zero
        // (prevents having more slouches than seconds (i.e. negative slouch percentages))
        if (mode === "calibrated" && runningTime[3]) {
          const percentChange = calculatePercentChange(angle, average_angle);
          // add to percentChange array
          setPercentChanges([...percentChanges, percentChange]);
          console.log("percent change is", percentChange);
          // slouch
          if (percentChange > 10 - sensitivity) {
            color = "rgb(253, 79, 79)";
            drawCanvas(keypoints, canvasRef, videoWidth, videoHeight, color);
            setIsSlouching(true);

            // counts partial slouches, 5 partials = 1 full slouch. gets reset after 5 (inc totalSlouch)
            setSlouchTally((prevCount) => prevCount + 1);

            // also counts partial slouches, but does not get reset
            setSlouchRunningCount((prevCount) => prevCount + 1);

            console.log("slouchTally", slouchTally);
            if (slouchTally == 5) {
              playSound();
              setTotalSlouches((prevCount) => prevCount + 1);
              setSlouchTally(0);
            }
          } else {
            // not slouching
            setIsSlouching(false);
            drawCanvas(keypoints, canvasRef, videoWidth, videoHeight, color);
            setAngles([...angles, angle]);
          }
        } else {
          drawCanvas(keypoints, canvasRef, videoWidth, videoHeight, color);
          if (!firstDrawn) {
            setFirstDrawn(true);
          }
        }
      }
    }
  };

  function handleWebcamLoad() {
    setTimeout(() => {
      setMode("waiting");
      console.log("set to waiting");
    }, 1000);
  }

  function renderMessage() {
    let message;
    switch (mode) {
      case "loading":
        message = "Welcome to Sit Up. We are just preparing a few things...";
        break;
      case "waiting":
        if (firstDrawn) {
          message = [
            "Click ",
            <strong key={1}>Calibrate</strong>,
            " below and sit with",
            <a
              key={10}
              href="https://medlineplus.gov/guidetogoodposture.html"
              target="_blank"
            >
              {" "}
              good posture.
            </a>,
            <br key={2} />,
            "Make sure you are in ",
            <strong key={3}>good lighting</strong>,
            " with your ",
            <strong key={4}>shoulders</strong>,
            " visible...",
          ];
        } else {
          message = "Loading in the model...";
        }

        break;
      case "calibrating":
        if (calibrationProgress < 0.5) {
          message = "This will only take one minute...";
        } else if (calibrationProgress < 0.75) {
          message = "Sit up as best you can...";
        } else {
          message = "Just give us a few moments...";
        }

        break;
      case "calibrated":
        message =
          "All set! Resume your work. We will ping you if your posture needs correcting!";
        break;
    }
    return message;
  }

  useEffect(() => {
    function resizeWindow() {
      if (videoContainerRef.current) {
        webcamRef.current.video.height = videoContainerRef.current.offsetHeight;
        canvasRef.current.height = videoContainerRef.current.offsetWidth;
      }
      window.addEventListener("resize", resizeWindow);
      resizeWindow();
      return () => {
        window.removeEventListener("resize", resizeWindow);
      };
    }
  }, []);

  if (mode === "calibrated") {
    console.log("HEIGHT", webcamRef.current);

    //webcamRef.current.video.width = videoContainerRef.current.offsetHeight;
    //canvasRef.current.width = videoContainerRef.current.offsetWidth;
  }

  // props for dashboard
  const dashboardProps = {
    average_angle,
    averagePercentChange,
    slouchRunningCount,
    firstDrawn,
    runningTime,
    setRunningTime,
    showMore,
    setShowMore,
    sensitivity,
    setSensitivity,
    mode,
  };

  //${isSlouching ? "red" : ""}

  return (
    <div className={`container`}>
      <div className="header">
        <div className="header__inner">
          <h1>
            Sit Up{" "}
            <span className="header__subtext">Real-time Posture Analyzer</span>
          </h1>
        </div>
      </div>
      <div className="banner">
        <div className="banner__inner">
          <p>{renderMessage()}</p>
        </div>
      </div>
      {mode === "waiting" && (
        <StartButton
          onChange={() => {
            setMode("calibrating");
            console.log("set to calibrating");
          }}
        />
      )}

      {mode === "calibrating" && (
        <CustomProgressBar
          width={(angles.length / MAX_CALIBRATION_COUNT) * 100}
        />
      )}

      <div
        className={`midsection 
        ${mode === "calibrating" || !firstDrawn ? "center waiting" : ""} 
        ${mode === "waiting" ? "waiting" : ""} 
        ${mode === "calibrated" ? "midsection-wide-screen" : ""}`}
      >
        <div
          className={`video-container  ${
            mode === "calibrating" ? "calibrating" : ""
          }${mode === "calibrated" ? "video-container-wide-screen" : ""} ${
            isSlouching ? "red" : ""
          }`}
          ref={videoContainerRef}
        >
          <Webcam
            videoConstraints={videoConstraintsRef.current}
            ref={webcamRef}
            className={`webcam ${
              mode === "calibrated" ? "webcam-wide-screen" : ""
            }`}
            onUserMedia={handleWebcamLoad}
          />
          {mode !== "loading" && (
            <canvas
              ref={canvasRef}
              className={`canvas ${
                mode === "calibrated" ? "webcam-wide-screen" : ""
              }`}
              height={webcamRef.current.video.videoHeight}
              width={webcamRef.current.video.videoWidth}
            />
          )}
        </div>
        {console.log("test", dashboardProps.average_angle)}
        {mode === "calibrated" && <Dashboard {...dashboardProps} />}
      </div>
      <div className="footer">
        <p className="footer__text">
          Created by Danny Rusk using React and Tensorflow's Movenet model ©
          2024
        </p>
      </div>
    </div>
  );
}

export default App;
