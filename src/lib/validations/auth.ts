import { z } from "zod";
import {
  requiredNameSchema,
  requiredUkrainianPhoneSchema,
  trimmedString,
} from "@/lib/validations/common";
export const registerUserFormSchema = z.object({
  firstName: requiredNameSchema("Ім'я задовге"),
  lastName: requiredNameSchema("Прізвище задовге"),
  phoneNumber: requiredUkrainianPhoneSchema,
  email: trimmedString.min(1, "Заповніть усі поля").email("Некоректний email"),
  password: z.string().min(1, "Заповніть усі поля"),
});
export const credentialsSchema = z.object({
  email: trimmedString.min(1, "Вкажіть email").email("Некоректний email"),
  password: z.string().min(1, "Вкажіть пароль"),
});
