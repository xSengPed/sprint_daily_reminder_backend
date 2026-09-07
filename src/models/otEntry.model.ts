import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/** แถวบันทึกชั่วโมง OT 1 ช่วงเวลา — ต่างจาก Entry ตรงที่ต้องใช้ _id อ้างอิงรายการเดี่ยว ๆ ได้ */
const otEntrySchema = new Schema(
  {
    /** yyyy-mm-dd */
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "date ต้องอยู่ในรูปแบบ yyyy-mm-dd"],
      index: true,
    },
    startTime: { type: String, required: true, match: [HHMM, "ต้องอยู่ในรูปแบบ HH:mm"] },
    endTime: { type: String, required: true, match: [HHMM, "ต้องอยู่ในรูปแบบ HH:mm"] },
    description: { type: String, default: "", trim: true },
    /** ชั่วโมงจริงที่คำนวณจาก start/end ตอนบันทึก (ยังไม่คูณตัวคูณ) เก็บไว้เลยไม่คำนวณสดทุกครั้ง */
    hours: { type: Number, required: true, min: 0 },
    /** ตัวคูณ OT — ชั่วโมงสะสมจริง = hours * multiplier */
    multiplier: { type: Number, required: true, enum: [1, 1.5, 1.75], default: 1 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

otEntrySchema.index({ date: 1, startTime: 1 });

export type OtEntryDoc = HydratedDocument<InferSchemaType<typeof otEntrySchema>>;

export const OtEntry = model("OtEntry", otEntrySchema);
