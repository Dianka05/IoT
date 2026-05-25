import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../api/auth'
import { getOrganizations, switchCurrentOrganization } from '../api/organizations'
import { normalizeRole } from './roles'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null)
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshAuth = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const currentUser = await getCurrentUser()
      setAuthUser(currentUser || null)

      if (currentUser?.profile) {
        try {
          const orgItems = await getOrganizations(100)
          setOrganizations(orgItems)
        } catch (orgErr) {
          setOrganizations([])
        }
      } else {
        setOrganizations([])
      }

      return currentUser || null
    } catch (err) {
      if (err?.status === 401) {
        setAuthUser(null)
        setOrganizations([])
        setError('')
        return null
      }

      setAuthUser(null)
      setOrganizations([])
      setError(err.message || 'Failed to load auth state')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const setCurrentOrganization = useCallback(async (organizationId) => {
    await switchCurrentOrganization(organizationId)
    return refreshAuth()
  }, [refreshAuth])

  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  const value = useMemo(() => {
    const profile = authUser?.profile || null
    const hasOrganizations =
      Array.isArray(profile?.organizationIds) &&
      profile.organizationIds.length > 0
    const currentOrganizationId = profile?.currentOrganizationId || null
    const currentOrganization = organizations.find(
      (organization) =>
        (organization.organizationId || organization.id) === currentOrganizationId
    ) || null
    const normalizedRole = normalizeRole(profile?.role)
    const canCreateOrganizations =
      normalizedRole === 'admin' || !hasOrganizations

    return {
      authUser,
      profile,
      isAuthenticated: Boolean(authUser?.auth?.uid),
      organizations,
      currentOrganization,
      currentOrganizationId,
      hasOrganizations,
      needsOrganizationSetup: Boolean(authUser?.auth?.uid) && !currentOrganizationId,
      canCreateOrganizations,
      role: normalizedRole,
      loading,
      error,
      refreshAuth,
      setCurrentOrganization,
    }
  }, [authUser, organizations, loading, error, refreshAuth, setCurrentOrganization])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
