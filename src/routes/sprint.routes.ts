import { Router } from "express";
import { getSprint, setSprint } from "../controllers/sprint.controller";

export const sprintRouter: Router = Router();

sprintRouter.get("/", getSprint);
sprintRouter.put("/", setSprint);
