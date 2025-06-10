import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { User, UserRole } from '../generated/prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(userData: {
  name: string
  email: string
  password: string
  phone?: string
  cpf?: string
  role?: UserRole
}) {
  const hashedPassword = await hashPassword(userData.password)
  
  return prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  })
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  
  if (!isValid) {
    return null
  }

  return user
} 