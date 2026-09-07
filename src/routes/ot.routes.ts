import { Router } from "express";
import {
  createOtDeduction,
  createOtEntry,
  deleteOtDeduction,
  deleteOtEntry,
  listOtDeductions,
  listOtEntries,
  updateOtEntry,
} from "../controllers/ot.controller";

export const otRouter: Router = Router();

otRouter.get("/entries", listOtEntries);
otRouter.post("/entries", createOtEntry);
otRouter.put("/entries/:id", updateOtEntry);
otRouter.delete("/entries/:id", deleteOtEntry);

otRouter.get("/deductions", listOtDeductions);
otRouter.post("/deductions", createOtDeduction);
otRouter.delete("/deductions/:id", deleteOtDeduction);
