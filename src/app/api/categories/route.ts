import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/categories - List all categories
export async function GET() {
  try {
    const categories = await prisma.eventCategory.findMany({
      include: {
        _count: {
          select: {
            events: {
              where: {
                status: 'PUBLISHED',
                isPublic: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, icon, adminId } = body

    if (!name || !adminId) {
      return NextResponse.json(
        { error: 'Name and Admin ID are required' },
        { status: 400 }
      )
    }

    // Verify admin exists and has ADMIN role
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    // Check if category name already exists
    const existingCategory = await prisma.eventCategory.findUnique({
      where: { name }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.eventCategory.create({
      data: {
        name,
        description,
        color,
        icon
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
} 