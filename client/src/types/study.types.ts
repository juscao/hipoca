import { ServerCard } from "./flashcard.types";

export type ClientSession = {
  type: "due" | "current" | "deck";
  settings: {
    mode: "Casual" | "Quiz";
    timer: boolean;
    tags: boolean;
    colored: boolean;
  };
  cards: string[];
};

export type ServerSession = {
  id: string;
  userId: string;
  cards: ServerCard[];
  start: Date;
  end: Date | null;
  mode: "Casual" | "Quiz";
  timer: boolean;
  tags: boolean;
  colored: boolean;
  cardsReviewed: number;
  numCorrect: number;
};
