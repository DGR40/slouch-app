import Card from "./Card.jsx";
import "./StatCard.css";

function StatCard({ stat, title }) {
  return (
    <Card>
      <h3 className="statcard__label">{title}</h3>
      <h1 className="statcard__stat">{stat}</h1>
    </Card>
  );
}
export default StatCard;
