import { useEffect, useState } from "react";
import { getAllDecks, deleteDeck } from "../../services/deckApi";
import { ServerDeck } from "../../types/deck.types";
import { images } from "../../assets/images";
import "./AllDecks.css";

export default function AllDecks() {
  const [decks, setDecks] = useState<ServerDeck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<ServerDeck[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [hovered, setHovered] = useState("");
  const [sortBy, setSortBy] = useState<SortByType>(
    "Date updated (newest to oldest)"
  );
  const [sortByModal, setSortByModal] = useState(false);

  type SortByType =
    | "Alphabetical (A-Z)"
    | "Reverse alphabetical (Z-A)"
    | "Date updated (newest to oldest)"
    | "Date updated (oldest to newest)";

  useEffect(() => {
    const getDecks = async (): Promise<ServerDeck[] | undefined> => {
      const allDecks = await getAllDecks();
      if (allDecks) {
        setDecks(allDecks);
        setFilteredDecks(allDecks);
      }
      return;
    };
    getDecks();
  }, []);

  useEffect(() => {
    let result = [...decks];

    if (searchTerm) {
      result = result.filter((deck) =>
        deck.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case "Alphabetical (A-Z)":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Reverse alphabetical (Z-A)":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Date updated (newest to oldest)":
        result.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case "Date updated (oldest to newest)":
        result.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
        break;
    }

    setFilteredDecks(result);
  }, [decks, searchTerm, sortBy]);

  return (
    <div className="wrapper" onClick={() => console.log(decks)}>
      <div className="content">
        <div id="decks-container">
          <div id="decks-top">
            <h1>My decks</h1>
            <div className="search">
              <input
                type="search"
                placeholder="Search for a deck"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {!searchTerm && <img src={images.search} alt="Search" />}
              {searchTerm && (
                <img
                  src={images.clear}
                  className="clear"
                  onClick={() => setSearchTerm("")}
                  alt="Clear"
                />
              )}
            </div>
            <div className="filter">
              <button
                type="button"
                onClick={() => setSortByModal(!sortByModal)}
              >
                <img
                  src={images.filter}
                  style={
                    sortBy === "Date updated (oldest to newest)" ||
                    sortBy === "Reverse alphabetical (Z-A)"
                      ? { rotate: "180deg" }
                      : {}
                  }
                  alt="Filter"
                />
                {sortBy}
              </button>
              {sortByModal && (
                <div className="sort-options">
                  <p
                    className={
                      sortBy === "Date updated (newest to oldest)"
                        ? "active"
                        : ""
                    }
                    onClick={() => {
                      setSortBy("Date updated (newest to oldest)");
                      setSortByModal(false);
                    }}
                  >
                    Date updated (newest to oldest)
                  </p>
                  <p
                    className={
                      sortBy === "Date updated (oldest to newest)"
                        ? "active"
                        : ""
                    }
                    onClick={() => {
                      setSortBy("Date updated (oldest to newest)");
                      setSortByModal(false);
                    }}
                  >
                    Date updated (oldest to newest)
                  </p>
                  <p
                    className={sortBy === "Alphabetical (A-Z)" ? "active" : ""}
                    onClick={() => {
                      setSortBy("Alphabetical (A-Z)");
                      setSortByModal(false);
                    }}
                  >
                    Alphabetical (A-Z)
                  </p>

                  <p
                    className={
                      sortBy === "Reverse alphabetical (Z-A)" ? "active" : ""
                    }
                    onClick={() => {
                      setSortBy("Reverse alphabetical (Z-A)");
                      setSortByModal(false);
                    }}
                  >
                    Reverse alphabetical (Z-A)
                  </p>
                </div>
              )}
            </div>
          </div>
          <div id="decks-middle">
            {filteredDecks.length > 0 &&
              filteredDecks.map((deck) => (
                <div
                  className="deck"
                  key={deck.id}
                  onMouseEnter={() => setHovered(deck.id)}
                  onMouseLeave={() => setHovered("")}
                >
                  <img
                    src={
                      deck.privacy === "PRIVATE"
                        ? images.private
                        : images.public
                    }
                    alt={deck.privacy === "PRIVATE" ? "private" : "public"}
                  />
                  <h2 className="title">{deck.name}</h2>
                  <p className="number">
                    {deck.cards.length}
                    {deck.cards.length === 1 ? " card" : " cards"}
                  </p>
                  {hovered === deck.id && (
                    <div className="hovered">
                      <a
                        href={
                          deck.cards.length > 0
                            ? `/study/deck/${deck.id}`
                            : undefined
                        }
                        className={deck.cards.length > 0 ? "valid" : "invalid"}
                      >
                        <img src={images.study} alt="" />
                        <span>Study</span>
                      </a>
                      <a href={`/decks/${deck.id}`}>
                        <img src={images.manage} alt="" />
                        <span>Manage</span>
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          const response = await deleteDeck(deck.id);
                          if (response && response.msg === "Deck deleted.") {
                            setDecks((prevDecks) =>
                              prevDecks.filter(
                                (oldDeck) => oldDeck.id !== deck.id
                              )
                            );
                            setHovered("");
                          }
                        }}
                      >
                        <img src={images.delete} alt="" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
          <div id="decks-bottom"></div>
        </div>
      </div>
    </div>
  );
}
