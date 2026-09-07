import { z } from "zod";

export const sprintBodySchema = z.object({
  number: z.coerce.number().int().min(1),
});
