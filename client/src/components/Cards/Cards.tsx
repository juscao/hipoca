import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router";
import { UserContext } from "../../contexts/UserContext";
import {
  addFlashcardsToDeck,
  deleteFlashcards,
  getAllFlashcards,
  removeFlashcardsFromDeck,
  updateFlashcardReviewStatus,
} from "../../services/cardApi";
import { getDeck, getAllDecks, createDeckCopy } from "../../services/deckApi";
import { ServerCard } from "../../types/flashcard.types";
import { ServerDeck } from "../../types/deck.types";
import { colors } from "../../types/flashcard.types";
import { images } from "../../assets/images";
import "./Cards.css";

export default function AllCards() {
  const [authorized, setAuthorized] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [decks, setDecks] = useState<ServerDeck[] | undefined>();
  const [selectedDeck, setSelectedDeck] = useState<string>("");
  const [deckName, setDeckName] = useState("");
  const [deckPrivacy, setDeckPrivacy] = useState<"PUBLIC" | "PRIVATE">();
  const [cards, setCards] = useState<ServerCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<ServerCard[]>([]);

  const [hovered, setHovered] = useState(-1);
  const [dropped, setDropped] = useState<string[]>([]);
  const [selected, setSelected] = useState<ServerCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("text");
  const [sortByModal, setSortByModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortByType>(
    "Date updated (newest to oldest)"
  );
  const [colorFilter, setColorFilter] = useState<ColorName[]>([]);
  const [textFilteredCards, setTextFilteredCards] = useState<ServerCard[]>([]);
  const [colorFilteredCards, setColorFilteredCards] = useState<ServerCard[]>(
    []
  );
  const [addingToStack, setAddingToStack] = useState(false);
  const [currentStackCheckbox, setCurrentStackCheckbox] = useState<
    "on" | "off" | "neutral"
  >("neutral");
  const [dueForReviewCheckbox, setDueForReviewCheckbox] = useState<
    "on" | "off" | "neutral"
  >("neutral");

  const { deckId } = useParams();
  const user = useContext(UserContext);

  type SearchType = "text" | "tag" | "deck";
  type SortByType =
    | "Date updated (newest to oldest)"
    | "Date updated (oldest to newest)"
    | "Date created (newest to oldest)"
    | "Date created (oldest to newest)"
    | "Times studied (high to low)"
    | "Times studied (low to high)"
    | "Last studied (newest to oldest)"
    | "Last studied (oldest to newest)"
    | "Accuracy (high to low)"
    | "Accuracy (low to high)";
  type ColorName = (typeof colors)[number]["name"];

  useEffect(() => {
    const getDecks = async (): Promise<ServerDeck[] | undefined> => {
      const allDecks = await getAllDecks();
      if (allDecks) {
        setDecks(allDecks);
      }
      return;
    };
    getDecks();
    if (deckId) {
      const getCards = async (): Promise<ServerDeck | undefined> => {
        const response = await getDeck(deckId);
        if (response && response.cards) {
          setDeckName(response.deck.name);
          setDeckPrivacy(response.deck.privacy);
          setCards(response.cards);
        }
        if (response && user && deckId && response.deck.userId === user.id) {
          setAuthorized(true);
        }
        setFetching(false);
        return;
      };
      getCards();
    } else {
      setAuthorized(true);
      const getCards = async (): Promise<ServerCard[] | undefined> => {
        const allCards = await getAllFlashcards();
        if (allCards) {
          setCards(allCards);
          setFetching(false);
        }
        return;
      };
      getCards();
    }
  }, [deckId, user]);

  useEffect(() => {
    setTextFilteredCards(cards);
  }, [cards]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setTextFilteredCards(cards);
      return;
    }

    if (searchType === "text") {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = cards.filter(
        (card) =>
          card.front.toLowerCase().includes(lowerSearchTerm) ||
          card.back.toLowerCase().includes(lowerSearchTerm)
      );
      setTextFilteredCards(filtered);
    } else if (searchType === "tag") {
      const searchTags = searchTerm
        .split(",")
        .map((tag) => tag.trim().toLowerCase());
      const filtered = cards.filter((card) => {
        return searchTags.every((searchTag) =>
          card.tags?.some((cardTag) =>
            cardTag.toLowerCase().includes(searchTag)
          )
        );
      });
      setTextFilteredCards(filtered);
    } else {
      const decks = searchTerm
        .split(",")
        .map((deck) => deck.trim().toLowerCase());
      const filtered = cards.filter((card) => {
        return decks.every((searchDeck) =>
          card.decks?.some((deck) =>
            deck.name.toLowerCase().includes(searchDeck)
          )
        );
      });
      setTextFilteredCards(filtered);
    }
  }, [searchType, searchTerm, cards]);

  useEffect(() => {
    let filtered = [...textFilteredCards];
    if (dueForReviewCheckbox === "on") {
      filtered = filtered.filter((card) => {
        if (card.dueForReview == null) return false;
        try {
          const dueDate = new Date(card.dueForReview);
          if (isNaN(dueDate.getTime())) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return dueDate <= today;
        } catch (error) {
          console.log(error);
          return false;
        }
      });
    } else if (dueForReviewCheckbox === "off") {
      filtered = filtered.filter(
        (card) =>
          card.dueForReview === null ||
          (card.dueForReview && new Date(card.dueForReview) > new Date())
      );
    }

    if (currentStackCheckbox === "on") {
      filtered = filtered.filter((card) => card.inCurrentStack === true);
    } else if (currentStackCheckbox === "off") {
      filtered = filtered.filter((card) => card.inCurrentStack === false);
    }

    if (colorFilter.length > 0) {
      filtered = filtered.filter((card) =>
        colorFilter.includes(card.backgroundColor as ColorName)
      );
    }

    setColorFilteredCards(filtered);
    setFilteredCards(filtered);
  }, [
    dueForReviewCheckbox,
    currentStackCheckbox,
    textFilteredCards,
    colorFilter,
    filteredCards.length,
  ]);

  useEffect(() => {
    if (colorFilter.length === 0) {
      setColorFilteredCards(textFilteredCards);
      return;
    }

    const filtered = textFilteredCards.filter((card) =>
      colorFilter.includes(card.backgroundColor as ColorName)
    );
    setColorFilteredCards(filtered);
  }, [colorFilter, textFilteredCards]);

  useEffect(() => {
    const cardsCopy = [...colorFilteredCards];

    switch (sortBy) {
      case "Date updated (newest to oldest)":
        cardsCopy.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case "Date updated (oldest to newest)":
        cardsCopy.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
        break;
      case "Date created (newest to oldest)":
        cardsCopy.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "Date created (oldest to newest)":
        cardsCopy.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "Times studied (high to low)":
        cardsCopy.sort((a, b) => b.timesStudied - a.timesStudied);
        break;
      case "Times studied (low to high)":
        cardsCopy.sort((a, b) => a.timesStudied - b.timesStudied);
        break;
      case "Last studied (newest to oldest)":
        cardsCopy.sort((a, b) => {
          if (
            (!a.lastStudied && !b.lastStudied) ||
            (a.lastStudied === null && b.lastStudied === null)
          )
            return 0;
          if (!a.lastStudied || a.lastStudied === null) return 1;
          if (!b.lastStudied || b.lastStudied === null) return -1;
          return (
            new Date(b.lastStudied).getTime() -
            new Date(a.lastStudied).getTime()
          );
        });
        break;
      case "Last studied (oldest to newest)":
        cardsCopy.sort((a, b) => {
          if (
            (!a.lastStudied && !b.lastStudied) ||
            (a.lastStudied === null && b.lastStudied === null)
          )
            return 0;
          if (!a.lastStudied || a.lastStudied === null) return 1;
          if (!b.lastStudied || b.lastStudied === null) return -1;
          return (
            new Date(a.lastStudied).getTime() -
            new Date(b.lastStudied).getTime()
          );
        });
        break;
      case "Accuracy (high to low)":
        cardsCopy.sort((a, b) => {
          const aAccuracy =
            a.timesStudied === 0 ? 0 : a.timesCorrect / a.timesStudied;
          const bAccuracy =
            b.timesStudied === 0 ? 0 : b.timesCorrect / b.timesStudied;
          return bAccuracy - aAccuracy;
        });
        break;

      case "Accuracy (low to high)":
        cardsCopy.sort((a, b) => {
          const aAccuracy =
            a.timesStudied === 0 ? 0 : a.timesCorrect / a.timesStudied;
          const bAccuracy =
            b.timesStudied === 0 ? 0 : b.timesCorrect / b.timesStudied;
          return aAccuracy - bAccuracy;
        });
        break;
    }

    setFilteredCards([...cardsCopy]);
  }, [sortBy, colorFilteredCards]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return (
    <div className="wrapper">
      <div className="content">
        {!fetching && (
          <div id="cards-container">
            <div id="cards-top">
              <div className="top">
                <div
                  className={
                    selected.length
                      ? "cut deck-options-container"
                      : "deck-options-container"
                  }
                >
                  {deckId && (
                    <img
                      src={
                        deckPrivacy && deckPrivacy === "PRIVATE"
                          ? images.private
                          : images.public
                      }
                      alt={
                        deckPrivacy && deckPrivacy === "PRIVATE"
                          ? "private"
                          : "public"
                      }
                    />
                  )}
                  <h1 onClick={() => console.log(decks)}>
                    {deckId ? deckName : "All cards"}
                  </h1>
                  {deckId && !selected.length && authorized && (
                    <a href={`/decks/${deckId}/edit`}>Edit deck</a>
                  )}
                  {deckId && !authorized && (
                    <button
                      type="button"
                      onClick={async () => {
                        const response = await createDeckCopy(deckId);
                        if (response) {
                          alert("Deck successfully copied.");
                        }
                      }}
                    >
                      Copy to decks
                    </button>
                  )}
                </div>
                <div className="select-options-container">
                  {selected.length > 0 &&
                    selected.every((card) => card.inCurrentStack === false) && (
                      <button
                        type="button"
                        className="add-all"
                        onClick={async () => {
                          if (addingToStack) return;
                          try {
                            setAddingToStack(true);
                            const results = await updateFlashcardReviewStatus(
                              selected.map((card) => card.id)
                            );
                            if (results && results.length > 0) {
                              const updatedCards = [...cards];
                              results.forEach((result) => {
                                const cardIndex = updatedCards.findIndex(
                                  (flashcard) => flashcard.id === result.id
                                );

                                if (cardIndex !== -1) {
                                  updatedCards[cardIndex].inCurrentStack =
                                    result.inCurrentStack;
                                }
                              });
                              setCards(updatedCards);
                            }
                          } finally {
                            setAddingToStack(false);
                            setSelected([]);
                          }
                        }}
                      >
                        <img src={images.add} alt="" />
                        <span>
                          Add {selected.length}{" "}
                          {selected.length > 1 ? "cards" : "card"} to stack
                        </span>
                      </button>
                    )}
                  {selected.length > 0 &&
                    selected.every((card) => card.inCurrentStack === true) && (
                      <button
                        type="button"
                        className="remove-all"
                        onClick={async () => {
                          if (addingToStack) return;
                          try {
                            setAddingToStack(true);
                            const results = await updateFlashcardReviewStatus(
                              selected.map((card) => card.id)
                            );
                            if (results && results.length > 0) {
                              const updatedCards = [...cards];
                              results.forEach((result) => {
                                const cardIndex = updatedCards.findIndex(
                                  (flashcard) => flashcard.id === result.id
                                );

                                if (cardIndex !== -1) {
                                  updatedCards[cardIndex].inCurrentStack =
                                    result.inCurrentStack;
                                }
                              });
                              setCards(updatedCards);
                            }
                          } finally {
                            setAddingToStack(false);
                            setSelected([]);
                          }
                        }}
                      >
                        <img src={images.subtract} alt="" />
                        <span>
                          Remove {selected.length}{" "}
                          {selected.length > 1 ? "cards" : "card"} from stack
                        </span>
                      </button>
                    )}
                  {selected.length > 0 && !deckId && (
                    <button
                      type="button"
                      className={
                        selectedDeck ? "move-all valid" : "move-all invalid"
                      }
                      onClick={async () => {
                        const response = await addFlashcardsToDeck(
                          selected.map((card) => card.id),
                          selectedDeck
                        );
                        if (response && Array.isArray(response)) {
                          setCards((prevCards) => {
                            const newCards = [...prevCards];
                            response.forEach((updatedCard) => {
                              const index = newCards.findIndex(
                                (card) => card.id === updatedCard.id
                              );
                              if (index !== -1) {
                                newCards[index] = updatedCard;
                              }
                            });
                            return newCards;
                          });
                          setSelected([]);
                          setSelectedDeck("");
                        }
                      }}
                    >
                      <img src={images.move} alt="" />
                      <span>
                        Add {selected.length}{" "}
                        {selected.length > 1 ? "cards" : "card"} to deck:
                      </span>
                      <div className="deck-select">
                        <select
                          defaultValue=""
                          onChange={(e) => setSelectedDeck(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="" disabled>
                            Choose a deck
                          </option>
                          {decks
                            ?.filter(
                              (deck) =>
                                !selected.length ||
                                selected.every(
                                  (card) =>
                                    !(card.decks || []).some(
                                      (cardDeck) => cardDeck.id === deck.id
                                    )
                                )
                            )
                            .map((deck) => (
                              <option key={deck.id} value={deck.id}>
                                {deck.name.length > 20
                                  ? deck.name.slice(0, 20) + "..."
                                  : deck.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </button>
                  )}
                  {selected.length > 0 && deckId && (
                    <button
                      type="button"
                      className="remove-all valid"
                      onClick={async () => {
                        const response = await removeFlashcardsFromDeck(
                          selected.map((card) => card.id),
                          deckId
                        );
                        if (response) {
                          setCards((prevCards) =>
                            prevCards.filter(
                              (card) =>
                                !selected.some(
                                  (selectedCard) => selectedCard.id === card.id
                                )
                            )
                          );
                          setSelected([]);
                        }
                      }}
                    >
                      <img src={images.subtract} alt="" />
                      <span>
                        Remove {selected.length}{" "}
                        {selected.length > 1 ? "cards" : "card"} from deck
                      </span>
                    </button>
                  )}
                  {selected.length > 0 && (
                    <button
                      type="button"
                      className="delete-all"
                      onClick={async () => {
                        const response = await deleteFlashcards(
                          selected.map((card) => card.id)
                        );
                        if (response) {
                          setCards((prevCards) =>
                            prevCards.filter((card) => !selected.includes(card))
                          );
                          setSelected([]);
                        }
                      }}
                    >
                      <img src={images.delete} alt="" />
                      <span>
                        Delete {selected.length}{" "}
                        {selected.length > 1 ? "cards" : "card"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
              <div className="bottom">
                <div className="left">
                  <div className="search">
                    <select
                      className="filter-select"
                      onChange={(e) =>
                        setSearchType(e.target.value as SearchType)
                      }
                      aria-label="select filter method"
                    >
                      <option value="" disabled>
                        Select filter...
                      </option>
                      <option value="text">Has text</option>
                      <option value="tag">Has tags</option>
                      {!deckId && <option value="deck">In deck</option>}
                    </select>
                    <input
                      type="search"
                      placeholder={
                        searchType === "text"
                          ? "Search term"
                          : searchType === "tag"
                          ? "Tags (comma separated)"
                          : "Decks (comma separated)"
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {!searchTerm && <img src={images.search} alt="" />}
                    {searchTerm && (
                      <img
                        src={images.clear}
                        className="clear"
                        onClick={() => setSearchTerm("")}
                        alt="clear"
                      />
                    )}
                  </div>
                  <div className="study-checkboxes">
                    {authorized && (
                      <div className="review">
                        <button
                          onClick={() => {
                            const newState =
                              dueForReviewCheckbox === "neutral"
                                ? "on"
                                : dueForReviewCheckbox === "on"
                                ? "off"
                                : "neutral";
                            setDueForReviewCheckbox(newState);
                            setSelected([]);
                          }}
                          role="checkbox"
                          aria-checked={
                            dueForReviewCheckbox === "on"
                              ? "true"
                              : dueForReviewCheckbox === "off"
                              ? "false"
                              : "mixed"
                          }
                          aria-labelledby="due-for-review-label"
                        >
                          {dueForReviewCheckbox === "on"
                            ? "✓"
                            : dueForReviewCheckbox === "off"
                            ? "✗"
                            : "\u00A0"}
                        </button>
                        <label id="due-for-review-label">Due for review</label>
                      </div>
                    )}
                    {authorized && (
                      <div className="current">
                        <button
                          onClick={() => {
                            const newState =
                              currentStackCheckbox === "neutral"
                                ? "on"
                                : currentStackCheckbox === "on"
                                ? "off"
                                : "neutral";
                            setCurrentStackCheckbox(newState);
                            setSelected([]);
                          }}
                          role="checkbox"
                          aria-checked={
                            currentStackCheckbox === "on"
                              ? "true"
                              : currentStackCheckbox === "off"
                              ? "false"
                              : "mixed"
                          }
                          aria-labelledby="current-stack-label"
                        >
                          {currentStackCheckbox === "on"
                            ? "✓"
                            : currentStackCheckbox === "off"
                            ? "✗"
                            : "\u00A0"}
                        </button>
                        <label id="current-stack-label">In current stack</label>
                      </div>
                    )}
                  </div>
                  <div
                    className="color-filter"
                    role="group"
                    aria-label="Filter cards by color"
                  >
                    {colors.map((color) => (
                      <button
                        type="button"
                        key={color.hex}
                        onClick={() => {
                          if (colorFilter.includes(color.name)) {
                            setColorFilter(
                              colorFilter.filter((name) => name !== color.name)
                            );
                          } else {
                            setColorFilter((prev) => [...prev, color.name]);
                          }
                        }}
                        aria-pressed={colorFilter.includes(color.name)}
                        aria-label={`${color.name} ${
                          colorFilter.includes(color.name) ? "selected" : ""
                        }`}
                      >
                        <p
                          style={{ backgroundColor: color.name }}
                          aria-hidden="true"
                        ></p>
                        {colorFilter.includes(color.name) && (
                          <div aria-hidden="true">
                            <img src={images.check} alt="" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                {(!filteredCards.length && cards.length > 1) ||
                  (filteredCards.length > 0 && (
                    <div className="right">
                      {authorized && (
                        <div className="select-all">
                          <span>Select all</span>
                          <input
                            type="checkbox"
                            aria-label="select all"
                            checked={
                              selected.length === cards.length ||
                              (selected.length === filteredCards.length &&
                                selected.length > 0)
                            }
                            onChange={(e) => {
                              if (e.target.checked && filteredCards.length) {
                                setSelected(filteredCards);
                              } else if (
                                e.target.checked &&
                                !filteredCards.length
                              ) {
                                setSelected(cards);
                              } else {
                                setSelected([]);
                              }
                            }}
                          />
                        </div>
                      )}
                      {selected.length > 0 && (
                        <p>
                          {selected.length}{" "}
                          {selected.length > 1 ? "cards" : "card"} selected
                        </p>
                      )}
                      <div className="filter">
                        <button
                          type="button"
                          onClick={() => setSortByModal(!sortByModal)}
                        >
                          <img
                            src={images.filter}
                            alt="filter"
                            style={
                              sortBy === "Date updated (oldest to newest)" ||
                              sortBy === "Date created (oldest to newest)" ||
                              sortBy === "Times studied (low to high)" ||
                              sortBy === "Last studied (oldest to newest)" ||
                              sortBy === "Accuracy (low to high)"
                                ? { rotate: "180deg" }
                                : {}
                            }
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
                            {authorized && (
                              <p
                                className={
                                  sortBy === "Times studied (high to low)"
                                    ? "active"
                                    : ""
                                }
                                onClick={() => {
                                  setSortBy("Times studied (high to low)");
                                  setSortByModal(false);
                                }}
                              >
                                Times studied (high to low)
                              </p>
                            )}
                            {authorized && (
                              <p
                                className={
                                  sortBy === "Times studied (low to high)"
                                    ? "active"
                                    : ""
                                }
                                onClick={() => {
                                  setSortBy("Times studied (low to high)");
                                  setSortByModal(false);
                                }}
                              >
                                Times studied (low to high)
                              </p>
                            )}
                            {authorized && (
                              <p
                                className={
                                  sortBy === "Last studied (newest to oldest)"
                                    ? "active"
                                    : ""
                                }
                                onClick={() => {
                                  setSortBy("Last studied (newest to oldest)");
                                  setSortByModal(false);
                                }}
                              >
                                Last studied (newest to oldest)
                              </p>
                            )}
                            {authorized && (
                              <p
                                className={
                                  sortBy === "Last studied (oldest to newest)"
                                    ? "active"
                                    : ""
                                }
                                onClick={() => {
                                  setSortBy("Last studied (oldest to newest)");
                                  setSortByModal(false);
                                }}
                              >
                                Last studied (oldest to newest)
                              </p>
                            )}
                            {authorized && (
                              <p
                                className={
                                  sortBy === "Accuracy (high to low)"
                                    ? "active"
                                    : ""
                                }
                                onClick={() => {
                                  setSortBy("Accuracy (high to low)");
                                  setSortByModal(false);
                                }}
                              >
                                Accuracy (high to low)
                              </p>
                            )}
                            {authorized && (
                              <p
                                className={
                                  sortBy === "Accuracy (low to high)"
                                    ? "active"
                                    : ""
                                }
                                onClick={() => {
                                  setSortBy("Accuracy (low to high)");
                                  setSortByModal(false);
                                }}
                              >
                                Accuracy (low to high)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div id="cards-middle">
              {filteredCards?.map((card: ServerCard, i) => (
                <div className="card-container" key={card.id}>
                  {authorized && (
                    <div className="checkbox-container">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelected([...selected, card]);
                          } else {
                            setSelected(
                              selected.filter((select) => select !== card)
                            );
                          }
                        }}
                        aria-label="select"
                        checked={selected.includes(card)}
                      />
                    </div>
                  )}
                  <div className="card">
                    <div
                      className="card-top"
                      key={card.id}
                      style={{
                        backgroundColor: `${
                          colors.filter(
                            (color) => color.name === card.backgroundColor
                          )[0].hex
                        }`,
                      }}
                      onMouseOver={() => setHovered(i)}
                      onMouseLeave={() => setHovered(-1)}
                    >
                      <div className="text">
                        <h2
                          className="front"
                          style={{
                            color: `${
                              colors.filter(
                                (color) => color.name === card.backgroundColor
                              )[0].contrast
                            }`,
                          }}
                        >
                          {card.front}
                        </h2>
                        <h2
                          className="back"
                          style={{
                            color: `${
                              colors.filter(
                                (color) => color.name === card.backgroundColor
                              )[0].contrast
                            }`,
                          }}
                        >
                          {card.back}
                        </h2>
                      </div>
                      {card.tags && card.tags.length > 0 && (
                        <div className="tags">
                          {card.tags?.map((tag, i) => (
                            <p key={i}>{tag}</p>
                          ))}
                        </div>
                      )}
                      {authorized &&
                        hovered === i &&
                        !dropped.includes(card.id) && (
                          <div className="card-top-hovered">
                            <img
                              src={images.expand}
                              alt="show options"
                              onClick={() => setDropped([...dropped, card.id])}
                            />
                          </div>
                        )}
                      {dropped.includes(card.id) && (
                        <div className="card-top-dropped">
                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                setDropped(
                                  dropped.filter((id) => id !== card.id)
                                )
                              }
                            >
                              <img src={images.close} alt="close options" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (addingToStack) return;
                              try {
                                setAddingToStack(true);
                                const results =
                                  await updateFlashcardReviewStatus([card.id]);
                                if (results && results.length > 0) {
                                  const updatedCards = [...cards];
                                  const cardIndex = updatedCards.findIndex(
                                    (flashcard) => flashcard.id === card.id
                                  );
                                  if (cardIndex !== -1) {
                                    updatedCards[cardIndex].inCurrentStack =
                                      results[0].inCurrentStack;
                                    setCards(updatedCards);
                                  }
                                }
                              } finally {
                                setAddingToStack(false);
                              }
                            }}
                            className={addingToStack ? "invalid" : "valid"}
                          >
                            <img
                              src={
                                card.inCurrentStack === true
                                  ? images.subtract
                                  : images.add
                              }
                              alt=""
                            />
                            {card.inCurrentStack === true ? (
                              <p className="remove">
                                Remove from current stack
                              </p>
                            ) : (
                              <p className="add">Add to current stack</p>
                            )}
                          </button>
                          <a href={`/cards/${card.id}`}>
                            <img src={images.edit} alt="" />
                            <p>Edit card</p>
                          </a>
                          <button
                            type="button"
                            onClick={async () => {
                              const response = await deleteFlashcards([
                                card.id,
                              ]);
                              if (response) {
                                setDropped(
                                  dropped.filter((id) => id !== card.id)
                                );
                                setCards(
                                  cards.filter(
                                    (oldCard) => oldCard.id !== card.id
                                  )
                                );
                              }
                            }}
                          >
                            <img src={images.delete} alt="" />
                            <p>Delete card</p>
                          </button>
                        </div>
                      )}
                    </div>
                    {authorized && (
                      <div
                        className={
                          card.inCurrentStack ? "card-bottom in" : "card-bottom"
                        }
                      >
                        {card.dueForReview &&
                          new Date(card.dueForReview) < new Date() && (
                            <img
                              className="exclamation"
                              src={images.exclamation}
                              alt="due for review"
                            />
                          )}
                        {!deckId && (
                          <div>
                            <img src={images.deck} alt="" />
                            {card.decks && card.decks.length === 1 && (
                              <a href={`/decks/${card.decks[0].id}`}>
                                {card.decks[0].name.length > 20
                                  ? card.decks[0].name.slice(0, 20) + "..."
                                  : card.decks[0].name}
                              </a>
                            )}
                            {card.decks && card.decks.length > 1 && (
                              <p>{card.decks.length} decks</p>
                            )}
                            {!card.decks!.length && <p>N/A</p>}
                          </div>
                        )}
                        <div>
                          <img src={images.times_reviewed} alt="" />
                          <p>
                            Studied {card.timesStudied}{" "}
                            {card.timesStudied < 1 || card.timesStudied > 1
                              ? "times"
                              : "time"}
                          </p>
                        </div>
                        <div>
                          <img src={images.last_reviewed} alt="" />
                          {card.lastStudied && (
                            <p>
                              Last studied on {formatDate(card.lastStudied)}
                            </p>
                          )}
                          {!card.lastStudied && <p>N/A</p>}
                        </div>
                        <div>
                          <img src={images.accuracy} alt="" />
                          {card.timesStudied > 0 && (
                            <p>
                              {(
                                (card.timesCorrect / card.timesStudied) *
                                100
                              ).toFixed(2)}
                              % accuracy ({card.timesCorrect}/
                              {card.timesStudied})
                            </p>
                          )}
                          {card.timesStudied === 0 && <p>N/A</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div id="cards-bottom"></div>
          </div>
        )}
      </div>
    </div>
  );
}
