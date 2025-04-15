import { ServerCard } from "./flashcard.types";

export type ClientDeck = {
  name: string;
  privacy: "PUBLIC" | "PRIVATE";
};

export type ServerDeck = {
  id: string;
  userId: string;
  name: string;
  privacy: "PUBLIC" | "PRIVATE";
  cards: ServerCard[];
  createdAt: Date;
  updatedAt: Date;
  copies: number;
  ratingSum: number;
  numRatings: number;
};

export type PublicServerDeck = ServerDeck & {
  user: {
    username: string;
  };
};
