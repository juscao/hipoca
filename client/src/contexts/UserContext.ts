import { createContext } from "react";
import { User } from "../types/auth.types";

export const UserContext = createContext<User | undefined>(undefined);
