import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Buscar estatísticas em paralelo
    const [
      totalUsers,
      totalEvents,
      totalInscriptions,
      paidInscriptions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.inscription.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.inscription.findMany({
        where: {
          status: 'ACTIVE',
          paid: true,
          event: {
            price: { gt: 0 }
          }
        },
        include: {
          event: {
            select: { price: true }
          }
        }
      })
    ])

    // Calcular receita total
    const revenue = paidInscriptions.reduce((total, inscription) => {
      return total + Number(inscription.event.price)
    }, 0)

    const stats = {
      totalUsers,
      totalEvents,
      totalInscriptions,
      revenue
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 