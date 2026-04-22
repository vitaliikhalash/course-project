import { z } from "zod";
import {
  optionalNameSchema,
  optionalUkrainianPhoneSchema,
} from "@/lib/validations/common";
export const updateProfileFormSchema = z.object({
  firstName: optionalNameSchema("Ім'я задовге"),
  lastName: optionalNameSchema("Прізвище задовге"),
  phoneNumber: optionalUkrainianPhoneSchema,
});
