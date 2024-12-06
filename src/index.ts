import Express from "express";
import authRouter from "./router/auth.router";
import transactionRouter from "./router/transaction.router"
import itemRouter from "./router/item.router";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "minimal" });

const app = Express();

app.use(Express.json());

app.use(`/api/auth`, authRouter)
app.use("/api/item", itemRouter);
app.use("/api/borrow", transactionRouter);
app.get("/api/borrow-analysis", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: "startDate and endDate are required" });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const analysis = await prisma.transaction.groupBy({
      by: ["item_id"], // Group by itemId to count the number of borrows for each item
      where: {
        borrow_date: {
          gte: start, // Greater than or equal to the start date
          lte: end, // Less than or equal to the end date
        },
      },
      _count: {
        item_id: true,
      },
      orderBy: {
        _count: {
          item_id: "desc",
        },
      },
    });

    const items = await Promise.all(
      analysis.map(async (transaction) => {
        const item = await prisma.item.findUnique({
          where: { id: transaction.item_id },
        });
        return {
          item_id: transaction.item_id,
          itemame: item?.name,
          borrowCount: transaction._count.item_id,
        };
      })
    );

    res.json({
      status: "Success",
      message: "Successfully retrieved borrow analysis",
      period: { startDate, endDate },
      items,
    });
  } catch (error) {
    console.error("Error in borrow analysis:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server run on port ${PORT}`);
});