import { useState, useEffect } from 'react'
import { authService } from '@/services/authService'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    authService.getSession().then(session => {
      setIsAuthenticated(!!session)
    })

    const { unsubscribe } = authService.onAuthChange(session => {
      setIsAuthenticated(!!session)
    })

    return () => unsubscribe()
  }, [])

  return { isAuthenticated }
}