import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  if (!req.auth) {
    const url = new URL('/api/auth/signin', req.url)
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: ['/admin/:path*'],
}
