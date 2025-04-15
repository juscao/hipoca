const colors = [
  { name: "White", hex: "#FFFFFF", contrast: "#000000" },
  { name: "Black", hex: "#000000", contrast: "#FFFFFF" },
  { name: "Red", hex: "#FF0000", contrast: "#000000" },
  { name: "Green", hex: "#008000", contrast: "#FFFFFF" },
  { name: "Blue", hex: "#0000FF", contrast: "#FFFFFF" },
  { name: "Yellow", hex: "#FFFF00", contrast: "#000000" },
  { name: "Orange", hex: "#FF8C00", contrast: "#000000" },
  { name: "Purple", hex: "#800080", contrast: "#FFFFFF" },
  { name: "Pink", hex: "#FF62B7", contrast: "#000000" },
  { name: "Teal", hex: "#104E4E", contrast: "#FFFFFF" },
  { name: "Brown", hex: "#8B4513", contrast: "#FFFFFF" },
  { name: "Lime", hex: "#32CD32", contrast: "#000000" },
  { name: "Navy", hex: "#000080", contrast: "#FFFFFF" },
  { name: "Gold", hex: "#FFD700", contrast: "#000000" },
  { name: "Cyan", hex: "#00CED1", contrast: "#000000" },
  { name: "Gray", hex: "#404040", contrast: "#FFFFFF" },
] as const;

type Color = (typeof colors)[number]["name"];

export type Card = {
  front: string;
  back: string;
  tags?: string[];
  backgroundColor: Color;
  decks: string[];
};

export type Deck = {
  userId: string;
  name: string;
  privacy: "PRIVATE" | "PUBLIC";
  cards: Card[];
};

export type Session = {
  type: "due" | "current" | "deck";
  settings: {
    mode: "Casual" | "Quiz";
    timer: boolean;
    tags: boolean;
    colored: boolean;
  };
  cards: string[];
};

export type CardResult = {
  id: string;
  correct: boolean;
  reviewAgain?: string;
};
