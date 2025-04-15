import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router";
import { UserContext } from "../../contexts/UserContext";
import { Unauthorized } from "..";
import { ServerDeck } from "../../types/deck.types";
import { createDeck, getDeck, updateDeck } from "../../services/deckApi";
import "./Deck.css";

export default function Deck() {
  const [authorized, setAuthorized] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [name, setName] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [calling, setCalling] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    color: "green" | "red";
  }>({ text: "", color: "green" });

  const { deckId } = useParams();
  const user = useContext(UserContext);

  useEffect(() => {
    if (deckId) {
      const findDeck = async (): Promise<ServerDeck[] | undefined> => {
        const response = await getDeck(deckId);
        if (response && user && response.deck.userId === user.id) {
          setAuthorized(true);
          setName(response.deck.name);
          setPrivacy(response.deck.privacy);
          setFetching(false);
        }
        return;
      };
      findDeck();
    } else if (user) {
      setAuthorized(true);
      setFetching(false);
    }
  }, [deckId, user]);

  useEffect(() => {
    let timer: number;
    if (message) {
      timer = window.setTimeout(
        () => setMessage({ text: "", color: "green" }),
        2000
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
        {!fetching && authorized && (
          <div id="deck-container">
            <div id="deck-top">
              {deckId ? <h1>Edit deck</h1> : <h1>Create a new deck</h1>}
            </div>
            <div id="deck-bottom">
              <form
                id="deck-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (calling) return;
                  try {
                    setCalling(true);
                    if (deckId) {
                      const response = await updateDeck(deckId, name, privacy);
                      if (response === true) {
                        setMessage({
                          text: "Deck updated successfully.",
                          color: "green",
                        });
                      }
                    } else {
                      const response = await createDeck({ name, privacy });
                      if (response === true) {
                        setMessage({
                          text: "Deck created successfully.",
                          color: "green",
                        });
                        setName("");
                        setPrivacy("PRIVATE");
                      }
                    }
                  } catch (error) {
                    console.error("Error saving deck:", error);
                    setMessage({
                      text: "Failed to save deck. Please try again.",
                      color: "red",
                    });
                  } finally {
                    setCalling(false);
                  }
                }}
              >
                <label>
                  Deck name:
                  <input
                    name="front"
                    type="text"
                    value={name}
                    maxLength={50}
                    placeholder="Required"
                    required
                    onChange={(e) => setName(() => e.target.value)}
                  />
                </label>
                <label>
                  Privacy:
                  <select
                    id="privacy-select"
                    value={privacy || ""}
                    onChange={(e) =>
                      setPrivacy(e.target.value as typeof privacy)
                    }
                  >
                    <option key="PRIVATE" value="PRIVATE">
                      Private
                    </option>
                    <option key="PUBLIC" value="PUBLIC">
                      Public
                    </option>
                  </select>
                </label>
                <button type="submit">
                  {deckId ? "Save changes" : "Create"}
                </button>
              </form>
            </div>
          </div>
        )}
        {!fetching && !authorized && <Unauthorized />}
      </div>
    </div>
  );
}
