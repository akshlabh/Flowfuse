import { z } from "zod";

export const SignupSchema = z.object({
  email : z.string().email(),
  password: z.string().min(6),
  name: z.string().min(3),
});

export const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const trackCreateSchema = z.object({
  name: z.string().min(1, "Track name is required"),
  availableTriggerId: z.string(),
  triggerMetadata: z.any().optional(),
  actions: z.array(
    z.object({
      availableActionId: z.string(),
      actionMetadata: z.any().optional(),
    })
  ),
});
