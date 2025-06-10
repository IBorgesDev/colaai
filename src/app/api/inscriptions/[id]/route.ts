import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/inscriptions/[id] - Cancel inscription
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if inscription exists
    const inscription = await prisma.inscription.findUnique({
      where: { id },
      include: {
        event: true
      }
    })

    if (!inscription) {
      return NextResponse.json(
        { error: 'Inscription not found' },
        { status: 404 }
      )
    }

    // Check if user owns this inscription
    if (inscription.participantId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only cancel your own inscriptions' },
        { status: 403 }
      )
    }

    // Check if inscription is already cancelled
    if (inscription.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Inscription is already cancelled' },
        { status: 400 }
      )
    }

    // Check if event has already started (optional business rule)
    const now = new Date()
    if (inscription.event.startDate < now) {
      return NextResponse.json(
        { error: 'Cannot cancel inscription for an event that has already started' },
        { status: 400 }
      )
    }

    // Update inscription status to cancelled
    const cancelledInscription = await prisma.inscription.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      },
      include: {
        event: {
          include: {
            category: true,
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        participant: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Inscription cancelled successfully',
      inscription: cancelledInscription
    })
  } catch (error) {
    console.error('Error cancelling inscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel inscription' },
      { status: 500 }
    )
  }
} 