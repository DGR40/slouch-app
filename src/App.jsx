import { useState, useEffect, useRef } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
import "./App.css";
import Webcam from "react-webcam";
import { drawCanvas } from "./utils/draw.jsx";
import ProgressBar from "./components/progressBar.jsx";
import Timer from "./components/Timer.jsx";
import StatCard from "./components/StatCard.jsx";
import StatCardCircular from "./components/StatCardCircular.jsx";
import CustomSlider from "./components/CustomSlider.jsx";
import { LinearProgress } from "@mui/material";
import useSound from "use-sound";
import Bell from "./assets/mixkit-bell-notification-933.wav";

function App() {
  const [totalSlouches, setTotalSlouches] = useState(0);
  const [slouchTally, setSlouchTally] = useState(0);
  const [slouchRunningCount, setSlouchRunningCount] = useState(0);
  const [sensitivity, setSensitivity] = useState(5);
  const [firstDrawn, setFirstDrawn] = useState(false);
  const MAX_CALIBRATION_COUNT = 3;
  const [angles, setAngles] = useState([]);
  const [percentChanges, setPercentChanges] = useState([]);
  const [runningTime, setRunningTime] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [isSlouching, setIsSlouching] = useState(false);

  // bring in sound effect
  const [playSound] = useSound(Bell);

  // calculate angle average, rather than store in another state var
  const average_angle =
    angles.length > 0 ? angles.reduce((a, b) => a + b, 0) / angles.length : 0;
  console.log(average_angle);

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

        // insert logic for slouch detection here
        const angle = calculateAngle(keypoints[0], keypoints[5], keypoints[6]);

        if (mode === "calibrating") {
          // accum angles in angle array
          setAngles([...angles, angle]);
        }

        let color = "white";

        if (mode === "calibrated") {
          const percentChange = calculatePercentChange(angle, average_angle);
          // add to percentChange array
          setPercentChanges([...percentChanges, percentChange]);
          console.log("percent change is", percentChange);
          // slouch
          if (percentChange > 10 - sensitivity) {
            color = "rgb(253, 79, 79)";
            //drawCanvas(keypoints, canvasRef, videoWidth, videoHeight, color);
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
            //drawCanvas(keypoints, canvasRef, videoWidth, videoHeight, color);
            setAngles([...angles, angle]);
          }
        } else {
          //drawCanvas(keypoints, canvasRef, videoWidth, videoHeight, color);
          if (!firstDrawn) {
            setFirstDrawn(true);
          }
        }
      }
    }
  };

  function renderControlPanel() {
    if (mode == "waiting") {
      return (
        <>
          <button
            className="start-button"
            onClick={() => {
              setMode("calibrating");
              console.log("switched to calibrating mode");
            }}
          >
            Calibrate
          </button>
        </>
      );
    }
    if (mode == "calibrated") {
      let avgAngle = `${average_angle.toFixed(1)}°`;
      let avgPercentChange = `${averagePercentChange.toFixed(1)}%`;
      let minPassed = runningTime[1] === "00" ? 1 : runningTime[1];
      let slouchPerMin = `${(
        slouchRunningCount / Math.round(runningTime[3] / 60)
      ).toFixed(1)}`;
      let slouchPercentage = runningTime[3]
        ? (slouchRunningCount / runningTime[3]) * 100
        : 0.0;

      return (
        <>
          <Timer
            onChange={(timeDiff) => {
              setRunningTime(timeDiff);
              console.log(timeDiff);
            }}
          />
          <StatCard
            title={"Slouch Time"}
            stat={`${slouchPercentage.toFixed(1)}%`}
            info={"Percentage of session time slouched"}
          />
          <CustomSlider
            sensitivity={sensitivity}
            onChange={(v) => {
              console.log(`sensitivity: ${sensitivity}`),
                setSensitivity(v.target.value);
            }}
          />

          <div className="hr-spacer"></div>

          {showMore && (
            <>
              <StatCard
                stat={avgAngle}
                title={"Average Angle"}
                info={
                  "Average angle between your left shoulder, nose, and right shoulder"
                }
              />

              <StatCard
                title={"Average Percent Deviation"}
                stat={avgPercentChange}
                info={"Average percent deviation from your average angle"}
              />
              <StatCard
                title={"Slouch Rate"}
                stat={`${slouchPerMin} spm`}
                info={"Number of slouches per minute"}
              />
            </>
          )}

          <p className="showmore" onClick={() => setShowMore(!showMore)}>
            {showMore ? "Show Less" : "Show More"}
          </p>
        </>
      );
    }
  }

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
              key={1}
              href="https://medlineplus.gov/guidetogoodposture.html"
              target="_blank"
            >
              {" "}
              good posture.
            </a>,
            <br key={2} />,
            "Make sure you are in ",
            <strong key={3}>good lighting</strong>,
            " with ",
            <strong key={4}>shoulders-and-up</strong>,
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

  const videoConstraints = {
    width: { min: window.height / 1.5 },
    height: { min: 720 },
    aspectRatio: 2,
  };

  return (
    <div className="container">
      <div className="header">
        <div className="header__inner">
          <h1>Sit Up</h1>
          <p>{renderMessage()}</p>
        </div>
      </div>
      {mode === "calibrating" && (
        <LinearProgress
          value={calibrationProgress * 100}
          variant="determinate"
          sx={{
            height: 20, // Set the height to 20px
            bgcolor: "shade(rgb(253, 79, 79), 10%)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "rgb(253, 79, 79)", // Set the loading bar color to red
            },
          }}
        />
      )}
      <div
        className={`midsection ${
          mode === "calibrating" || !firstDrawn ? "center" : ""
        }`}
      >
        <div
          className={`video-container ${isSlouching ? "red" : ""} ${
            mode === "calibrating" ? "calibrating" : ""
          }`}
        >
          <Webcam
            videoConstraints={videoConstraints}
            ref={webcamRef}
            className={`webcam`}
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
        <div
          className={`${mode === "waiting" ? "center" : ""} dashboard ${
            mode === "calibrating" || !firstDrawn ? "calibrating hide" : ""
          } `}
        >
          {renderControlPanel()}
        </div>
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
