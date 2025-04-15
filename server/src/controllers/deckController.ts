import { Request, Response } from "express";
import { Deck } from "../types/types";
import prisma from "../utils/prisma";

const createDeck = async (req: Request<{}, {}, Deck>, res: Response) => {
  const { name, privacy } = req.body;
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const deck = await prisma.deck.create({
      data: {
        userId: req.user.id,
        originalUserId: req.user.id,
        name,
        privacy,
        cards: { create: [] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    if (!deck) {
      res.status(401).json({ error: "Error creating deck." });
    }
    res.sendStatus(201);
    return;
  } catch (error) {
    console.error("Error creating flashcard:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

const createDeckCopy = async (
  req: Request<{}, {}, { deckId: string }>,
  res: Response
) => {
  const { deckId } = req.body;
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const original = await prisma.deck.update({
      where: {
        id: deckId,
      },
      data: {
        copies: {
          increment: 1,
        },
      },
      include: { cards: true },
    });
    if (!original) {
      res.status(401).json({ error: "Deck not found." });
    } else {
      const existingCards = await prisma.card.findMany({
        where: {
          userId: req.user.id,
        },
        select: {
          id: true,
          front: true,
          back: true,
          tags: true,
          backgroundColor: true,
        },
      });
      const cardsToConnect: { id: string }[] = [];
      const cardsToCreate = [];
      for (const card of original.cards) {
        const existingCard = existingCards.find(
          (existing: {
            id: string;
            front: string;
            back: string;
            tags: string[];
            backgroundColor: any;
          }) =>
            existing.front === card.front &&
            existing.back === card.back &&
            JSON.stringify(existing.tags.sort()) ===
              JSON.stringify(card.tags.sort()) &&
            existing.backgroundColor === card.backgroundColor
        );
        if (existingCard) {
          cardsToConnect.push({ id: existingCard.id });
        } else {
          cardsToCreate.push({
            user: {
              connect: { id: req.user.id },
            },
            front: card.front,
            back: card.back,
            tags: card.tags,
            backgroundColor: card.backgroundColor,
          });
        }
      }
      const copy = await prisma.deck.create({
        data: {
          user: {
            connect: { id: req.user.id },
          },
          originalUser: {
            connect: { id: original.userId },
          },
          name: original.name + " copy",
          privacy: "PRIVATE",
          cards: {
            create: cardsToCreate,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      if (cardsToConnect.length > 0) {
        await prisma.deck.update({
          where: { id: copy.id },
          data: {
            cards: {
              connect: cardsToConnect,
            },
          },
        });
      }
      if (copy) {
        res.sendStatus(201);
      } else {
        res.status(401).json({ error: "Unable to copy deck." });
      }
    }
    return;
  } catch (error) {
    console.error("Error creating flashcard:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

const getAllDecks = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const decks = await prisma.deck.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      cards: true,
    },
  });
  res.json([...decks]);
  return;
};

const getDeck = async (req: Request, res: Response) => {
  const { deckId } = req.params;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const deck = await prisma.deck.findUnique({
      where: {
        id: deckId,
      },
      include: {
        cards: true,
      },
    });
    const cards = await prisma.card.findMany({
      where: {
        decks: {
          some: {
            id: deck?.id,
          },
        },
      },
      include: {
        decks: true,
      },
    });
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    if (deck.userId !== req.user.id && deck.privacy === "PRIVATE") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json({ deck, cards });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

const getPublicDecks = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const decks = await prisma.deck.findMany({
      where: {
        NOT: {
          userId: req.user.id,
        },
        userId: {
          equals: prisma.deck.fields.originalUserId,
        },
        privacy: "PUBLIC",
        cards: {
          some: {},
        },
      },
      include: {
        cards: true,
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        copies: "desc",
      },
    });
    if (!decks) {
      res.status(404).json({ error: "Decks not found" });
      return;
    }
    res.status(201).json(decks);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

const updateDeck = async (
  req: Request<{ deckId: string }, {}, Deck>,
  res: Response
) => {
  const { name, privacy } = req.body;
  const { deckId } = req.params;
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const deck = await prisma.deck.update({
      where: {
        id: deckId,
      },
      data: {
        name,
        privacy,
        updatedAt: new Date(),
      },
    });
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
    }
    if (deck.userId !== req.user.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.sendStatus(200);
    return;
  } catch (error) {
    console.error("Error updating deck:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

const deleteDeck = async (
  req: Request<{ deckId: string }, {}, {}>,
  res: Response
) => {
  const { deckId } = req.params;
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!deckId) {
    res.status(400).json({ error: "Invalid deck ID." });
    return;
  }
  try {
    const deck = await prisma.deck.delete({
      where: {
        id: deckId,
      },
    });
    if (deck) {
      res.json({ msg: "Deck deleted." });
      return;
    } else {
      res.json({ msg: "Unable to delete deck. Please try again." });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

export default {
  createDeck,
  createDeckCopy,
  getAllDecks,
  getDeck,
  getPublicDecks,
  updateDeck,
  deleteDeck,
};
