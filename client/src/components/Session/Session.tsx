import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router";
import { finishSession, startSession } from "../../services/studyApi";
import { ServerCard, CardResult } from "../../types/flashcard.types";
import { ServerSession } from "../../types/study.types";
import { colors } from "../../types/flashcard.types";
import "./Session.css";
import { images } from "../../assets/images";
import { Unauthorized } from "..";

export default function Session() {
  document.title = "Session | Hipoca";

  const [authorized, setAuthorized] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [session, setSession] = useState<ServerSession>();
  const [cards, setCards] = useState<ServerCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>();
  const [cardSide, setCardSide] = useState<"front" | "back">("front");
  const [reviewAgainSelection, setReviewAgainSelection] = useState<
    Date | string
  >("");
  const [reviewAgainClicked, setReviewAgainClicked] = useState<
    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  >(0);
  const [results, setResults] = useState<CardResult[]>([]);
  const [finishButtonClicked, setFinishButtonClicked] = useState(false);
  const [finishScreen, setFinishScreen] = useState(false);

  const { sessionId } = useParams();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!fetching && cards.length > 0) {
      setTimeout(() => {
        if (inputRef.current && !answerSubmitted) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [fetching, cards.length, answerSubmitted]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await startSession(sessionId!);
        if (response !== 401) {
          setAuthorized(true);
          setSession(response);
          const arr = response.cards;
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          setCards(arr);
        }
      } catch (error) {
        console.error("Error in checkSession:", error);
      } finally {
        setFetching(false);
      }
    };
    checkSession();
  }, [sessionId]);

  useEffect(() => {
    if (session && !session.end) {
      const handlePopstate = () => {
        window.location.href = "/study";
      };
      window.onbeforeunload = () => {
        return "Are you sure you want to leave? Your changes may not be saved.";
      };
      window.addEventListener("popstate", handlePopstate);
      return () => {
        window.onbeforeunload = null;
        window.removeEventListener("popstate", handlePopstate);
      };
    }
  }, [session, finishScreen]);

  const handleDateSelection = useCallback(
    (dateOption: string) => {
      const addDays = (days: number): Date => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + days);
        return date;
      };

      const daysMap: { [key: string]: number } = {
        today: 0,
        tomorrow: 1,
        "2days": 2,
        "1week": 7,
        "2weeks": 14,
        "1month": 30,
        "2months": 60,
      };
      setReviewAgainSelection(addDays(daysMap[dateOption]));
    },
    [setReviewAgainSelection]
  );

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const selectedDate = new Date(e.target.value);
      selectedDate.setHours(0, 0, 0, 0);
      setReviewAgainSelection(selectedDate);
      setReviewAgainClicked(8);
    } else {
      setReviewAgainSelection("");
      setReviewAgainClicked(0);
    }
  };

  const handleAnswerSubmit = useCallback(() => {
    const isCorrect =
      answer === cards[currentCardIndex].back || session!.mode === "Casual";
    if (isCorrect) {
      setCardSide("back");
    }
    if ((!answerSubmitted && answer) || session!.mode === "Casual") {
      setAnswerCorrect(isCorrect);
      setAnswerSubmitted(true);
      return;
    }
  }, [answerSubmitted, session, answer, cards, currentCardIndex]);

  const handleCardChange = useCallback(() => {
    setResults([
      ...results,
      {
        id: cards[currentCardIndex].id,
        correct: answer === cards[currentCardIndex].back,
        ...(reviewAgainSelection !== "" && {
          reviewAgain:
            reviewAgainSelection instanceof Date
              ? reviewAgainSelection.toISOString()
              : reviewAgainSelection,
        }),
      },
    ]);
    setReviewAgainSelection("");
    setReviewAgainClicked(0);
    setCurrentCardIndex(currentCardIndex + 1);
    setAnswer("");
    setAnswerSubmitted(false);
    setAnswerCorrect(null);
    setCardSide("front");
  }, [results, cards, currentCardIndex, answer, reviewAgainSelection]);

  const handleSessionFinish = useCallback(async () => {
    setFinishButtonClicked(true);
    if (
      results.filter((card) => card.id === cards[currentCardIndex].id).length <
      1
    ) {
      const updatedResults = [
        ...results,
        {
          id: cards[currentCardIndex].id,
          correct: answer === cards[currentCardIndex].back,
          ...(reviewAgainSelection !== "" && {
            reviewAgain:
              reviewAgainSelection instanceof Date
                ? reviewAgainSelection.toISOString()
                : reviewAgainSelection,
          }),
        },
      ];
      setResults(updatedResults);
      const response = await finishSession(sessionId!, updatedResults);
      if (response) {
        setSession(response);
        setFinishScreen(true);
      }
    } else {
      const response = await finishSession(sessionId!, results);
      if (response) {
        setSession(response);
        setFinishScreen(true);
      }
    }
  }, [
    results,
    cards,
    currentCardIndex,
    answer,
    reviewAgainSelection,
    sessionId,
  ]);
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target === inputRef.current) {
        return;
      }
      if (event.target instanceof HTMLInputElement && event.key !== "Enter") {
        return;
      }
      if (
        !answerSubmitted &&
        event.key === "s" &&
        currentCardIndex < cards.length - 1
      ) {
        setAnswer("");
        setCurrentCardIndex(() => currentCardIndex + 1);
        setCards([...cards, cards[currentCardIndex]]);
        event.preventDefault();
        return;
      }
      if (answerSubmitted && event.key >= "1" && event.key <= "7") {
        const buttonIndex = parseInt(event.key) - 1;
        if (reviewAgainClicked === buttonIndex + 1) {
          setReviewAgainClicked(0);
          setReviewAgainSelection("");
        } else {
          setReviewAgainClicked((buttonIndex + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7);
          const dateOptions = [
            "today",
            "tomorrow",
            "2days",
            "1week",
            "2weeks",
            "1month",
            "2months",
          ];
          if (buttonIndex <= 6) {
            handleDateSelection(dateOptions[buttonIndex]);
          } else if (buttonIndex === 7) {
            const dateInput = document.querySelector(
              'input[type="date"]'
            ) as HTMLInputElement;
            if (dateInput) {
              dateInput.click();
            }
          }
        }
        event.preventDefault();
      }
      if (answerSubmitted && event.key === " ") {
        setCardSide((current) => (current === "front" ? "back" : "front"));
        event.preventDefault();
      }
      if (
        !answerSubmitted &&
        session!.mode === "Casual" &&
        event.key === "Enter"
      ) {
        handleAnswerSubmit();
      }
      if (
        answerSubmitted &&
        event.key === "Enter" &&
        currentCardIndex < cards.length - 1
      ) {
        handleCardChange();
        event.preventDefault();
      }
      if (
        answerSubmitted &&
        event.key === "Enter" &&
        !finishButtonClicked &&
        currentCardIndex == cards.length - 1
      ) {
        handleSessionFinish();
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    session,
    handleAnswerSubmit,
    answerSubmitted,
    reviewAgainClicked,
    setReviewAgainClicked,
    setReviewAgainSelection,
    handleDateSelection,
    setCardSide,
    handleCardChange,
    handleSessionFinish,
    finishButtonClicked,
    currentCardIndex,
    cards.length,
    cards,
  ]);

  function calculateSessiontime(
    startTime: Date | string,
    endTime: Date | string
  ) {
    const start = startTime instanceof Date ? startTime : new Date(startTime);
    const end = endTime instanceof Date ? endTime : new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const totalSeconds = durationMs / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const hours = Math.floor(totalSeconds / 3600);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    } else if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${totalSeconds.toFixed(2)}s`;
    }
  }

  function calculateReviewSpeed(
    startTime: Date | string,
    endTime: Date | string,
    cardCount: number
  ): string {
    const start = startTime instanceof Date ? startTime : new Date(startTime);
    const end = endTime instanceof Date ? endTime : new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const secondsPerCard = durationMs / 1000 / cardCount;
    const seconds = Math.floor(secondsPerCard % 60);
    const minutes = Math.floor((secondsPerCard / 60) % 60);
    const hours = Math.floor(secondsPerCard / 3600);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    } else if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${secondsPerCard.toFixed(2)}s`;
    }
  }

  return (
    <div className="wrapper">
      <div className="content">
        {!fetching && authorized && (
          <div id="session-container">
            {!session && !finishScreen && (
              <div id="invalid-session">
                <p>
                  The session is no longer valid. Click{" "}
                  <a href="/study">here</a> to start a new session.
                </p>
              </div>
            )}
            {session && !session.end && !finishScreen && cards.length > 0 && (
              <div id="valid-session">
                <div id="valid-session-top"></div>
                <div id="valid-session-bottom">
                  <div id="card-container">
                    <div
                      className={
                        cardSide === "front" ? "card front" : "card back"
                      }
                      style={
                        session.colored
                          ? {
                              backgroundColor: colors.filter(
                                (color) =>
                                  color.name ===
                                  cards[currentCardIndex].backgroundColor
                              )[0].hex,
                            }
                          : {}
                      }
                    >
                      <p
                        style={
                          session.colored
                            ? {
                                color: colors.filter(
                                  (color) =>
                                    color.name ===
                                    cards[currentCardIndex].backgroundColor
                                )[0].contrast,
                              }
                            : {}
                        }
                      >
                        {cardSide === "front"
                          ? cards[currentCardIndex].front
                          : cards[currentCardIndex].back}
                      </p>

                      {session.tags && !answerSubmitted && (
                        <ul>
                          {cards[currentCardIndex].tags?.map((tag, i) => (
                            <li key={i}>{tag}</li>
                          ))}
                        </ul>
                      )}
                      {answerSubmitted && (
                        <button
                          onClick={() =>
                            setCardSide((current) =>
                              current === "front" ? "back" : "front"
                            )
                          }
                        >
                          <img src={images.flip} alt="flip" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div id="panel-container">
                    {session.mode === "Quiz" && (
                      <div className="top quiz">
                        <h2>Answer</h2>
                        <div className="input-container">
                          <input
                            ref={inputRef}
                            type="text"
                            value={answer}
                            disabled={answerSubmitted}
                            onChange={(e) => {
                              if (!answerSubmitted) setAnswer(e.target.value);
                            }}
                            className={
                              answerCorrect === true
                                ? "correct"
                                : answerCorrect === false
                                ? "incorrect"
                                : ""
                            }
                            onKeyDown={(e) => {
                              if (e.key !== "Enter") return;
                              if (!answerSubmitted) {
                                handleAnswerSubmit();
                              } else if (currentCardIndex < cards.length - 1) {
                                handleCardChange();
                              }
                              e.preventDefault();
                            }}
                          />
                          {answerCorrect && (
                            <img src={images.correct} alt="correct" />
                          )}
                          {answerCorrect === false && (
                            <img src={images.incorrect} alt="incorrect" />
                          )}
                        </div>
                        <div className="buttons">
                          {currentCardIndex < cards.length - 1 && (
                            <button
                              type="button"
                              className={
                                answerSubmitted ? "skip invalid" : "skip valid"
                              }
                              onClick={() => {
                                if (!answerSubmitted) {
                                  setAnswer("");
                                  setCurrentCardIndex(
                                    () => currentCardIndex + 1
                                  );
                                  setCards([...cards, cards[currentCardIndex]]);
                                }
                              }}
                            >
                              Skip
                            </button>
                          )}
                          {!answerSubmitted && (
                            <button
                              type="button"
                              className={
                                answer ? "submit valid" : "answer invalid"
                              }
                              onClick={() => {
                                handleAnswerSubmit();
                              }}
                            >
                              Submit
                            </button>
                          )}
                          {answerSubmitted &&
                            currentCardIndex < cards.length - 1 && (
                              <button
                                type="button"
                                className="next"
                                onClick={() => {
                                  handleCardChange();
                                }}
                              >
                                Next
                              </button>
                            )}
                          {answerSubmitted &&
                            currentCardIndex == cards.length - 1 && (
                              <button
                                type="button"
                                className="finish"
                                onClick={() => {
                                  if (!finishButtonClicked)
                                    handleSessionFinish();
                                }}
                              >
                                Finish
                              </button>
                            )}
                        </div>
                      </div>
                    )}
                    {session.mode === "Casual" && (
                      <div className="top casual">
                        {!answerSubmitted &&
                          currentCardIndex < cards.length - 1 && (
                            <button
                              type="button"
                              className="skip"
                              onClick={() => {
                                setCurrentCardIndex(() => currentCardIndex + 1);
                                setCards([...cards, cards[currentCardIndex]]);
                              }}
                            >
                              Skip
                            </button>
                          )}
                        {!answerSubmitted && (
                          <button
                            type="button"
                            className="reveal"
                            onClick={() => handleAnswerSubmit()}
                          >
                            Reveal
                          </button>
                        )}
                        {answerSubmitted &&
                          currentCardIndex < cards.length - 1 && (
                            <button
                              type="button"
                              className="next"
                              onClick={() => handleCardChange()}
                            >
                              Next
                            </button>
                          )}
                        {answerSubmitted &&
                          currentCardIndex === cards.length - 1 && (
                            <button
                              type="button"
                              className="next"
                              onClick={() => handleSessionFinish()}
                            >
                              Finish
                            </button>
                          )}
                      </div>
                    )}
                    {answerSubmitted && (
                      <div
                        className={
                          session.mode === "Casual"
                            ? "middle casual"
                            : "middle quiz"
                        }
                      >
                        <h2>Review again?</h2>
                        <div className="buttons">
                          <button
                            onClick={() => {
                              if (reviewAgainClicked === 1) {
                                setReviewAgainClicked(0);
                                setReviewAgainSelection("");
                              } else {
                                setReviewAgainClicked(1);
                                handleDateSelection("today");
                              }
                            }}
                            className={
                              reviewAgainClicked === 1 ? "selected" : ""
                            }
                          >
                            Today
                          </button>
                          <button
                            onClick={() => {
                              if (reviewAgainClicked === 2) {
                                setReviewAgainClicked(0);
                                setReviewAgainSelection("");
                              } else {
                                setReviewAgainClicked(2);
                                handleDateSelection("tomorrow");
                              }
                            }}
                            className={
                              reviewAgainClicked === 2 ? "selected" : ""
                            }
                          >
                            Tomorrow
                          </button>
                          <button
                            onClick={() => {
                              if (reviewAgainClicked === 3) {
                                setReviewAgainClicked(0);
                                setReviewAgainSelection("");
                              } else {
                                setReviewAgainClicked(3);
                                handleDateSelection("2days");
                              }
                            }}
                            className={
                              reviewAgainClicked === 3 ? "selected" : ""
                            }
                          >
                            In 2 days
                          </button>
                          <button
                            onClick={() => {
                              if (reviewAgainClicked === 4) {
                                setReviewAgainClicked(0);
                                setReviewAgainSelection("");
                              } else {
                                setReviewAgainClicked(4);
                                handleDateSelection("1week");
                              }
                            }}
                            className={
                              reviewAgainClicked === 4 ? "selected" : ""
                            }
                          >
                            In 1 week
                          </button>
                          <button
                            onClick={() => {
                              if (reviewAgainClicked === 5) {
                                setReviewAgainClicked(0);
                                setReviewAgainSelection("");
                              } else {
                                setReviewAgainClicked(5);
                                handleDateSelection("2weeks");
                              }
                            }}
                            className={
                              reviewAgainClicked === 5 ? "selected" : ""
                            }
                          >
                            In 2 weeks
                          </button>
                          <button
                            onClick={() => {
                              if (reviewAgainClicked === 6) {
                                setReviewAgainClicked(0);
                                setReviewAgainSelection("");
                              } else {
                                setReviewAgainClicked(6);
                                handleDateSelection("1month");
                              }
                            }}
                            className={
                              reviewAgainClicked === 6 ? "selected" : ""
                            }
                          >
                            In 1 month
                          </button>
                          <button
                            onClick={() => {
                              if (reviewAgainClicked === 7) {
                                setReviewAgainClicked(0);
                                setReviewAgainSelection("");
                              } else {
                                setReviewAgainClicked(7);
                                handleDateSelection("2months");
                              }
                            }}
                            className={
                              reviewAgainClicked === 7 ? "selected" : ""
                            }
                          >
                            In 2 months
                          </button>
                          <button
                            onClick={() => {
                              if (reviewAgainClicked === 8) {
                                setReviewAgainClicked(0);
                                setReviewAgainSelection("");
                              } else {
                                const dateInput = document.querySelector(
                                  'input[type="date"]'
                                ) as HTMLInputElement;
                                if (dateInput && dateInput.value) {
                                  setReviewAgainClicked(8);
                                  const selectedDate = new Date(
                                    dateInput.value
                                  );
                                  selectedDate.setHours(0, 0, 0, 0);
                                  setReviewAgainSelection(selectedDate);
                                } else if (dateInput) {
                                  dateInput.click();
                                }
                              }
                            }}
                            className={`custom ${
                              reviewAgainClicked === 8 ? "selected" : ""
                            }`}
                          >
                            <input
                              type="date"
                              onClick={(e) => e.stopPropagation()}
                              onChange={handleDateInputChange}
                              min={new Date().toISOString().split("T")[0]}
                            />
                          </button>
                        </div>
                      </div>
                    )}
                    {answerSubmitted && (
                      <div
                        className={
                          session.mode === "Casual"
                            ? "bottom casual"
                            : "bottom quiz"
                        }
                      >
                        {currentCardIndex < cards.length - 1 && (
                          <button
                            type="button"
                            className="end"
                            onClick={() => {
                              if (!finishButtonClicked) handleSessionFinish();
                            }}
                          >
                            End session
                          </button>
                        )}
                        {currentCardIndex === cards.length - 1 && (
                          <p>You're all finished!</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {session && session.end && (
              <div id="finished-session">
                <h1>
                  Your session on{" "}
                  {new Date(session.end).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  :
                </h1>
                <div
                  className={
                    session.mode === "Quiz" ? "statistics" : "statistics casual"
                  }
                >
                  <div>
                    <img src={images.reviewed} alt="" />
                    <span>
                      {session.cardsReviewed}{" "}
                      {session.cardsReviewed > 1 ? "cards " : "card "} reviewed
                    </span>
                  </div>
                  <div>
                    <img src={images.clock} alt="" />
                    {session.timer && (
                      <span>
                        {calculateSessiontime(session.start, session.end)}{" "}
                        review time
                      </span>
                    )}
                    {!session.timer && <span>Untimed</span>}
                  </div>
                  <div>
                    <img src={images.speed} alt="" />
                    {session.timer && (
                      <span>
                        {calculateReviewSpeed(
                          session.start,
                          session.end,
                          session.cardsReviewed
                        )}{" "}
                        / card
                      </span>
                    )}
                    {!session.timer && <span>N/A</span>}
                  </div>
                  {session.mode === "Quiz" && (
                    <div>
                      <img src={images.correct} alt="" />
                      <span>
                        {session.numCorrect}{" "}
                        {session.numCorrect < 1 || session.numCorrect > 1
                          ? "cards "
                          : "card "}
                        correct
                      </span>
                    </div>
                  )}
                  {session.mode === "Quiz" && (
                    <div>
                      <img src={images.incorrect} alt="" />
                      <span>
                        {session.cardsReviewed - session.numCorrect}{" "}
                        {session.cardsReviewed - session.numCorrect < 1 ||
                        session.cardsReviewed - session.numCorrect > 1
                          ? "cards "
                          : "card "}
                        incorrect
                      </span>
                    </div>
                  )}
                  {session.mode === "Quiz" && (
                    <div>
                      <img src={images.accuracy} alt="" />
                      <span>
                        {`${(
                          (session.numCorrect / session.cardsReviewed) *
                          100
                        ).toFixed(2)}%`}{" "}
                        accuracy
                      </span>
                    </div>
                  )}
                </div>
                <a href="/study">Return</a>
              </div>
            )}
          </div>
        )}
        {!fetching && !authorized && <Unauthorized />}
      </div>
    </div>
  );
}
