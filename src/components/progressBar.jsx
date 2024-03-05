import "./ProgressBar.css";
import { useRef } from "react";

function ProgressBar({ width }) {
  return (
    <div className="progress-bar">
      <div
        className="progress-bar__inner"
        style={{
          height: "50px",
          width: `${width * 100}% `,
        }}
      ></div>
    </div>
  );
}

export default ProgressBar;
