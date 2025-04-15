import { useState, useEffect } from "react";
import { images } from "../../assets/images";
import {
  getAllFlashcardsDue,
  getAllFlashcardsInStack,
} from "../../services/cardApi";

export default function Study() {
  const [fetching, setFetching] = useState(true);
  const [dueForReview, setDueForReview] = useState(-1);
  const [currentStack, setCurrentStack] = useState(-1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          (async () => {
            const response = await getAllFlashcardsDue();
            if (response) {
              setDueForReview(response.length);
            }
          })(),
          (async () => {
            const response = await getAllFlashcardsInStack();
            if (response) {
              setCurrentStack(response.length);
            }
          })(),
        ]);
        setFetching(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="wrapper">
      <div className="content">
        {!fetching && (
          <div id="study-container">
            <a id="due-for-review" href="/study/due_for_review">
              <h2>
                Due for review <span className="number">({dueForReview})</span>
              </h2>
              <img src={images.due_for_review} alt="" />
              <p>Study the cards that are due for review.</p>
            </a>
            <a id="current-stack" href="/study/current_stack">
              <h2>
                Current stack{" "}
                <span className="number">{"(" + currentStack + ")"}</span>
              </h2>
              <img src={images.current_stack} alt="" />
              <p>
                Study the cards that you have manually designated for review.
              </p>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
