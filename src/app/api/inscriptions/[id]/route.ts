import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/inscriptions/[id] - Debug endpoint to check inscription details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('=== DEBUG GET INSCRIPTION ===')
    console.log('ID:', id)
    console.log('UserID from query:', userId)

    const inscription = await prisma.inscription.findUnique({
      where: { id },
      include: {
        event: true,
        participant: true
      }
    })

    return NextResponse.json({
      debug: true,
      inscription,
      requestUserId: userId,
      canCancel: inscription?.participantId === userId,
      inscriptionStatus: inscription?.status
    })
  } catch (error) {
    console.error('Debug GET error:', error)
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 })
  }
}

// DELETE /api/inscriptions/[id] - Cancel inscription
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    
    console.log('=== DELETE INSCRIPTION START ===')
    console.log('Inscription ID:', id)
    console.log('Full URL:', request.url)
    
    // Ler userId da query string
    const userId = searchParams.get('userId')
    console.log('UserId from query:', userId)
    console.log('UserId type:', typeof userId)

    if (!userId || userId === 'null' || userId === 'undefined') {
      console.log('ERROR: User ID is invalid or missing')
      return NextResponse.json(
        { error: 'User ID is required as query parameter' },
        { status: 400 }
      )
    }

    // Check if inscription exists
    console.log('Looking for inscription with ID:', id)
    const inscription = await prisma.inscription.findUnique({
      where: { id },
      include: {
        event: true
      }
    })

    console.log('Found inscription:', inscription ? {
      id: inscription.id,
      participantId: inscription.participantId,
      status: inscription.status
    } : 'NOT FOUND')

    if (!inscription) {
      console.log('ERROR: Inscription not found')
      return NextResponse.json(
        { error: 'Inscription not found' },
        { status: 404 }
      )
    }

    // Check if user owns this inscription
    console.log('Authorization check:')
    console.log('- Inscription participantId:', inscription.participantId)
    console.log('- Request userId:', userId)
    console.log('- Match:', inscription.participantId === userId)

    if (inscription.participantId !== userId) {
      console.log('ERROR: Unauthorized access')
      return NextResponse.json(
        { error: 'Unauthorized: You can only cancel your own inscriptions' },
        { status: 403 }
      )
    }

    // Check if inscription is already cancelled
    if (inscription.status === 'CANCELLED') {
      console.log('ERROR: Inscription already cancelled')
      return NextResponse.json(
        { error: 'Inscription is already cancelled' },
        { status: 400 }
      )
    }

    console.log('Updating inscription status to CANCELLED...')

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

    console.log('SUCCESS: Inscription cancelled successfully')
    console.log('=== DELETE INSCRIPTION END ===')
    
    return NextResponse.json({
      message: 'Inscription cancelled successfully',
      inscription: cancelledInscription
    })
  } catch (error) {
    console.error('FATAL ERROR in DELETE inscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel inscription' },
      { status: 500 }
    )
  }
} 