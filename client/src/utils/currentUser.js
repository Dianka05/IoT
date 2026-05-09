export function formatRoleLabel(role) {
  const value = String(role || 'user').toLowerCase()

  if (value === 'admin') return 'Admin'
  if (value === 'technician') return 'Technician'

  return 'User'
}

export function getCurrentUserDisplayName(profile) {
  return profile?.name || profile?.email || profile?.userId || 'Current User'
}

export function getCurrentUserSessions(sessions, profile) {
  if (!profile) return []

  const allowedIds = new Set([
    profile.userId,
    profile.authUid,
  ].filter(Boolean))

  return sessions.filter((session) => {
    const sessionUserId = session.userId || null
    return allowedIds.has(sessionUserId)
  })
}

export function formatCardUid(uid) {
  const cleanUid = String(uid || '')
    .replace(/[^a-fA-F0-9]/g, '')
    .toUpperCase()

  if (!cleanUid) {
    return ''
  }

  return cleanUid.match(/.{1,2}/g)?.join('-') || cleanUid
}

export function getCurrentUserCardBadge(profile) {
  const cards = Array.isArray(profile?.cards) ? profile.cards : []

  const activeCard = cards.find(
    (card) => String(card?.status || '').toLowerCase() === 'active' && card?.uid
  )

  if (activeCard) {
    return {
      label: formatCardUid(activeCard.uid),
      tone: 'default',
    }
  }

  const blockedCard = cards.find(
    (card) => String(card?.status || '').toLowerCase() === 'blocked'
  )

  if (blockedCard) {
    const formattedUid = formatCardUid(blockedCard.uid)

    return {
      label: formattedUid ? `Blocked card ${formattedUid}` : 'Blocked card',
      tone: 'danger',
    }
  }

  if (cards.length === 0) {
    return {
      label: 'No card yet',
      tone: 'muted',
    }
  }

  return {
    label: 'No active card',
    tone: 'muted',
  }
}

export function getPreferredCardUid(profile) {
  const cards = Array.isArray(profile?.cards) ? profile.cards : []

  if (cards.length === 0) {
    return ''
  }

  const activeCard = cards.find(
    (card) => String(card?.status || '').toLowerCase() === 'active' && card?.uid
  )

  return formatCardUid(activeCard?.uid || cards[0]?.uid)
}
