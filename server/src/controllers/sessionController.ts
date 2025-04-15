import { Request, Response } from "express";
import { Session, CardResult } from "../types/types";
import prisma from "../utils/prisma";

const createSession = async (
  req: Request<{}, {}, { session: Session }>,
  res: Response
) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { session } = req.body;

    const newSession = await prisma.session.create({
      data: {
        userId: req.user.id,
        type: session.type,
        cards: {
          connect: session.cards.map((cardId) => ({ id: cardId })),
        },
        mode: session.settings.mode,
        timer: session.settings.timer,
        tags: session.settings.tags,
        colored: session.settings.colored,
        cardsReviewed: 0,
        numCorrect: session.settings.mode === "Quiz" ? 0 : undefined,
      },
      include: {
        cards: true,
      },
    });
    res.status(201).json(newSession);
    return;
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create session",
    });
    return;
  }
};

const startSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        cards: true,
      },
    });
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    if (session.userId !== req.user.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (session.start && session.end) {
      res.status(201).json(session);
    }
    if (session.start === null) {
      const updatedSession = await prisma.session.update({
        where: {
          id: sessionId,
        },
        data: {
          start: new Date(),
        },
        include: {
          cards: true,
        },
      });
      res.status(201).json(updatedSession);
      return;
    }
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const finishSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { results } = req.body as { results: CardResult[] };

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        cards: true,
      },
    });

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    if (session.userId !== req.user.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const cardUpdates = results.map((result) => {
      return prisma.card.update({
        where: {
          id: result.id,
        },
        data: {
          timesStudied: {
            increment: 1,
          },
          timesCorrect: result.correct
            ? {
                increment: 1,
              }
            : undefined,
          lastStudied: new Date(),
          dueForReview: result.reviewAgain
            ? new Date(result.reviewAgain)
            : null,
          inCurrentStack: session.type === "current" ? false : undefined,
        },
      });
    });
    const cardsReviewed = results.length;
    const numCorrect = results.filter((result) => result.correct).length;
    const updatedSession = await prisma.$transaction([
      ...cardUpdates,
      prisma.session.update({
        where: {
          id: sessionId,
        },
        data: {
          end: new Date(),
          cardsReviewed,
          numCorrect,
        },
        include: {
          cards: true,
        },
      }),
    ]);
    res.status(200).json(updatedSession[updatedSession.length - 1]);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

export default {
  createSession,
  startSession,
  finishSession,
};
