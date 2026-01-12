'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const FormationSchema = z.object({
  name: z.string().min(1, 'フォーメーション名は必須です'),
  description: z.string().optional().nullable(),
})

const PositionSchema = z.object({
  position: z.coerce.number().int().min(1).max(6),
  playerId: z.string(),
  isLibero: z.boolean().default(false),
  liberoFor: z.coerce.number().int().min(1).max(6).optional().nullable(),
})

export async function getFormations() {
  try {
    const formations = await prisma.formation.findMany({
      include: {
        positions: {
          include: {
            player: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: formations }
  } catch (error) {
    console.error('Failed to fetch formations:', error)
    return { success: false, error: 'Failed to fetch formations' }
  }
}

export async function getFormation(id: string) {
  try {
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        positions: {
          include: {
            player: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!formation) {
      return { success: false, error: 'Formation not found' }
    }

    return { success: true, data: formation }
  } catch (error) {
    console.error('Failed to fetch formation:', error)
    return { success: false, error: 'Failed to fetch formation' }
  }
}

export async function createFormation(
  formData: FormData,
  positions: Array<{ position: number; playerId: string; isLibero?: boolean; liberoFor?: number }>
) {
  try {
    const rawData = Object.fromEntries(formData)
    const validatedData = FormationSchema.parse(rawData)

    // Validate positions
    if (positions.length !== 6) {
      return { success: false, error: '6人の選手を配置してください' }
    }

    const formation = await prisma.formation.create({
      data: {
        ...validatedData,
        positions: {
          create: positions.map((p) => ({
            position: p.position,
            playerId: p.playerId,
            isLibero: p.isLibero || false,
            liberoFor: p.liberoFor || null,
          })),
        },
      },
    })

    revalidatePath('/formations')
    return { success: true, data: formation }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    console.error('Failed to create formation:', error)
    return { success: false, error: 'Failed to create formation' }
  }
}

export async function deleteFormation(id: string) {
  try {
    await prisma.formation.delete({
      where: { id },
    })

    revalidatePath('/formations')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete formation:', error)
    return { success: false, error: 'Failed to delete formation' }
  }
}
