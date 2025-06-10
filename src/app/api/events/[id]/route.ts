import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/events/[id] - Get event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        inscriptions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            participant: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
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

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      address,
      latitude,
      longitude,
      maxParticipants,
      price,
      isPublic,
      imageUrl,
      categoryId,
      organizerId // For authorization check
    } = body

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        inscriptions: {
          where: {
            status: 'ACTIVE'
          }
        }
      }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if user is the organizer
    if (organizerId && existingEvent.organizerId !== organizerId) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the event organizer can update this event' },
        { status: 403 }
      )
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (start >= end) {
        return NextResponse.json(
          { error: 'Start date must be before end date' },
          { status: 400 }
        )
      }
    }

    // Check if reducing maxParticipants below current inscriptions
    if (maxParticipants && parseInt(maxParticipants) < existingEvent.inscriptions.length) {
      return NextResponse.json(
        { error: `Cannot reduce max participants below current inscriptions (${existingEvent.inscriptions.length})` },
        { status: 400 }
      )
    }

    // Verify category exists if provided
    if (categoryId) {
      const category = await prisma.eventCategory.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (startDate) updateData.startDate = new Date(startDate)
    if (endDate) updateData.endDate = new Date(endDate)
    if (location) updateData.location = location
    if (address !== undefined) updateData.address = address
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null
    if (maxParticipants) updateData.maxParticipants = parseInt(maxParticipants)
    if (price !== undefined) updateData.price = parseFloat(price)
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (categoryId) updateData.categoryId = categoryId

    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
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

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const organizerId = searchParams.get('organizerId')

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        inscriptions: {
          where: {
            status: 'ACTIVE'
          }
        }
      }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if user is the organizer
    if (organizerId && existingEvent.organizerId !== organizerId) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the event organizer can delete this event' },
        { status: 403 }
      )
    }

    // Check if there are active inscriptions
    if (existingEvent.inscriptions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete event with active inscriptions' },
        { status: 400 }
      )
    }

    await prisma.event.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
} 