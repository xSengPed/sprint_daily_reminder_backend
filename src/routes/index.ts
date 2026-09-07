import { Router } from "express";
import { SQUADS } from "../config/squads";
import { isMongoReady } from "../db/mongo";
import { entriesRouter } from "./entries.routes";
import { holidaysRouter } from "./holidays.routes";
import { otRouter } from "./ot.routes";
import { sprintRouter } from "./sprint.routes";

export const apiRouter: Router = Router();

apiRouter.get("/health", (_req, res) => {
  const dbReady = isMongoReady();
  res.status(dbReady ? 200 : 503).json({
    data: {
      ok: dbReady,
      db: dbReady ? "connected" : "disconnected",
      uptime: Math.round(process.uptime()),
    },
  });
});

apiRouter.get("/squads", (_req, res) => {
  res.json({ data: SQUADS });
});

apiRouter.use("/entries", entriesRouter);
apiRouter.use("/holidays", holidaysRouter);
apiRouter.use("/ot", otRouter);
apiRouter.use("/sprint", sprintRouter);
