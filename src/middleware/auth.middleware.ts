import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Middleware untuk autentikasi
const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1]; // Ambil token dari header Authorization

  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

  try {
    const secretKey = process.env.JWT_SECRET || "";
    const decoded = jwt.verify(token, secretKey); // Verifikasi token
    (req as any).user = decoded; // Tambahkan informasi pengguna ke request
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware untuk otorisasi berdasarkan peran
const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user; // Ambil informasi pengguna dari request
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

export {authMiddleware, roleMiddleware}