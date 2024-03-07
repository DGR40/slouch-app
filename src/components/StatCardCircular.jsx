import Card from "./Card.jsx";
import "./StatCard.css";
import InfoTooltip from "./InfoTooltip.jsx";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function StatCardCircular({ stat, title, info }) {
  return (
    <Card>
      <div>
        <div style={{ float: "left" }}>
          <h3 className="statcard__label">{title}</h3>
          {info && <InfoTooltip title="More Info" content={info}></InfoTooltip>}
        </div>
      </div>
    </Card>
  );
}
export default StatCardCircular;
