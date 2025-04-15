import express from "express";
import flashcardController from "../controllers/flashcardController";
const router = express.Router();

router.route("/new").post(flashcardController.createFlashcard);
router
  .route("/all")
  .get(flashcardController.getAllFlashcards)
  .delete(flashcardController.deleteFlashcards);
router.route("/all/add").patch(flashcardController.addFlashcardsToDeck);
router.route("/all/remove").patch(flashcardController.removeFlashcardsFromDeck);
router.route("/study").patch(flashcardController.updateFlashcardReviewStatus);
router
  .route("/study/current_stack")
  .get(flashcardController.getAllFlashcardsInStack);
router
  .route("/study/due_for_review")
  .get(flashcardController.getAllFlashcardsDue);
router
  .route("/:cardId")
  .get(flashcardController.getFlashcard)
  .patch(flashcardController.updateFlashcard);

export default router;
