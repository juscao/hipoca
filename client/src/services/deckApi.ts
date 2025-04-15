import { ClientDeck, ServerDeck, PublicServerDeck } from "../types/deck.types";
import { ServerCard } from "../types/flashcard.types";

export const createDeck = async (deck: ClientDeck) => {
  try {
    const response = await fetch(`/api/decks/new`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: deck.name,
        privacy: deck.privacy,
      }),
    });
    return response.status === 201;
  } catch (error) {
    console.log(error);
  }
};

export const createDeckCopy = async (deckId: string) => {
  try {
    const response = await fetch(`/api/decks/copy`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deckId,
      }),
    });
    return response.status === 201;
  } catch (error) {
    console.log(error);
  }
};

export const getAllDecks = async () => {
  try {
    const response = await fetch(`/api/decks/all`, {
      method: "GET",
      credentials: "include",
    });
    const data: ServerDeck[] = await response.json();
    if (data) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getDeck = async (deckId: string) => {
  try {
    const response = await fetch(`/api/decks/${deckId}`, {
      method: "GET",
      credentials: "include",
    });
    const data: { deck: ServerDeck; cards: ServerCard[] } =
      await response.json();
    if (data) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getPublicDecks = async () => {
  try {
    const response = await fetch(`/api/explore`, {
      method: "GET",
      credentials: "include",
    });
    if (response.status === 201) {
      const data: PublicServerDeck[] = await response.json();
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateDeck = async (
  deckId: string,
  name: string,
  privacy: "PRIVATE" | "PUBLIC"
) => {
  try {
    const response = await fetch(`/api/decks/${deckId}/edit`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        privacy,
      }),
    });
    return response.status === 200;
  } catch (error) {
    console.log(error);
  }
};

export const deleteDeck = async (deckId: string) => {
  try {
    const response = await fetch(`/api/decks/${deckId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data: { msg: string } = await response.json();
    if (data.msg) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};
