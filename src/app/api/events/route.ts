import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/events - List events with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const organizerId = searchParams.get('organizerId')

    const where: any = {}

    // If organizerId is provided, don't filter by status/isPublic (for admin viewing their own events)
    if (!organizerId) {
      where.status = 'PUBLISHED'
      where.isPublic = true
    }

    // Organizer filter
    if (organizerId) {
      where.organizerId = organizerId
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Category filter
    if (category) {
      where.category = {
        name: { equals: category, mode: 'insensitive' }
      }
    }

    // Location filter
    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    // Date range filter
    if (startDate || endDate) {
      where.startDate = {}
      if (startDate) {
        where.startDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.startDate.lte = new Date(endDate)
      }
    }

    const events = await prisma.event.findMany({
      where,
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
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
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
      organizerId,
      categoryId
    } = body

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !location || !maxParticipants || !organizerId || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      )
    }

    if (start < new Date()) {
      return NextResponse.json(
        { error: 'Start date must be in the future' },
        { status: 400 }
      )
    }

    // Verify organizer exists and has ADMIN role
    const organizer = await prisma.user.findUnique({
      where: { id: organizerId }
    })

    if (!organizer || organizer.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Invalid organizer or insufficient permissions' },
        { status: 403 }
      )
    }

    // Verify category exists
    const category = await prisma.eventCategory.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: start,
        endDate: end,
        location,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        maxParticipants: parseInt(maxParticipants),
        price: price ? parseFloat(price) : 0,
        isPublic: isPublic !== false,
        imageUrl,
        organizerId,
        categoryId,
        status: 'PUBLISHED'
      },
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
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
} 