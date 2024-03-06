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
      <div>
        <CircularProgress variant="determinate" value={stat} />
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
            color="text.secondary"
          >{`${Math.round(stat)}%`}</Typography>
        </Box>
      </div>
    </Card>
  );
}
export default StatCardCircular;
