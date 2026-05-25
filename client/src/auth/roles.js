export function normalizeRole(role) {
  const value = String(role || 'user').toLowerCase()

  if (value === 'admin') return 'admin'
  if (value === 'technician') return 'technician'

  return 'user'
}

export function canUseOperationsDashboard(role) {
  const value = normalizeRole(role)
  return value === 'admin' || value === 'technician'
}

export function canManageUsers(role) {
  return normalizeRole(role) === 'admin'
}

export function getDefaultRouteForRole(role) {
  return '/dashboard'
}
