'use server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

interface RecordData {
  text: string;
  amount: number;
  category: string;
  date: string;
}

interface RecordResult {
  data?: RecordData;
  error?: string;
}

async function addExpenseRecord(formData: FormData): Promise<RecordResult> {
  const textValue = formData.get('text');
  const amountValue = formData.get('amount');
  const categoryValue = formData.get('category');
  const dateValue = formData.get('date');

  if (
    !textValue ||
    textValue === '' ||
    !amountValue ||
    !categoryValue ||
    categoryValue === '' ||
    !dateValue ||
    dateValue === ''
  ) {
    return { error: 'Text, amount, category, or date is missing' };
  }

  const text: string = textValue.toString();
  const amount: number = parseFloat(amountValue.toString());
  const category: string = categoryValue.toString();

  let date: string;
  try {
    const inputDate = dateValue.toString();
    const [year, month, day] = inputDate.split('-');
    const dateObj = new Date(
      Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0)
    );
    date = dateObj.toISOString();
  } catch (error) {
    console.error('Invalid date format:', error);
    return { error: 'Invalid date format' };
  }

  // Clerk authentication
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { error: 'User not authenticated' };
  }

  try {
    // 🔹 Ensure the user exists in our DB
    let user = await db.user.findUnique({ where: { clerkUserId } });
    if (!user) {
      const clerkUser = await currentUser();
      user = await db.user.create({
        data: {
          clerkUserId,
          email: clerkUser?.emailAddresses[0]?.emailAddress || '',
          name: clerkUser?.firstName || '',
          imageUrl: clerkUser?.imageUrl || '',
        },
      });
    }

    // 🔹 Create record linked to Prisma UUID
    const createdRecord = await db.record.create({
      data: {
        text,
        amount,
        category,
        date,
        userId: user.id, // ✅ use internal Prisma UUID
      },
    });

    const recordData: RecordData = {
      text: createdRecord.text,
      amount: createdRecord.amount,
      category: createdRecord.category,
      date: createdRecord.date?.toISOString() || date,
    };

    revalidatePath('/');

    return { data: recordData };
  } catch (error) {
    console.error('Error adding expense record:', error);
    return { error: 'An unexpected error occurred while adding the expense record.' };
  }
}

export default addExpenseRecord;
