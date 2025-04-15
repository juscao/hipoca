import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { images } from "../../assets/images";
import { createFlashcard, updateFlashcard } from "../../services/cardApi";
import { getFlashcard } from "../../services/cardApi";
import { getAllDecks } from "../../services/deckApi";
import { colors } from "../../types/flashcard.types";
import { ServerDeck } from "../../types/deck.types";
import "./Flashcard.css";

export default function Flashcard() {
  const [cardSide, setCardSide] = useState<"front" | "back">("front");
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [backgroundColor, setBackgroundColor] = useState<Color>("White");
  const [decks, setDecks] = useState<ServerDeck[]>([]);
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const [deckDropdown, setDeckDropdown] = useState(false);
  const [hasScrollbar, setHasScrollbar] = useState(false);
  const [calling, setCalling] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    color: "green" | "red";
  }>({ text: "", color: "green" });

  type Color = (typeof colors)[number]["name"];

  const { cardId } = useParams();

  const scrollRef = useRef<HTMLParagraphElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && event.target instanceof Node) {
        if (!dropdownRef.current.contains(event.target)) {
          setDeckDropdown(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [deckDropdown]);

  useEffect(() => {
    if (cardId) {
      const getCard = async (): Promise<ServerDeck[] | undefined> => {
        const response = await getFlashcard(cardId);
        if (response) {
          setCardFront(response.front);
          setCardBack(response.back);
          setBackgroundColor(response.backgroundColor as Color);
        }
        if (response && response.tags) {
          setTags(response.tags);
        }
        if (response && response.decks && response.decks.length) {
          const decks = response.decks.map((deck) => deck.id);
          setSelectedDecks(decks);
        }
        return;
      };
      getCard();
    }
    const getDecks = async (): Promise<ServerDeck[] | undefined> => {
      const allDecks = await getAllDecks();
      if (allDecks) {
        setDecks(allDecks);
      }
      return;
    };
    getDecks();
  }, [cardId]);

  useEffect(() => {
    const scroll = scrollRef.current;
    const checkForScrollbar = () => {
      if (scroll) {
        const hasVerticalScrollbar = scroll.scrollHeight > scroll.clientHeight;
        setHasScrollbar(hasVerticalScrollbar);
      }
    };
    checkForScrollbar();
    const resizeObserver = new ResizeObserver(() => {
      checkForScrollbar();
    });
    if (scroll) {
      resizeObserver.observe(scroll);
    }
    return () => {
      if (scroll) {
        resizeObserver.unobserve(scroll);
      }
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let timer: number;
    if (message) {
      timer = window.setTimeout(
        () => setMessage({ text: "", color: "green" }),
        3000
      );
    }
    return () => {
      clearTimeout(timer);
    };
  }, [message]);

  return (
    <div className="wrapper">
      <div className="content">
        {message.text && (
          <p
            className="message"
            style={
              message.color === "green" ? { color: "green" } : { color: "red" }
            }
          >
            {message.text}
          </p>
        )}
        <div id="flashcard-container">
          <div id="flashcard-top">
            {cardId && (
              <button onClick={() => window.history.back()}>
                <img src={images.back} alt="back" />
              </button>
            )}
            {cardId ? <h1>Edit flashcard</h1> : <h1>Create a new flashcard</h1>}
          </div>
          <div id="flashcard-bottom">
            <div id="flashcard-preview">
              <div
                id={cardSide === "front" ? "flashcard-front" : "flashcard-back"}
                style={{
                  backgroundColor: colors.filter(
                    (color) => color.name === backgroundColor
                  )[0].hex,
                }}
              >
                <p
                  ref={scrollRef}
                  style={{
                    color: backgroundColor
                      ? colors.filter(
                          (color) => color.name === backgroundColor
                        )[0].contrast
                      : "#ffffff",
                  }}
                  className={hasScrollbar ? "scroll" : ""}
                >
                  {cardSide === "front" ? cardFront : cardBack}
                </p>
                {tags.length > 0 && (
                  <ul>
                    {tags.map((tag, i) => (
                      <li key={i}>
                        {tag}
                        <button
                          onClick={() => {
                            setTags((currentTags) =>
                              currentTags.filter((_, index) => index !== i)
                            );
                          }}
                        >
                          <img src={images.x} alt="remove" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() =>
                    setCardSide((current) =>
                      current === "front" ? "back" : "front"
                    )
                  }
                >
                  <img src={images.flip} alt="flip" />
                </button>
              </div>
            </div>
            <form
              id="flashcard-form"
              onSubmit={async (e) => {
                e.preventDefault();
                if (calling) return;
                try {
                  if (
                    cardFront.trim().length &&
                    cardBack.trim().length &&
                    !cardId &&
                    !calling
                  ) {
                    const response = await createFlashcard({
                      front: cardFront,
                      back: cardBack,
                      tags,
                      backgroundColor,
                      decks: selectedDecks,
                    });
                    if (response === true) {
                      setMessage({
                        text: "Card created successfully.",
                        color: "green",
                      });
                      setCardFront("");
                      setCardBack("");
                      setNewTag("");
                      setTags([]);
                      setBackgroundColor("White");
                      setSelectedDecks([]);
                    } else if (response === "exists") {
                      alert("Flashcard already exists.");
                    }
                  } else if (
                    cardFront.trim().length &&
                    cardBack.trim().length &&
                    cardId &&
                    !calling
                  ) {
                    const response = await updateFlashcard(
                      {
                        front: cardFront,
                        back: cardBack,
                        tags,
                        backgroundColor,
                        decks: selectedDecks,
                      },
                      cardId
                    );
                    if (response === true) {
                      setMessage({
                        text: "Card updated successfully.",
                        color: "green",
                      });
                    }
                  }
                } catch (error) {
                  console.error("Error saving card:", error);
                  setMessage({
                    text: "Failed to save card. Please try again.",
                    color: "red",
                  });
                } finally {
                  setCalling(false);
                }
              }}
            >
              <label className={(cardSide === "front" && "active") || ""}>
                Front text:
                <input
                  name="front"
                  type="text"
                  value={cardFront}
                  placeholder="Required"
                  required
                  onChange={(e) => setCardFront(() => e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                />
              </label>
              <label className={(cardSide === "back" && "active") || ""}>
                Back text:
                <input
                  name="back"
                  type="text"
                  value={cardBack}
                  placeholder="Required"
                  required
                  onChange={(e) => setCardBack(() => e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                />
              </label>
              <label>
                Tags (up to 5):
                <input
                  name="tags"
                  type="text"
                  maxLength={20}
                  placeholder="Optional"
                  value={newTag}
                  onChange={(e) => {
                    setNewTag(() => e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                    if (
                      e.key === "Enter" &&
                      tags.length < 5 &&
                      newTag.trim().length > 0 &&
                      tags.filter(
                        (tag) =>
                          tag.trim().toLowerCase() ===
                          newTag.trim().toLowerCase()
                      ).length < 1
                    ) {
                      e.preventDefault();
                      setTags((prev) => [...prev, newTag.trim()]);
                      setNewTag("");
                    }
                  }}
                />
                <button
                  type="button"
                  className={
                    !newTag.trim().length ||
                    tags.length > 4 ||
                    tags.filter(
                      (tag) =>
                        tag.trim().toLowerCase() === newTag.trim().toLowerCase()
                    ).length > 0
                      ? "add invalid"
                      : "add"
                  }
                  onClick={() => {
                    const exists =
                      tags.filter(
                        (tag) =>
                          tag.trim().toLowerCase() ===
                          newTag.trim().toLowerCase()
                      ).length > 0;
                    if (newTag.trim().length && tags.length < 5 && !exists) {
                      setTags((prev) => [...prev, newTag.trim()]);
                      setNewTag("");
                    }
                  }}
                >
                  Add
                </button>
              </label>
              {tags.length > 0 && (
                <ul className="tags-small-container">
                  {tags.map((tag, i) => (
                    <li key={i}>
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTags((currentTags) =>
                            currentTags.filter((_, index) => index !== i)
                          );
                        }}
                      >
                        <img src={images.x} alt="remove" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <label>
                Color:
                <select
                  id="color-select"
                  value={backgroundColor || ""}
                  onChange={(e) => {
                    if (
                      colors.filter((color) => color.name === e.target.value)
                        .length > 0
                    ) {
                      setBackgroundColor(e.target.value as Color);
                    }
                  }}
                >
                  <option value="" disabled hidden>
                    Select a color
                  </option>
                  {colors.map((color) => (
                    <option
                      key={color.name}
                      value={color.name}
                      style={{
                        backgroundColor: color.hex,
                        color: color.contrast,
                      }}
                    >
                      {color.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Add to decks:
                <div className="checkbox-dropdown" ref={dropdownRef}>
                  <div
                    className="header"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeckDropdown(!deckDropdown);
                    }}
                  >
                    {!selectedDecks.length && "Select decks (optional)"}
                    {selectedDecks.length === 1 &&
                      selectedDecks[0] &&
                      (() => {
                        const foundDeck = decks.find(
                          (deck) => deck.id === selectedDecks[0]
                        );
                        const deckName = foundDeck
                          ? foundDeck.name
                          : "Unknown deck";
                        return deckName.length > 20
                          ? deckName.slice(0, 20) + "..."
                          : deckName;
                      })()}
                    {selectedDecks.length > 1 &&
                      `${selectedDecks.length} decks selected`}
                    <span className="arrow">{deckDropdown ? "▲" : "▼"}</span>
                  </div>
                  {deckDropdown && (
                    <div className="list" onClick={(e) => e.stopPropagation()}>
                      {decks.map((deck) => (
                        <div
                          key={deck.id}
                          className="item"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (selectedDecks.includes(deck.id)) {
                              setSelectedDecks(
                                selectedDecks.filter((id) => id !== deck.id)
                              );
                            } else {
                              setSelectedDecks([...selectedDecks, deck.id]);
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDecks.includes(deck.id)}
                            onChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span>{deck.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </label>
              <button type="submit">
                {cardId ? "Save changes" : "Create"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
