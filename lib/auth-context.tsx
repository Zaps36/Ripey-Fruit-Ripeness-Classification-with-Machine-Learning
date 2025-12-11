"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface User {
  id: string
  email: string
  name: string
}

interface AuthError {
  message: string
  type: 'email' | 'password' | 'general'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: AuthError }>
  logout: () => void
  loading: boolean
  clearErrors: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        localStorage.removeItem('access_token')
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      localStorage.removeItem('access_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        const errorMessage = data.error || 'Login failed. Please try again.'
        
        // Show toast notification
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive"
        })

        // Return error for inline display
        let errorType: 'email' | 'password' | 'general' = 'general'
        if (errorMessage.includes('email') || errorMessage.includes('Email')) {
          errorType = 'email'
        } else if (errorMessage.includes('password') || errorMessage.includes('Password')) {
          errorType = 'password'
        }

        return {
          success: false,
          error: {
            message: errorMessage,
            type: errorType
          }
        }
      }

      localStorage.setItem('access_token', data.access_token)
      setUser(data.user)
      
      toast({
        title: "Welcome back! 🎉",
        description: `Hello, ${data.user.name || data.user.email}!`,
      })

      router.push('/')
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = "Network error. Please check your connection."
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      })

      return {
        success: false,
        error: {
          message: errorMessage,
          type: 'general'
        }
      }
    }
  }

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        const errorMessage = data.error || 'Registration failed. Please try again.'
        
        // Show toast notification
        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive"
        })

        // Return error for inline display
        let errorType: 'email' | 'password' | 'general' = 'general'
        if (errorMessage.includes('email') || errorMessage.includes('Email')) {
          errorType = 'email'
        } else if (errorMessage.includes('password') || errorMessage.includes('Password')) {
          errorType = 'password'
        }

        return {
          success: false,
          error: {
            message: errorMessage,
            type: errorType
          }
        }
      }

      localStorage.setItem('access_token', data.access_token)
      setUser(data.user)
      
      toast({
        title: "Welcome to Fruit Scanner! 🎉",
        description: "Your account has been created successfully.",
      })

      router.push('/')
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = "Network error. Please check your connection."
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive"
      })

      return {
        success: false,
        error: {
          message: errorMessage,
          type: 'general'
        }
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
    toast({
      title: "Logged out successfully",
      description: "You have been successfully logged out.",
    })
    router.push('/')
  }

  const clearErrors = () => {
    // This function can be used to clear errors when user starts typing
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, clearErrors }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}