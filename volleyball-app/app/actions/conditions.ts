'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ConditionSchema = z.object({
  playerId: z.string(),
  date: z.string().transform((str) => new Date(str)),
  health: z.coerce.number().int().min(1).max(5).default(3),
  fatigue: z.coerce.number().int().min(1).max(5).default(3),
  pain: z.coerce.number().int().min(0).max(5).default(0),
  painArea: z.string().optional().nullable(),
  motivation: z.coerce.number().int().min(1).max(5).default(3),
  memo: z.string().optional().nullable(),
})

export type ConditionFormData = z.infer<typeof ConditionSchema>

export async function getPlayerConditions(playerId: string) {
  try {
    const conditions = await prisma.condition.findMany({
      where: { playerId },
      orderBy: { date: 'desc' },
    })

    return { success: true, data: conditions }
  } catch (error) {
    console.error('Failed to fetch conditions:', error)
    return { success: false, error: 'Failed to fetch conditions' }
  }
}

export async function getConditionByDate(date: string) {
  try {
    const targetDate = new Date(date)
    const conditions = await prisma.condition.findMany({
      where: {
        date: targetDate,
      },
      include: {
        player: true,
      },
    })

    return { success: true, data: conditions }
  } catch (error) {
    console.error('Failed to fetch conditions:', error)
    return { success: false, error: 'Failed to fetch conditions' }
  }
}

export async function upsertCondition(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData)
    const validatedData = ConditionSchema.parse(rawData)

    await prisma.condition.upsert({
      where: {
        playerId_date: {
          playerId: validatedData.playerId,
          date: validatedData.date,
        },
      },
      update: validatedData,
      create: validatedData,
    })

    revalidatePath('/players')
    revalidatePath(`/players/${validatedData.playerId}`)
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    console.error('Failed to upsert condition:', error)
    return { success: false, error: 'Failed to save condition' }
  }
}

export async function deleteCondition(id: string) {
  try {
    const condition = await prisma.condition.delete({
      where: { id },
    })

    revalidatePath('/players')
    revalidatePath(`/players/${condition.playerId}`)
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Failed to delete condition:', error)
    return { success: false, error: 'Failed to delete condition' }
  }
}
