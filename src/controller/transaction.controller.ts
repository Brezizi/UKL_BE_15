import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "minimal" });

const getBorrows = async (req: Request, res: Response) => {
    try {
        const borrows = await prisma.transaction.findMany({
            where: { user_id: (req as any).user.userId }, // assuming the user is authenticated and userId is stored in the token
        });
        res.status(200).json({
            status: "Success",
            message: "Retrieved user's borrows successfully",
            data: borrows,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const createBorrow = async (req: Request, res: Response) => {
    const { user_id, item_id, borrowDate, returnDate } = req.body;

    try {
        const borrowDateObj = new Date(borrowDate);
        const returnDateObj = new Date(returnDate);

        if (borrowDateObj >= returnDateObj) {
            return res
                .status(400)
                .json({ message: "Return date must be after borrow date" });
        }

        const existingBorrows = await prisma.transaction.findMany({
            where: {
                item_id,
                OR: [
                    {
                        borrow_date: {
                            lte: returnDateObj, // Existing borrow with borrowDate before or on returnDate
                        },
                        return_date: {
                            gte: borrowDateObj, // Existing borrow with returnDate after or on borrowDate
                        },
                    },
                    {
                        borrow_date: {
                            gte: borrowDateObj, // Existing borrow with borrowDate after or on new borrowDate
                        },
                        return_date: {
                            lte: returnDateObj, // Existing borrow with returnDate before or on new returnDate
                        },
                    },
                ],
            },
        });

        const item = await prisma.item.findUnique({
            where: { id: item_id },
            select: { stock: true },
        });

        if (!item)
            return res.status(400).json({
                message: "Item is not found",
            });

        if (existingBorrows.length === item.stock) {
            return res.status(400).json({
                message: "This item is already borrowed during the specified period",
            });
        }

        const borrow = await prisma.transaction.create({
            data: {
                user_id,
                item_id,
                borrow_date: borrowDateObj,
                return_date: returnDateObj,
            },
        });

        res.status(201).json({
            status: "Success",
            message: "Borrowed an item successfully",
            data: borrow,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const returnItem = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params; // ID transaksi
    const { return_date } = req.body; // Tanggal pengembalian sebenarnya

    try {
        // Validasi input
        if (!return_date) {
            return res.status(400).json({ message: "Return date is required" });
        }

        const returnDateObj = new Date(return_date);

        // Cari transaksi berdasarkan ID
        const transaction = await prisma.transaction.findUnique({
            where: { id: Number(id) },
        });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Perbarui tanggal pengembalian sebenarnya
        const updatedTransaction = await prisma.transaction.update({
            where: { id: Number(id) },
            data: { actualReturnDate: returnDateObj },
        });

        res.status(200).json({
            status: "Success",
            message: "Item returned successfully",
            data: updatedTransaction,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export { getBorrows, createBorrow, returnItem }