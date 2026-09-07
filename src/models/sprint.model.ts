import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

/** ค่าเดียวทั้งระบบ ไม่ผูกกับวันที่หรือ daily entry ใด ๆ — คอลเลกชันนี้มีได้แค่ 1 doc */
const sprintSchema = new Schema(
  {
    number: { type: Number, required: true, min: 1 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export type SprintDoc = HydratedDocument<InferSchemaType<typeof sprintSchema>>;

export const Sprint = model("Sprint", sprintSchema);
