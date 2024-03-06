import { useRef, useState, useEffect } from "react";
import "./Timer.css";
import Card from "./Card";

function Timer({ onChange }) {
  const [startTime, setStartTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      onChange(calculateElapsedTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTime]);

  const calculateElapsedTime = () => {
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    let hours = Math.floor(elapsedTime / 3600);
    hours = String(hours).length > 1 ? hours : `0${String(hours)}`;
    let minutes = Math.floor((elapsedTime % 3600) / 60);
    minutes = String(minutes).length > 1 ? minutes : `0${String(minutes)}`;
    let seconds = elapsedTime % 60;
    seconds = String(seconds).length > 1 ? seconds : `0${String(seconds)}`;

    return [hours, minutes, seconds, elapsedTime];
  };

  const [hour, minutes, seconds] = calculateElapsedTime();

  return (
    <Card className="timer">
      <h3 className="timer__label">Time Elapsed</h3>
      <div className="panel__container">
        <div className="panel">
          <h1 className="panel__time">{hour}</h1>
          <h3 className="panel__label">Hour</h3>
        </div>
        <div className="panel">
          <h1 className="panel__time">:{minutes}</h1>
          <h3 className="panel__label">Minutes</h3>
        </div>
        <div className="panel">
          <h1 className="panel__time">:{seconds}</h1>
          <h3 className="panel__label">Seconds</h3>
        </div>
      </div>
    </Card>
  );
}

export default Timer;
