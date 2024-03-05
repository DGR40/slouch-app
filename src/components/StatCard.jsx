import Card from "./Card.jsx";
import "./StatCard.css";
import InfoTooltip from "./InfoTooltip.jsx";

function StatCard({ stat, title, info }) {
  return (
    <Card>
      <div className="statcard__header">
        <h3 className="statcard__label">{title}</h3>
        {info && <InfoTooltip title="More Info" content={info}></InfoTooltip>}
      </div>

      <h1 className="statcard__stat">{stat}</h1>
    </Card>
  );
}
export default StatCard;
