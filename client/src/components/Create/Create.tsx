import { images } from "../../assets/images";

export default function Create() {
  return (
    <div className="wrapper">
      <div className="content">
        <div id="create-container">
          <a id="create-deck" href="/decks/new">
            <h2>Create a deck</h2>
            <img src={images.decks2} alt="" />
          </a>
          <a id="create-card" href="/cards/new">
            <h2>Create a card</h2>
            <img src={images.cards2} alt="" />
          </a>
        </div>
      </div>
    </div>
  );
}
