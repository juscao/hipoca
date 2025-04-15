import { images } from "../../assets/images";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="wrapper">
      <div className="content">
        <div id="dashboard-container">
          <a id="all-decks" href="/decks/all">
            <h2>My decks</h2>
            <img src={images.decks} alt="" />
            <p>View, manage, or study a deck.</p>
          </a>
          <a id="all-cards" href="/cards/all">
            <h2>My cards</h2>
            <img src={images.cards} alt="" />
            <p>View and manage cards or start a customized study session.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
