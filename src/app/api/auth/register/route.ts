import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const name = typeof body.name === 'string' ? body.name.trim() : ''

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name: name || email.split('@')[0],
        role: 'reader',
      },
      overrideAccess: true,
    })

    const loginResult = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences,
      },
    })

    if (loginResult.token) {
      const cookieName = `${payload.config.cookiePrefix}-token`
      response.cookies.set(cookieName, loginResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
