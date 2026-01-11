import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "AyahFoundation API is running",
  });
});

export default router;
