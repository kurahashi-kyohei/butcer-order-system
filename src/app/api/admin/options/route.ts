import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [usageOptions, flavorOptions] = await Promise.all([
      prisma.usageOption.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }),
      prisma.flavorOption.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      })
    ])

    return NextResponse.json({
      usageOptions,
      flavorOptions
    })
  } catch (error) {
    console.error('Error fetching options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch options' },
      { status: 500 }
    )
  }
}