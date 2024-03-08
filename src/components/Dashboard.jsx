export default function Dashboard({
  average_angle,
  averagePercentChange,
  runningTime,
  slouchRunningCount,
  sensitivity,
}) {
  let avgAngle = `${average_angle.toFixed(1)}°`;
  let avgPercentChange = `${averagePercentChange.toFixed(1)}%`;
  let minPassed = runningTime[1] === "00" ? 1 : runningTime[1];
  let slouchPerMin = props.runningTime[3]
    ? props.slouchRunningCount / Math.round(props.runningTime[3] / 60)
    : 0.0;
  let slouchPercentage = props.runningTime[3]
    ? (props.slouchRunningCount / props.runningTime[3]) * 100
    : 0.0;

  return (
    <div
      className={`dashboard 
          ${mode === "waiting" ? "center dashbboard-waiting" : ""} 
          ${mode === "calibrating" || !firstDrawn ? "hide" : ""} 
          ${mode === "calibrated" && showMore ? "dashboard-showmore" : ""} 
          ${mode === "calibrated" ? "dashboard-widescreen" : ""} 
          `}
    >
      <PostureGrade slouchPercent={slouchPercentage} />
      <Timer
        onChange={(timeDiff) => {
          props.setRunningTime(timeDiff);
          console.log(timeDiff);
        }}
      />
      <CustomSlider
        sensitivity={sensitivity}
        onChange={(v) => {
          console.log(`sensitivity: ${sensitivity}`),
            props.setSensitivity(v.target.value);
        }}
      />

      {props.showMore && (
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

      <p className="showmore" onClick={() => props.setShowMore(!showMore)}>
        {showMore ? "Show Less" : "Show More"}
      </p>
    </div>
  );
}
