import express from "express";
import {createBorrow,getBorrows,returnItem,} from "../controller/transaction.controller";
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware";
import { getItem } from "../controller/item.controller";

const transactionRouter = express.Router();

transactionRouter.use((req, res, next) => {
  authMiddleware(req, res, next);
});
transactionRouter.use((req, res, next) => {
  const middleware = roleMiddleware(["Member"]);
  middleware(req, res, next);
});

transactionRouter.get("/:id", (req, res) => {
  getItem(req, res);
});
transactionRouter.post("/", (req, res) => {
  createBorrow(req, res);
});
transactionRouter.get("/", getBorrows);
transactionRouter.put("/return/:id", returnItem);

export default transactionRouter;