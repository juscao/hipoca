import { ServerDeck } from "../types/deck.types";
import { ClientCard, ServerCard } from "../types/flashcard.types";

export const createFlashcard = async (card: ClientCard) => {
  try {
    const response = await fetch(`/api/cards/new`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        front: card.front,
        back: card.back,
        tags: card.tags,
        backgroundColor: card.backgroundColor,
        decks: card.decks,
      }),
    });
    if (response.status === 409) {
      return "exists";
    }
    return response.status === 201;
  } catch (error) {
    console.log(error);
  }
};

export const getAllFlashcards = async () => {
  try {
    const response = await fetch(`/api/cards/all`, {
      method: "GET",
      credentials: "include",
    });
    const data: ServerCard[] = await response.json();
    if (data) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getAllFlashcardsDue = async () => {
  try {
    const response = await fetch(`/api/cards/study/due_for_review`, {
      method: "GET",
      credentials: "include",
    });
    const data: ServerCard[] = await response.json();
    if (data) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getAllFlashcardsInStack = async () => {
  try {
    const response = await fetch(`/api/cards/study/current_stack`, {
      method: "GET",
      credentials: "include",
    });
    const data: ServerCard[] = await response.json();
    if (data) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getFlashcard = async (cardId: string) => {
  try {
    const response = await fetch(`/api/cards/${cardId}`, {
      method: "GET",
      credentials: "include",
    });
    const data: ServerCard = await response.json();
    if (data) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateFlashcard = async (card: ClientCard, cardId: string) => {
  try {
    const response = await fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        front: card.front,
        back: card.back,
        tags: card.tags,
        backgroundColor: card.backgroundColor,
        decks: card.decks,
      }),
    });
    return response.status === 200;
  } catch (error) {
    console.log(error);
  }
};

export const updateFlashcardReviewStatus = async (cardIds: string[]) => {
  try {
    const response = await fetch(`/api/cards/study`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardIds,
      }),
    });
    const data: { id: string; inCurrentStack: boolean }[] | null =
      await response.json();
    if (data !== null) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const addFlashcardsToDeck = async (
  cardIds: string[],
  deckId: string
) => {
  try {
    const response = await fetch(`/api/cards/all/add`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardIds,
        deckId,
      }),
    });
    const data: { id: string; deck: ServerDeck } = await response.json();
    if (data !== null) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const removeFlashcardsFromDeck = async (
  cardIds: string[],
  deckId: string
) => {
  try {
    const response = await fetch(`/api/cards/all/remove`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardIds,
        deckId,
      }),
    });
    const data: { id: string; deck: ServerDeck } = await response.json();
    if (data !== null) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const deleteFlashcards = async (cardIds: string[]) => {
  try {
    const response = await fetch(`/api/cards/all`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardIds,
      }),
    });
    const data: { message: string } = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
