import { z } from "zod";
import { cuidSchema } from "@/lib/validations/common";
const assignableRoleSchema = z.enum(["USER", "ADMIN", "OWNER"]);
const cardStatusSchema = z.enum([
  "PENDING",
  "ACTIVE",
  "REJECTED",
  "FROZEN",
]);
export const setUserRoleInputSchema = z.object({
  targetUserId: cuidSchema,
  newRole: assignableRoleSchema,
});
export const setCardStatusInputSchema = z.object({
  cardId: cuidSchema,
  newStatus: cardStatusSchema,
});
