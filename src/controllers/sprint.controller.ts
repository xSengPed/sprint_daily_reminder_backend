import type { Request, Response } from "express";
import { Sprint } from "../models/sprint.model";
import { sprintBodySchema } from "../schemas/sprint.schema";

/** GET /api/sprint — ยังไม่มี doc ก็คืนค่าเริ่มต้นให้ frontend ใช้ต่อได้เลย */
export async function getSprint(_req: Request, res: Response): Promise<void> {
  const doc = await Sprint.findOne();
  res.json({ data: { number: doc?.number ?? 1 } });
}

/** PUT /api/sprint — คอลเลกชันนี้มีได้แค่ 1 doc จึง upsert ด้วย filter ว่าง */
export async function setSprint(req: Request, res: Response): Promise<void> {
  const { number } = sprintBodySchema.parse(req.body);

  const doc = await Sprint.findOneAndUpdate(
    {},
    { $set: { number } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json({ data: { number: doc.number } });
}
