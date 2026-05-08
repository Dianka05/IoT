import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../api/auth'
import { normalizeRole } from './roles'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshAuth = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const currentUser = await getCurrentUser()
      setAuthUser(currentUser || null)
      return currentUser || null
    } catch (err) {
      setAuthUser(null)
      setError(err.message || 'Failed to load auth state')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  const value = useMemo(() => {
    const profile = authUser?.profile || null

    return {
      authUser,
      profile,
      role: normalizeRole(profile?.role),
      loading,
      error,
      refreshAuth,
    }
  }, [authUser, loading, error, refreshAuth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
