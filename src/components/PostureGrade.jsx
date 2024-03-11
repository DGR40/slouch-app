import "./PostureGrade.css";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import InfoTooltip from "./InfoTooltip";

function PostureGrade({ slouchPercent, runningTime }) {
  // returns letter grade based on percent
  function getGradeAndColor(percent) {
    console.log("percent", percent);
    let grade = "";
    let color = "";
    if (percent >= 85) {
      grade = "A";
      color = "rgb(0, 255, 183)";
    } else if (percent >= 75) {
      grade = "B";
      color = "#6aa84f";
    } else if (percent >= 50) {
      grade = "C";
      color = "#e69138";
    } else if (percent >= 40) {
      grade = "D";
      color = "rgb(253, 79, 79)";
    } else {
      grade = "F";
      color = "rgb(204,0,0)";
    }
    return { grade, color };
  }

  const { grade, color } = getGradeAndColor(100 - slouchPercent);

  return (
    <div className="grade-container">
      <div className="grade-container__text-container">
        <h2 className="grade__text">Posture Grade </h2>
        <InfoTooltip
          title="More Info"
          content={`${(100 - slouchPercent).toFixed(
            1
          )}% of the time you have good posture`}
        ></InfoTooltip>
      </div>

      {runningTime >= 3 && (
        <>
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              justifyContent: "center",
              alignContent: "center",
              color: "#213547",
              border: "1px solid #213547",
              borderRadius: "50%",
            }}
          >
            <CircularProgress
              variant="determinate"
              value={100 - slouchPercent}
              size={"8rem"}
              sx={{
                "& .MuiCircularProgress-circle": {
                  stroke: color,
                  fill: "#213547",
                  strokeWidth: "4px",
                },
                "& MuiCircularProgress-circleDeterminate": {
                  color: "black",
                  fill: "blue",
                  margin: "2px",
                },
                ".css-1idz92c-MuiCircularProgress-svg": {
                  margin: "-10px",
                },
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="caption"
                component="div"
                color="white"
                fontSize={"3rem"}
                fontWeight={"1000"}
              >
                {grade}
              </Typography>
            </Box>
          </Box>
        </>
      )}
      {runningTime < 3 && <p>Calculating grade...</p>}
    </div>
  );
}
export default PostureGrade;
