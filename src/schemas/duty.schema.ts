import { z } from "zod";

export const ZDuty = z.object({
	id: z.uuid(),
	name: z.string().trim().min(1, "Name is required").max(255, "Max 255 characters")
});

export const ZDutyDTO = ZDuty.omit({ id: true })

export type DutyDTO = z.infer<typeof ZDutyDTO>;

export type Duty = z.infer<typeof ZDuty>;
