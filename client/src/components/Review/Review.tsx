import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useParams, useLocation } from "react-router";
import { Tooltip } from "react-tooltip";
import {
  getAllFlashcardsDue,
  getAllFlashcardsInStack,
  updateFlashcardReviewStatus,
} from "../../services/cardApi";
import { getDeck } from "../../services/deckApi";
import { ServerCard } from "../../types/flashcard.types";
import { colors } from "../../types/flashcard.types";
import { images } from "../../assets/images";
import "./Review.css";
import { createSession } from "../../services/studyApi";

export default function Review() {
  const [fetching, setFetching] = useState(true);
  const [cards, setCards] = useState<ServerCard[]>([]);
  const [selected, setSelected] = useState<ServerCard[]>([]);
  const [mode, setMode] = useState<"Casual" | "Quiz">("Casual");
  const [timer, setTimer] = useState(false);
  const [tags, setTags] = useState(false);
  const [colored, setColored] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useNavigate();
  const { deckId } = useParams();
  const location = useLocation();

  document.title =
    location.pathname === "/study/due_for_review"
      ? "Due for review | Hipoca"
      : location.pathname === "/study/current_stack"
      ? "Current stack | Hipoca"
      : "Deck name | Hipoca";

  useEffect(() => {
    if (location.pathname === "/study/due_for_review") {
      document.title = "Due for review | Hipoca";
    } else if (location.pathname === "/study/current_stack") {
      document.title = "Current stack | Hipoca";
    } else if (deckId) {
      document.title = "Deck name | Hipoca";
    }
    if (location.pathname === "/study/current_stack") {
      const getStack = async () => {
        const response = await getAllFlashcardsInStack();
        if (response) {
          setCards(response);
          setFetching(false);
        }
      };
      getStack();
    } else if (location.pathname === "/study/due_for_review") {
      const getDue = async () => {
        const response = await getAllFlashcardsDue();
        if (response) {
          setCards(response);
          setFetching(false);
        }
      };
      getDue();
    } else if (deckId) {
      const getCardsInDeck = async () => {
        const response = await getDeck(deckId);
        if (response) {
          setCards(response.cards);
          setFetching(false);
        }
      };
      getCardsInDeck();
    }
  }, [location.pathname, deckId]);

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
          <div id="review-container">
            <div id="review-container-top">
              <h1>
                {cards.length} {cards.length !== 1 ? "cards" : "card"} for
                review
              </h1>
              {cards.length > 0 && (
                <div>
                  <div id="options-container">
                    <div className="option">
                      <div
                        style={
                          mode === "Casual"
                            ? { color: "#008080" }
                            : { color: "#000000" }
                        }
                      >
                        Casual mode
                        <Tooltip
                          anchorSelect=".casual-anchor"
                          place="top"
                          style={{ width: "300px" }}
                        >
                          In casual mode, you choose when to advance to the next
                          flashcard. This mode does not affect accuracy stats.
                        </Tooltip>
                        <img
                          src={images.help}
                          className="casual-anchor"
                          alt="about casual mode"
                        />
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={mode === "Quiz"}
                          onChange={() =>
                            setMode(mode === "Casual" ? "Quiz" : "Casual")
                          }
                          aria-label="review mode"
                        />
                        <span className="slider round mode"></span>
                      </label>
                      <div
                        style={
                          mode === "Quiz"
                            ? { color: "#DC143C" }
                            : { color: "#000000" }
                        }
                      >
                        Quiz mode
                        <Tooltip
                          anchorSelect=".quiz-anchor"
                          place="top"
                          style={{ width: "300px" }}
                        >
                          In quiz mode, you must enter the correct answer before
                          you can advance to the next flashcard.
                        </Tooltip>
                        <img
                          src={images.help}
                          className="quiz-anchor"
                          alt="about quiz mode"
                        />
                      </div>
                    </div>
                    <div className="option">
                      <div>Timer off</div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={timer}
                          onChange={() => setTimer(!timer)}
                          aria-label="Timer on/off"
                        />
                        <span className="slider round timer"></span>
                      </label>
                      <div>Timer on</div>
                    </div>
                    <div className="option">
                      <div>Hide tags</div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={tags}
                          onChange={() => setTags(!tags)}
                          aria-label="Show/hide tags"
                        />
                        <span className="slider round tags"></span>
                      </label>
                      <div>Show tags</div>
                    </div>
                    <div className="option">
                      <div>
                        Colorless
                        <Tooltip
                          anchorSelect=".colorless-anchor"
                          place="top"
                          style={{ width: "300px" }}
                        >
                          All cards will be the same color.
                        </Tooltip>
                        <img
                          src={images.help}
                          className="colorless-anchor"
                          alt="about colorless"
                        />
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={colored}
                          onChange={() => setColored(!colored)}
                          aria-label="Colorless/colored cards"
                        />
                        <span className="slider round tags"></span>
                      </label>
                      <div>Colored</div>
                    </div>
                  </div>
                  <div className="start-buttons">
                    {selected.length > 0 &&
                      selected.length !== cards.length && (
                        <button
                          className="selected"
                          onClick={async (
                            e: React.MouseEvent<HTMLButtonElement>
                          ) => {
                            e.stopPropagation();
                            if (isNavigating) return;
                            setIsNavigating(true);
                            try {
                              const session = await createSession({
                                type:
                                  location.pathname === "/study/due_for_review"
                                    ? "due"
                                    : location.pathname ===
                                      "/study/current_stack"
                                    ? "current"
                                    : "deck",
                                settings: { mode, timer, tags, colored },
                                cards: selected.map((card) => card.id),
                              });
                              if (session) {
                                navigate(`/study/session/${session.id}`, {
                                  replace: true,
                                });
                              }
                            } catch (error) {
                              console.error("Error creating session:", error);
                            } finally {
                              setIsNavigating(false);
                            }
                          }}
                        >
                          Study selected ({selected.length})
                        </button>
                      )}
                    <button
                      className="all"
                      onClick={async (
                        e: React.MouseEvent<HTMLButtonElement>
                      ) => {
                        e.stopPropagation();
                        if (isNavigating) return;
                        setIsNavigating(true);
                        try {
                          const session = await createSession({
                            type:
                              location.pathname === "/study/due_for_review"
                                ? "due"
                                : location.pathname === "/study/current_stack"
                                ? "current"
                                : "deck",
                            settings: { mode, timer, tags, colored },
                            cards: cards.map((card) => card.id),
                          });
                          if (session) {
                            navigate(`/study/session/${session.id}`, {
                              replace: true,
                            });
                          }
                        } catch (error) {
                          console.error("Error creating session:", error);
                        } finally {
                          setIsNavigating(false);
                        }
                      }}
                    >
                      Study all
                    </button>
                  </div>
                </div>
              )}
            </div>
            {cards.length > 0 && (
              <div id="review-container-bottom">
                <div>
                  {selected.length > 0 && (
                    <button
                      className="remove"
                      onClick={async () => {
                        try {
                          const results = await updateFlashcardReviewStatus(
                            selected.map((card) => card.id)
                          );
                          if (results && results.length > 0) {
                            setCards((prevCards) =>
                              prevCards.filter(
                                (card) => !selected.includes(card)
                              )
                            );
                            setSelected([]);
                          }
                        } finally {
                          setSelected([]);
                        }
                      }}
                    >
                      Remove {selected.length}{" "}
                      {selected.length > 1 ? "cards" : "card"} from current
                      stack
                    </button>
                  )}
                  <div className="select-all">
                    <span>Select all</span>
                    <input
                      type="checkbox"
                      checked={selected.length === cards.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected(cards);
                        } else {
                          setSelected([]);
                        }
                      }}
                      aria-label="Select all"
                    />
                  </div>
                </div>
                <div id="review-card-container">
                  {cards?.map((card: ServerCard) => (
                    <div className="card-container" key={card.id}>
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
                          aria-label="Select"
                          checked={selected.includes(card)}
                        />
                      </div>
                      <div className="card">
                        <div
                          className="card-top"
                          key={card.id}
                          style={
                            colored
                              ? {
                                  backgroundColor: `${
                                    colors.filter(
                                      (color) =>
                                        color.name === card.backgroundColor
                                    )[0].hex
                                  }`,
                                }
                              : {}
                          }
                        >
                          <div className="text">
                            <h2
                              className="front"
                              style={
                                colored
                                  ? {
                                      color: `${
                                        colors.filter(
                                          (color) =>
                                            color.name === card.backgroundColor
                                        )[0].contrast
                                      }`,
                                    }
                                  : {}
                              }
                            >
                              {card.front}
                            </h2>
                            <h2
                              className="back"
                              style={
                                colored
                                  ? {
                                      color: `${
                                        colors.filter(
                                          (color) =>
                                            color.name === card.backgroundColor
                                        )[0].contrast
                                      }`,
                                    }
                                  : {}
                              }
                            >
                              {card.back}
                            </h2>
                          </div>
                          {card.tags && card.tags.length > 0 && tags && (
                            <div className="tags">
                              {card.tags?.map((tag, i) => (
                                <p key={i}>{tag}</p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div
                          className={
                            card.inCurrentStack
                              ? "card-bottom in"
                              : "card-bottom"
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
                          <div>
                            <img src={images.calendar} alt="" />
                            <p>Due on {formatDate(card.dueForReview!)}</p>
                          </div>
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
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
