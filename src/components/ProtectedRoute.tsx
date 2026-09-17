import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

type Props = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gris">Verificando acceso...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}