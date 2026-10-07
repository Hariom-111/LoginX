import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "node:path";
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
const frontendDirectory = path.join(__dirname, "public");
app.use(express.static(frontendDirectory));

if (process.env.NODE_ENV === "production") {
	app.use((req, res, next) => {
		if (req.method !== "GET" || req.path.startsWith("/api/")) {
			return next();
		}

		return res.sendFile(path.join(frontendDirectory, "index.html"), (error) => {
			if (error) next(error);
		});
	});
}

app.use(errorHandler);

export default app;