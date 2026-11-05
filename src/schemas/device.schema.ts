import { z } from "zod";

export const createDeviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isActive: z.boolean().optional(),
});

export const updateDeviceSchema = createDeviceSchema.partial();

export type CreateDeviceFormValues = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceFormValues = z.infer<typeof updateDeviceSchema>;
