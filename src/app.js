import express, { json } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import {
  errorHandler,
} from "./middleware/authmiddlewares.js";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";


dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes)



app.use(errorHandler);

export default app;
