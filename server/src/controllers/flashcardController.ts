import { Request, Response } from "express";
import { Card } from "../types/types";
import prisma from "../utils/prisma";

const createFlashcard = async (req: Request<{}, {}, Card>, res: Response) => {
  const { front, back, tags, backgroundColor, decks } = req.body;
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const exists = await prisma.card.findFirst({
      where: {
        userId: req.user.id,
        front,
        back,
        ...(tags && tags.length > 0
          ? {
              tags: {
                hasEvery: tags,
              },
            }
          : {}),
        backgroundColor,
      },
    });
    if (exists) {
      res.status(409).json({ error: "Card already exists." });
      return;
    }
    const card = await prisma.card.create({
      data: {
        userId: req.user.id,
        front,
        back,
        tags,
        backgroundColor,
        decks: {
          connect: decks?.map((deckId) => ({ id: deckId })) || [],
        },
      },
    });
    if (!card) {
      res.status(401).json({ error: "Error creating card." });
    }
    res.sendStatus(201);
    return;
  } catch (error) {
    console.error("Error creating flashcard:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

const getAllFlashcards = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const cards = await prisma.card.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      decks: true,
    },
  });
  res.json([...cards]);
  return;
};

const getFlashcard = async (req: Request, res: Response) => {
  const { cardId } = req.params;
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const card = await prisma.card.findUnique({
      where: {
        id: cardId,
      },
      include: {
        decks: true,
      },
    });
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }
    if (card.userId !== req.user.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json(card);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

const getAllFlashcardsDue = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const cards = await prisma.card.findMany({
    where: {
      userId: req.user.id,
      dueForReview: {
        lte: new Date(),
      },
    },
    orderBy: {
      dueForReview: "desc",
    },
  });
  res.json([...cards]);
  return;
};

const getAllFlashcardsInStack = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const cards = await prisma.card.findMany({
    where: {
      userId: req.user.id,
      inCurrentStack: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  res.json([...cards]);
  return;
};

const updateFlashcard = async (
  req: Request<{ cardId: string }, {}, Card>,
  res: Response
) => {
  const { front, back, tags, backgroundColor, decks } = req.body;
  const { cardId } = req.params;
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const card = await prisma.card.update({
      where: {
        id: cardId,
      },
      data: {
        front,
        back,
        tags,
        backgroundColor,
        decks: {
          set: decks?.map((deckId) => ({ id: deckId })) || [],
        },
        updatedAt: new Date(),
      },
    });
    if (!card) {
      res.status(404).json({ error: "Card not found" });
    }
    res.sendStatus(200);
    return;
  } catch (error) {
    console.error("Error updating flashcard:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

const updateFlashcardReviewStatus = async (
  req: Request<{}, {}, { cardIds: string[] }>,
  res: Response
) => {
  const { cardIds } = req.body;
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const results = [];

    for (const cardId of cardIds) {
      const card = await prisma.card.findUnique({
        where: {
          id: cardId,
          userId: req.user.id,
        },
        select: {
          inCurrentStack: true,
        },
      });

      if (card) {
        const updatedCard = await prisma.card.update({
          where: {
            userId: req.user.id,
            id: cardId,
          },
          data: {
            inCurrentStack: !card.inCurrentStack,
          },
          select: {
            id: true,
            inCurrentStack: true,
          },
        });

        results.push(updatedCard);
      }
    }
    res.status(200).json(results);
    return;
  } catch (error) {
    console.error("Error updating flashcards:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

const addFlashcardsToDeck = async (
  req: Request<{}, {}, { cardIds: string[]; deckId: string }>,
  res: Response
) => {
  const { cardIds, deckId } = req.body;
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const results = [];
    for (const cardId of cardIds) {
      const card = await prisma.card.findUnique({
        where: {
          id: cardId,
          userId: req.user.id,
        },
        include: {
          decks: true,
        },
      });

      if (card) {
        const updatedCard = await prisma.card.update({
          where: {
            userId: req.user.id,
            id: cardId,
          },
          data: {
            decks: {
              connect: [
                ...card.decks.map((deck: { id: string }) => ({ id: deck.id })),
                { id: deckId },
              ],
            },
          },
          include: {
            decks: true,
          },
        });

        results.push(updatedCard);
      }
    }
    res.status(200).json(results);
    return;
  } catch (error) {
    console.error("Error updating flashcards:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

const removeFlashcardsFromDeck = async (
  req: Request<{}, {}, { cardIds: string[]; deckId: string }>,
  res: Response
) => {
  const { cardIds, deckId } = req.body;
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const results = [];
    for (const cardId of cardIds) {
      const card = await prisma.card.findUnique({
        where: {
          id: cardId,
          userId: req.user.id,
        },
        include: {
          decks: true,
        },
      });
      if (card) {
        const updatedCard = await prisma.card.update({
          where: {
            userId: req.user.id,
            id: cardId,
          },
          data: {
            decks: {
              disconnect: { id: deckId },
            },
          },
          include: {
            decks: true,
          },
        });
        results.push(updatedCard);
      }
    }
    res.status(200).json(results);
    return;
  } catch (error) {
    console.error("Error updating flashcards:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

const deleteFlashcards = async (
  req: Request<{}, {}, { cardIds: string[] }>,
  res: Response
) => {
  const { cardIds } = req.body;
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
    res.status(400).json({ error: "Valid card IDs are required" });
    return;
  }
  try {
    const cardsToDelete = await prisma.card.findMany({
      where: {
        id: {
          in: cardIds,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });
    if (cardsToDelete.length !== cardIds.length) {
      res.status(404).json({ error: "One or more cards not found" });
      return;
    }

    const unauthorizedCards = cardsToDelete.filter(
      (card: { id: string; userId: string }) => card.userId !== req.user!.id
    );
    if (unauthorizedCards.length > 0) {
      res
        .status(401)
        .json({ error: "Unauthorized to delete one or more cards" });
      return;
    }
    const deleteResult = await prisma.card.deleteMany({
      where: {
        id: {
          in: cardIds,
        },
        userId: req.user.id,
      },
    });

    res.json({
      message: "Cards deleted successfully",
      count: deleteResult.count,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

export default {
  createFlashcard,
  getAllFlashcards,
  getAllFlashcardsInStack,
  getAllFlashcardsDue,
  getFlashcard,
  updateFlashcard,
  updateFlashcardReviewStatus,
  addFlashcardsToDeck,
  removeFlashcardsFromDeck,
  deleteFlashcards,
};
