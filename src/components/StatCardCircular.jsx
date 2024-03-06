import Card from "./Card.jsx";
import "./StatCard.css";
import InfoTooltip from "./InfoTooltip.jsx";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function StatCardCircular({ stat, title, info }) {
  return (
    <Card>
      <div className="statcard__header">
        <h3 className="statcard__label">{title}</h3>
        {info && <InfoTooltip title="More Info" content={info}></InfoTooltip>}
      </div>
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          justifyContent: "center",
          alignContent: "center",
          color: "white",
        }}
      >
        <CircularProgress
          variant="determinate"
          value={stat}
          size={"5rem"}
          sx={{
            "& .MuiCircularProgress-circle": {
              stroke: "rgb(253, 79, 79)",
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
            fontSize={"1rem"}
          >{`${Math.round(stat)}%`}</Typography>
        </Box>
      </Box>
    </Card>
  );
}
export default StatCardCircular;
