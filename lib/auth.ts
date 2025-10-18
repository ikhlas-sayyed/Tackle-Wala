import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'customer'
  name: string
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!
  private static readonly JWT_EXPIRES_IN = '7d'

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    })
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload
    } catch (error) {
      return null
    }
  }

  static extractTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }
    
    // Also check for token in cookies
    const tokenFromCookie = request.cookies.get('token')?.value
    return tokenFromCookie || null
  }

  static getUserFromRequest(request: NextRequest): JWTPayload | null {
    const token = this.extractTokenFromRequest(request)
    if (!token) return null
    
    return this.verifyToken(token)
  }
}
