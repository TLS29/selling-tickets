import { Router } from "express";

const healthRouter = Router();

// Readiness probe: the process is up and able to serve traffic.
// NOTE: intentionally does NOT check the DB yet — add dependency checks here later.
healthRouter.get("/ready", (_req, res) => {
  res.status(200).json({ status: "ready" });
});

export { healthRouter };
