import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

/** ประวัติการหักวันหยุดชดเชยที่สะสมจาก OT — หักได้ทีละ 0.5 หรือ 1 วันเท่านั้น */
const otDeductionSchema = new Schema(
  {
    /** yyyy-mm-dd */
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "date ต้องอยู่ในรูปแบบ yyyy-mm-dd"],
      index: true,
    },
    days: { type: Number, required: true, enum: [0.5, 1] },
    note: { type: String, default: "", trim: true },
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

otDeductionSchema.index({ date: 1 });

export type OtDeductionDoc = HydratedDocument<InferSchemaType<typeof otDeductionSchema>>;

export const OtDeduction = model("OtDeduction", otDeductionSchema);
