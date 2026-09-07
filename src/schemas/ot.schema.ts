import { z } from "zod";
import { dateKey } from "./entry.schema";

const timeOfDay = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "ต้องอยู่ในรูปแบบ HH:mm");

export const otMultiplierSchema = z.union([
  z.literal(1),
  z.literal(1.5),
  z.literal(1.75),
]);

export const otEntryBodySchema = z
  .object({
    date: dateKey,
    startTime: timeOfDay,
    endTime: timeOfDay,
    description: z.string().default(""),
    multiplier: otMultiplierSchema.default(1),
  })
  .refine((body) => body.endTime > body.startTime, {
    message: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม",
    path: ["endTime"],
  });

export const otDeductionBodySchema = z.object({
  date: dateKey,
  days: z.union([z.literal(0.5), z.literal(1)]),
  note: z.string().default(""),
});

export const otIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "id ไม่ถูกต้อง"),
});

export type OtEntryBody = z.infer<typeof otEntryBodySchema>;
export type OtDeductionBody = z.infer<typeof otDeductionBodySchema>;
