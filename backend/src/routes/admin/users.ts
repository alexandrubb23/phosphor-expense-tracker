import { Router } from "express";
import { getPrisma } from "../../lib/prisma.js";

const router = Router();

router.get("/", async (_req, res) => {
  const prisma = getPrisma();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ users });
});

export default router;
