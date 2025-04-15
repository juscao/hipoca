import { ClientSession, ServerSession } from "../types/study.types";
import { CardResult } from "../types/flashcard.types";

export const createSession = async (session: ClientSession) => {
  try {
    const response = await fetch(`/api/study/session/new`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session }),
    });
    const data: ServerSession = await response.json();
    if (data) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const startSession = async (sessionId: string) => {
  try {
    const response = await fetch(`/api/study/session/${sessionId}/start`, {
      method: "PATCH",
      credentials: "include",
    });
    if (response.status === 204) {
      return null;
    }
    if (response.status === 401) {
      return response.status;
    }
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error:", errorData);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
};

export const finishSession = async (
  sessionId: string,
  results: CardResult[]
) => {
  try {
    const response = await fetch(`/api/study/session/${sessionId}/finish`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ results }),
    });
    if (response.status === 204) {
      return null;
    }
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error:", errorData);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
};
