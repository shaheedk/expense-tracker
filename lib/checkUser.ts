import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  // Try to find user by Clerk ID
  let loggedInUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  // If user not found, create a new one
  if (!loggedInUser) {
    loggedInUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        imageUrl: user.imageUrl ?? "",
        email: user.emailAddresses[0]?.emailAddress ?? "",
      },
    });
  }

  return loggedInUser;
};
