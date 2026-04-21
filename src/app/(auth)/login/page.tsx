'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [view, setView] = useState('sign-in')
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    setView('check-email')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.auth.signInWithPassword({
      email,
      password,
    })
    router.push('/dashboard')
  }

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-2">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">
            {view === 'sign-in' ? 'Sign in' : 'Sign up'}
          </CardTitle>
          <CardDescription>
            {view === 'sign-in'
              ? 'Enter your email below to login to your account'
              : 'Enter your email below to create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {view === 'check-email' ? (
            <p className="text-center text-sm text-muted-foreground">
              Check your email to complete the sign up process!
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6">
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M21.35,11.1H12.18V13.83H18.67C18.36,15.65 17.3,17.15 15.67,18.18V21.09H18.5C20.27,19.4 21.35,17.02 21.35,14.33C21.35,13.43 21.25,12.61 21.07,11.83M12.18,8.68V5.98H12.23L15.67,5.91C15.93,5.15 16.12,4.32 16.23,3.47H12.18V0.77L15.02,0.59H12.18V5.98C9.52,5.98 7.33,7.98 7.33,10.66C7.33,13.34 9.52,15.34 12.18,15.34C13.88,15.34 15.17,14.7 16.23,13.83L18.67,16.27C17.3,17.3 15.67,18.18 12.18,18.18C8.88,18.18 6.09,15.89 6.09,12.78C6.09,9.67 8.88,7.38 12.18,7.38V8.68Z"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  Github
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <form onSubmit={view === 'sign-in' ? handleSignIn : handleSignUp}>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button className="w-full mt-4">
                    {view === 'sign-in' ? 'Sign in' : 'Sign up'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
        <div className="mt-4 text-center text-sm">
          {view === 'sign-in' ? (
            <>
              Don&apos;t have an account?{' '}
              <Link
                href="#"
                className="underline"
                onClick={() => setView('sign-up')}
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link
                href="#"
                className="underline"
                onClick={() => setView('sign-in')}
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
