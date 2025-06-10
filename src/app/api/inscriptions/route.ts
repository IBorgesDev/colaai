import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/inscriptions - Get user inscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const inscriptions = await prisma.inscription.findMany({
      where: {
        participantId: userId,
        status: {
          in: ['ACTIVE', 'CONFIRMED']
        }
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
        }
      },
      orderBy: {
        inscriptionDate: 'desc'
      }
    })

    return NextResponse.json(inscriptions)
  } catch (error) {
    console.error('Error fetching inscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inscriptions' },
      { status: 500 }
    )
  }
}

// POST /api/inscriptions - Create new inscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, participantId, paymentStatus } = body

    if (!eventId || !participantId) {
      return NextResponse.json(
        { error: 'Event ID and Participant ID are required' },
        { status: 400 }
      )
    }

    // Check if event exists and is available for inscription
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            inscriptions: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Event is not available for inscription' },
        { status: 400 }
      )
    }

    if (!event.isPublic) {
      return NextResponse.json(
        { error: 'Event is private' },
        { status: 400 }
      )
    }

    // Check if event has already started
    if (event.startDate < new Date()) {
      return NextResponse.json(
        { error: 'Cannot inscribe to an event that has already started' },
        { status: 400 }
      )
    }

    // Check if event is full
    if (event._count.inscriptions >= event.maxParticipants) {
      return NextResponse.json(
        { error: 'Event is full' },
        { status: 400 }
      )
    }

    // Check if user exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Check if user is already inscribed
    const existingInscription = await prisma.inscription.findUnique({
      where: {
        participantId_eventId: {
          participantId,
          eventId
        }
      }
    })

    if (existingInscription) {
      if (existingInscription.status === 'ACTIVE') {
        return NextResponse.json(
          { error: 'User is already inscribed to this event' },
          { status: 400 }
        )
      } else if (existingInscription.status === 'CANCELLED') {
        // Reactivate cancelled inscription
        const reactivatedInscription = await prisma.inscription.update({
          where: { id: existingInscription.id },
          data: {
            status: 'ACTIVE',
            inscriptionDate: new Date()
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

        return NextResponse.json(reactivatedInscription, { status: 201 })
      }
    }

    // Generate unique ticket code
    const ticketCode = `TICKET-${eventId.slice(-8)}-${participantId.slice(-8)}-${Date.now()}`

    // Determine payment status
    const isPaid = Number(event.price) === 0 || paymentStatus === 'PAID'
    const inscriptionStatus = paymentStatus === 'PENDING' ? 'CONFIRMED' : 'ACTIVE'

    // Create new inscription
    const inscription = await prisma.inscription.create({
      data: {
        participantId,
        eventId,
        status: inscriptionStatus,
        paid: isPaid,
        ticketCode
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

    return NextResponse.json(inscription, { status: 201 })
  } catch (error) {
    console.error('Error creating inscription:', error)
    return NextResponse.json(
      { error: 'Failed to create inscription' },
      { status: 500 }
    )
  }
} 