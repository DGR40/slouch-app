import PostureGrade from "./PostureGrade.jsx";
import Timer from "./Timer.jsx";
import StatCard from "./StatCard.jsx";
import CustomSlider from "./CustomSlider.jsx";

export default function Dashboard({
  average_angle,
  averagePercentChange,
  slouchRunningCount,
  runningTime,
  setRunningTime,
  showMore,
  setShowMore,
  sensitivity,
  setSensitivity,
  mode,
}) {
  function getSlouchPerMin() {
    if (runningTime[1] == 0) {
      return slouchRunningCount;
    } else {
      return slouchRunningCount / runningTime[1];
    }
  }

  let avgAngle = `${average_angle.toFixed(1)}°`;
  let avgPercentChange = `${averagePercentChange.toFixed(1)}%`;
  let slouchPerMin = getSlouchPerMin();
  runningTime[3] > 0
    ? Math.round(slouchRunningCount / runningTime[3] / 60)
    : "default";
  let slouchPercentage =
    runningTime[3] && runningTime[3] > 0
      ? (slouchRunningCount / runningTime[3]) * 100
      : 0.0;
  console.log(
    "slouch running count:",
    slouchRunningCount,
    " running time",
    runningTime[3],
    slouchPercentage,
    "SLOUCH %",
    " SPM: ",
    slouchPerMin
  );

  return (
    <div
      className={`dashboard dashboard-widescreen
          ${mode === "calibrated" && showMore ? "dashboard-showmore" : ""} 
          `}
    >
      <PostureGrade
        slouchPercent={slouchPercentage}
        runningTime={runningTime[3]}
      />

      <Timer
        onChange={(timeDiff) => {
          setRunningTime(timeDiff);
        }}
      />
      <CustomSlider
        sensitivity={sensitivity}
        onChange={(v) => {
          console.log(`sensitivity: ${sensitivity}`),
            setSensitivity(v.target.value);
        }}
      />

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
            stat={`${slouchPerMin.toFixed(1)} spm`}
            info={"Number of slouches per minute"}
          />
        </>
      )}

      <p className="showmore" onClick={() => setShowMore(!showMore)}>
        {showMore ? "Show Less" : "Show More"}
      </p>
    </div>
  );
}
