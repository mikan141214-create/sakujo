'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const PlayerSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  number: z.coerce.number().int().min(0).max(99),
  position: z.enum(['OH', 'OP', 'MB', 'S', 'L']),
  handedness: z.enum(['right', 'left']).default('right'),
  height: z.coerce.number().int().positive().optional().nullable(),
  memo: z.string().optional().nullable(),
  spike: z.coerce.number().int().min(0).max(100).default(50),
  block: z.coerce.number().int().min(0).max(100).default(50),
  receive: z.coerce.number().int().min(0).max(100).default(50),
  serve: z.coerce.number().int().min(0).max(100).default(50),
  toss: z.coerce.number().int().min(0).max(100).default(50),
  connect: z.coerce.number().int().min(0).max(100).default(50),
  decision: z.coerce.number().int().min(0).max(100).default(50),
})

export type PlayerFormData = z.infer<typeof PlayerSchema>

export async function getPlayers(search?: string, sortBy?: string) {
  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { number: { equals: parseInt(search) || undefined } },
          ],
        }
      : undefined

    const players = await prisma.player.findMany({
      where,
      orderBy:
        sortBy === 'number'
          ? { number: 'asc' }
          : sortBy === 'skill'
          ? { spike: 'desc' }
          : { createdAt: 'desc' },
    })

    return { success: true, data: players }
  } catch (error) {
    console.error('Failed to fetch players:', error)
    return { success: false, error: 'Failed to fetch players' }
  }
}

export async function getPlayer(id: string) {
  try {
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        conditions: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    })

    if (!player) {
      return { success: false, error: 'Player not found' }
    }

    return { success: true, data: player }
  } catch (error) {
    console.error('Failed to fetch player:', error)
    return { success: false, error: 'Failed to fetch player' }
  }
}

export async function createPlayer(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData)
    const validatedData = PlayerSchema.parse(rawData)

    await prisma.player.create({
      data: validatedData,
    })

    revalidatePath('/players')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    console.error('Failed to create player:', error)
    return { success: false, error: 'Failed to create player' }
  }

  redirect('/players')
}

export async function updatePlayer(id: string, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData)
    const validatedData = PlayerSchema.parse(rawData)

    await prisma.player.update({
      where: { id },
      data: validatedData,
    })

    revalidatePath('/players')
    revalidatePath(`/players/${id}`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    console.error('Failed to update player:', error)
    return { success: false, error: 'Failed to update player' }
  }

  redirect(`/players/${id}`)
}

export async function deletePlayer(id: string) {
  try {
    await prisma.player.delete({
      where: { id },
    })

    revalidatePath('/players')
  } catch (error) {
    console.error('Failed to delete player:', error)
    return { success: false, error: 'Failed to delete player' }
  }

  redirect('/players')
}
