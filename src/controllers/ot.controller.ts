import type { Request, Response } from "express";
import { ApiError } from "../middleware/error";
import { OtDeduction } from "../models/otDeduction.model";
import { OtEntry } from "../models/otEntry.model";
import {
  otDeductionBodySchema,
  otEntryBodySchema,
  otIdParamSchema,
} from "../schemas/ot.schema";

function computeHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return Math.round(((eh * 60 + em - (sh * 60 + sm)) / 60) * 100) / 100;
}

/** GET /api/ot/entries */
export async function listOtEntries(_req: Request, res: Response): Promise<void> {
  const entries = await OtEntry.find().sort({ date: 1, startTime: 1 });
  res.json({ data: entries });
}

/** POST /api/ot/entries */
export async function createOtEntry(req: Request, res: Response): Promise<void> {
  const body = otEntryBodySchema.parse(req.body);
  const entry = await OtEntry.create({ ...body, hours: computeHours(body.startTime, body.endTime) });
  res.status(201).json({ data: entry });
}

/** PUT /api/ot/entries/:id */
export async function updateOtEntry(req: Request, res: Response): Promise<void> {
  const { id } = otIdParamSchema.parse(req.params);
  const body = otEntryBodySchema.parse(req.body);

  const entry = await OtEntry.findByIdAndUpdate(
    id,
    { $set: { ...body, hours: computeHours(body.startTime, body.endTime) } },
    { new: true }
  );
  if (!entry) throw new ApiError(404, "ไม่พบรายการ OT นี้");

  res.json({ data: entry });
}

/** DELETE /api/ot/entries/:id */
export async function deleteOtEntry(req: Request, res: Response): Promise<void> {
  const { id } = otIdParamSchema.parse(req.params);
  const result = await OtEntry.deleteOne({ _id: id });
  res.json({ data: { deleted: result.deletedCount } });
}

/** GET /api/ot/deductions */
export async function listOtDeductions(_req: Request, res: Response): Promise<void> {
  const deductions = await OtDeduction.find().sort({ date: -1, createdAt: -1 });
  res.json({ data: deductions });
}

/** POST /api/ot/deductions — ห้ามหักถ้ายอดวันคงเหลือไม่พอ */
export async function createOtDeduction(req: Request, res: Response): Promise<void> {
  const body = otDeductionBodySchema.parse(req.body);

  const [entries, deductions] = await Promise.all([
    OtEntry.find(),
    OtDeduction.find(),
  ]);
  const totalDays = entries.reduce((sum, e) => sum + e.hours * e.multiplier, 0) / 8;
  const usedDays = deductions.reduce((sum, d) => sum + d.days, 0);
  const remaining = totalDays - usedDays;

  if (body.days > remaining + 1e-9) {
    throw new ApiError(400, `ยอดวันคงเหลือไม่พอ (เหลือ ${remaining.toFixed(2)} วัน)`);
  }

  const deduction = await OtDeduction.create(body);
  res.status(201).json({ data: deduction });
}

/** DELETE /api/ot/deductions/:id — ไว้แก้ไขถ้าหักผิด */
export async function deleteOtDeduction(req: Request, res: Response): Promise<void> {
  const { id } = otIdParamSchema.parse(req.params);
  const result = await OtDeduction.deleteOne({ _id: id });
  res.json({ data: { deleted: result.deletedCount } });
}
