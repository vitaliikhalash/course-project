import { z } from "zod";
import { cuidSchema } from "@/lib/validations/common";
const assignableRoleSchema = z.enum(["USER", "ADMIN", "OWNER"]);
export const setUserRoleInputSchema = z.object({
  targetUserId: cuidSchema,
  newRole: assignableRoleSchema,
});
