import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api", routes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
