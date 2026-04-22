"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { getFirstZodErrorMessage } from "@/lib/validations/common";
import { updateProfileFormSchema } from "@/lib/validations/profile";
export interface ProfileData {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
}
interface UpdateProfileResult {
  success: boolean;
  error?: string;
  profile?: ProfileData;
}
export async function getProfile(): Promise<ProfileData> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: session.user.id,
    },
    include: {
      userProfile: true,
    },
  });
  if (!user.userProfile) {
    const created = await prisma.userProfile.create({
      data: {
        userId: user.id,
      },
    });
    return {
      email: user.email,
      firstName: created.firstName,
      lastName: created.lastName,
      phoneNumber: created.phoneNumber,
    };
  }
  return {
    email: user.email,
    firstName: user.userProfile.firstName,
    lastName: user.userProfile.lastName,
    phoneNumber: user.userProfile.phoneNumber,
  };
}
export async function updateProfile(
  formData: FormData,
): Promise<UpdateProfileResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }
  const parsed = updateProfileFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phoneNumber: formData.get("phoneNumber"),
  });
  if (!parsed.success) {
    return {
      success: false,
      error: getFirstZodErrorMessage(parsed.error, "Некоректні дані профілю"),
    };
  }
  const { firstName, lastName, phoneNumber } = parsed.data;
  try {
    const existing = await prisma.userProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    const changed: Record<
      string,
      {
        from: string | null;
        to: string | null;
      }
    > = {};
    const next = {
      firstName,
      lastName,
      phoneNumber,
    };
    const prev = {
      firstName: existing?.firstName ?? null,
      lastName: existing?.lastName ?? null,
      phoneNumber: existing?.phoneNumber ?? null,
    };
    (Object.keys(next) as Array<keyof typeof next>).forEach((key) => {
      if (next[key] !== prev[key]) {
        changed[key] = {
          from: prev[key],
          to: next[key],
        };
      }
    });
    const upserted = await prisma.userProfile.upsert({
      where: {
        userId: session.user.id,
      },
      create: {
        userId: session.user.id,
        firstName,
        lastName,
        phoneNumber,
      },
      update: {
        firstName,
        lastName,
        phoneNumber,
      },
    });
    if (Object.keys(changed).length > 0) {
      await prisma.systemAuditLog.create({
        data: {
          action: "UPDATE_PROFILE",
          entityType: "UserProfile",
          entityId: upserted.id,
          userId: session.user.id,
          details: {
            changed,
          } as Prisma.InputJsonValue,
        },
      });
    }
    revalidatePath("/", "layout");
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      select: {
        email: true,
      },
    });
    return {
      success: true,
      profile: {
        email: user.email,
        firstName: upserted.firstName,
        lastName: upserted.lastName,
        phoneNumber: upserted.phoneNumber,
      },
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes("phoneNumber")
    ) {
      return {
        success: false,
        error: "Користувач з таким номером телефону вже існує",
      };
    }
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: message,
    };
  }
}
