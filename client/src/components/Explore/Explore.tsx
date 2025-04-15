import { useEffect, useState, useCallback } from "react";
import { getPublicDecks, createDeckCopy } from "../../services/deckApi";
import { PublicServerDeck } from "../../types/deck.types";
import { images } from "../../assets/images";
import "./Explore.css";

export default function Explore() {
  const [fetching, setFetching] = useState(true);
  const [decks, setDecks] = useState<PublicServerDeck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<PublicServerDeck[]>([]);
  const [searchType, setSearchType] = useState<"name" | "author">("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortByType>("Most popular");
  const [sortByModal, setSortByModal] = useState(false);
  const [hovered, setHovered] = useState("");

  useEffect(() => {
    const getDecks = async (): Promise<PublicServerDeck[] | undefined> => {
      const response = await getPublicDecks();
      if (response) {
        console.log(response);
        setDecks(response);
        setFetching(false);
      }
      return;
    };
    getDecks();
  }, []);

  type SortByType =
    | "Most popular"
    | "Rating (high to low)"
    | "Rating (low to high)"
    | "Date updated (newest to oldest)"
    | "Date updated (oldest to newest)"
    | "Date created (newest to oldest)"
    | "Date created (oldest to newest)";

  const sortDecks = useCallback(
    (decksToSort: PublicServerDeck[]): PublicServerDeck[] => {
      const sortedDecks = [...decksToSort];

      switch (sortBy) {
        case "Most popular":
          return sortedDecks.sort((a, b) => (b.copies || 0) - (a.copies || 0));

        case "Rating (high to low)":
          return sortedDecks.sort((a, b) => {
            const ratingA = a.numRatings ? a.ratingSum / a.numRatings : 0;
            const ratingB = b.numRatings ? b.ratingSum / b.numRatings : 0;
            return ratingB - ratingA;
          });

        case "Rating (low to high)":
          return sortedDecks.sort((a, b) => {
            const ratingA = a.numRatings ? a.ratingSum / a.numRatings : 0;
            const ratingB = b.numRatings ? b.ratingSum / b.numRatings : 0;
            return ratingA - ratingB;
          });

        case "Date updated (newest to oldest)":
          return sortedDecks.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

        case "Date updated (oldest to newest)":
          return sortedDecks.sort(
            (a, b) =>
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );

        case "Date created (newest to oldest)":
          return sortedDecks.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        case "Date created (oldest to newest)":
          return sortedDecks.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        default:
          return sortedDecks;
      }
    },
    [sortBy]
  );

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDecks([]);
      return;
    }

    let filtered: PublicServerDeck[];

    if (searchType === "name") {
      filtered = decks.filter((deck) =>
        deck.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      filtered = decks.filter((deck) => deck.user.username === searchTerm);
    }

    const sortedFiltered = sortDecks(filtered);
    setFilteredDecks(sortedFiltered);
  }, [searchTerm, searchType, decks, sortDecks]);

  useEffect(() => {
    setDecks((prevDecks) => [...sortDecks(prevDecks)]);

    if (searchTerm) {
      setFilteredDecks((prevFiltered) => [...sortDecks(prevFiltered)]);
    }
  }, [sortBy, sortDecks, searchTerm]);

  return (
    <div className="wrapper">
      <div className="content">
        {!fetching && (
          <div id="explore-container">
            <div id="explore-top">
              <h1>Explore</h1>
              <div className="search">
                <select
                  className="filter-select"
                  aria-label="Filter search by"
                  onChange={(e) =>
                    setSearchType(e.target.value as "name" | "author")
                  }
                  value={searchType}
                >
                  <option value="" disabled>
                    Select filter...
                  </option>
                  <option value="name">Deck name</option>
                  <option value="author">Author name</option>
                </select>

                <input
                  type="search"
                  aria-label={`Search by ${searchType}`}
                  placeholder={`Search by ${searchType}`}
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
            </div>{" "}
            <div id="explore-filter">
              <button
                type="button"
                onClick={() => setSortByModal(!sortByModal)}
              >
                <img
                  src={images.filter}
                  style={
                    sortBy === "Date updated (oldest to newest)" ||
                    sortBy === "Date created (oldest to newest)" ||
                    sortBy === "Rating (low to high)"
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
                    className={sortBy === "Most popular" ? "active" : ""}
                    onClick={() => {
                      setSortBy("Most popular");
                      setSortByModal(false);
                    }}
                  >
                    Most popular
                  </p>
                  <p
                    className={
                      sortBy === "Rating (high to low)" ? "active" : ""
                    }
                    onClick={() => {
                      setSortBy("Rating (high to low)");
                      setSortByModal(false);
                    }}
                  >
                    Rating (high to low)
                  </p>
                  <p
                    className={
                      sortBy === "Rating (low to high)" ? "active" : ""
                    }
                    onClick={() => {
                      setSortBy("Rating (low to high)");
                      setSortByModal(false);
                    }}
                  >
                    Rating (low to high)
                  </p>
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
                    className={
                      sortBy === "Date created (newest to oldest)"
                        ? "active"
                        : ""
                    }
                    onClick={() => {
                      setSortBy("Date created (newest to oldest)");
                      setSortByModal(false);
                    }}
                  >
                    Date created (newest to oldest)
                  </p>
                  <p
                    className={
                      sortBy === "Date created (oldest to newest)"
                        ? "active"
                        : ""
                    }
                    onClick={() => {
                      setSortBy("Date created (oldest to newest)");
                      setSortByModal(false);
                    }}
                  >
                    Date created (oldest to newest)
                  </p>
                </div>
              )}
            </div>
            <div id="explore-middle">
              {(searchTerm ? filteredDecks : decks).map((deck) => (
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
                    alt={deck.privacy === "PRIVATE" ? "Private" : "Public"}
                  />
                  <h2 className="title">{deck.name}</h2>
                  <p className="author">{deck.user.username}</p>
                  <p className="number">
                    {deck.cards.length}
                    {deck.cards.length === 1 ? " card" : " cards"}
                  </p>
                  {hovered === deck.id && (
                    <div className="hovered">
                      <a
                        href={
                          deck.cards.length > 0
                            ? `/decks/${deck.id}`
                            : undefined
                        }
                        className={deck.cards.length > 0 ? "valid" : "invalid"}
                      >
                        <img src={images.view} alt="View" />
                        <span>View</span>
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          const response = await createDeckCopy(deck.id);
                          if (response) {
                            alert("Deck successfully copied.");
                          }
                        }}
                      >
                        <img src={images.copy} alt="Copy" />
                        <span>Copy to decks</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
