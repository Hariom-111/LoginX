import cors from "cors";
import express from "express";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler";
import authRouter from "./routers/auth.routes";

const app = express();

app.use(cors({
	origin: process.env.FRONTEND_URL || "http://localhost:5173",
	methods: ["GET", "POST", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api/auth", authRouter);

app.use(errorHandler);

export default app;