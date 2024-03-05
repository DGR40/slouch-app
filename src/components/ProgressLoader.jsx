import React, { useState, useEffect } from "react";
import "./ProgressLoader.css";

function ProgressLoader({ percent }) {
  const [offset, setOffset] = useState(283);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prevOffset) => (prevOffset <= 0 ? 283 : prevOffset - 1));
    }, 10);

    return () => clearInterval(interval);
  }, [percent]);

  return (
    <div className="progress-loader">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle
          className="progress-circle"
          cx="50"
          cy="50"
          r="45"
          stroke="#ccc"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          className="progress-bar"
          cx="50"
          cy="50"
          r="45"
          stroke="#007bff"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray="283"
          strokeDashoffset={offset}
        />
        <text
          x="50"
          y="50"
          dominantBaseline="middle"
          textAnchor="middle"
          className="progress-text"
        >
          {`${percent}%`}
        </text>
      </svg>
    </div>
  );
}

export default ProgressLoader;
