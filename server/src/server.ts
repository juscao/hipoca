import app from "./app";
import prisma from "./utils/prisma";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to database successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
process.on("uncaughtException", async (error) => {
  console.error("❌ Uncaught Exception:", error);
  await prisma.$disconnect();
  process.exit(1);
});
process.on("unhandledRejection", async (error) => {
  console.error("❌ Unhandled Rejection:", error);
  await prisma.$disconnect();
  process.exit(1);
});

startServer();
