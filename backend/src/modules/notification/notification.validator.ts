import { z } from "zod";
import { NOTIFICATIONS_MAX_LIMIT } from "./notification.constants";

export const getNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(NOTIFICATIONS_MAX_LIMIT).default(20),
});

export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>;
