import { Router } from "express";
import { getUser, loginUser, registerUser } from "../controller/auth.controller";

const authRouter = Router();

authRouter.post("/register", (req, res) => {
  registerUser(req, res);
});
authRouter.post("/login", (req, res) => {
  loginUser(req, res);
});
authRouter.get("/data", (req, res) => {
  getUser(req, res);
})

export default authRouter;