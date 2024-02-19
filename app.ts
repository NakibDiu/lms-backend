require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import { CatchAsyncError } from "./middleware/catchAsyncError";
import orderRouter from "./routes/order.route";
import notificationRouter from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";

// body parser
app.use(express.json({ limit: "50mb" }));

// cookies parser
app.use(cookieParser());

// cors => cross origin resource sharing
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

// routes
app.use(
  "/api/v1",
  userRouter,
  courseRouter,
  orderRouter,
  notificationRouter,
  analyticsRouter,
  layoutRouter
);

// Log registered routes
console.log("Registered routes:");
app._router.stack.forEach((middleware: any) => {
  if (middleware.route) {
    // routes registered directly on the app
    console.log(middleware.route.path);
  } else if (middleware.name === "router") {
    // router-level middleware
    middleware.handle.stack.forEach((handler: any) => {
      console.log(handler.route.path);
    });
  }
});

// testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

// unknown routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route  ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(CatchAsyncError);
app.use(ErrorMiddleware);
