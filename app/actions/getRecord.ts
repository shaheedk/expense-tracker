'use server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { Record } from '@/types/Record';

async function getRecords(): Promise<{
  records?: Record[];
  error?: string;
}> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return { error: 'User not found' };
  }

  try {
    // Find actual user in DB by Clerk ID
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return { error: 'No user found in database' };
    }

    // Fetch records using Prisma UUID `user.id`
    const records = await db.record.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 10,
    });

    return { records };
  } catch (error) {
    console.error('Error fetching records:', error);
    return { error: 'Database error' };
  }
}

export default getRecords;
