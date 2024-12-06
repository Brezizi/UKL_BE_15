import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

const prisma = new PrismaClient({ errorFormat: "minimal" });
dotenv.config()

const registerUser = async (req: Request, res: Response): Promise<any> => {
    const { username, password, role } = req.body;

    try {
        const existingUser = await prisma.user.findFirst({
            where: { username },
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
            },
        });

        return res.status(201).json({
            status: "Success",
            message: "User created successfully",
            data: newUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const loginUser = async (req: Request, res: Response): Promise<any> => {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findFirst({
            where: { username },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid username" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const payload = {
            userId: user.id,
            username: user.username,
            role: user.role
        };

        const signature = process.env.JWT_SECRET || ``;

        const token = jwt.sign(payload, signature);

        return res.json({ status: "Success", message: "Login successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getUser = async (req: Request, res: Response) => {
    try {
        const search = req.query.search;

        const allUsers = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        username: {
                            contains: search?.toString() || "",
                        },
                    },
                ],
            },
        });

        return res.status(200).json({
            message: `User data has been retrieved`,
            data: allUsers,
        });
    } catch (error) {
        return res.status(500).json(error);
    }
}

export { registerUser, loginUser, getUser }