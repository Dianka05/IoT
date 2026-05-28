const {
  getConfigurationByOrganizationId,
  upsertConfigurationByOrganizationId,
} = require('./configuration.store.firestore')

const DEFAULT_PRESENCE_DETECTION = {
  enabled: true,
  requireMotion: true,
  distanceCmThreshold: 40,
  suspiciousPresenceDurationSec: 30,
  deniedAccessLookbackSec: 120,
  suspiciousPresenceCooldownSec: 180,
}
const CONFIG_CACHE_TTL_MS = 60 * 1000
const configurationCache = new Map()

function toBoolean(value, fallback) {
  if (value === undefined || value === null) {
    return fallback
  }

  return value === true
}

function toPositiveNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function sanitizePresenceDetectionConfig(config = {}, fallback = DEFAULT_PRESENCE_DETECTION) {
  return {
    enabled: toBoolean(config.enabled, fallback.enabled),
    requireMotion: toBoolean(config.requireMotion, fallback.requireMotion),
    distanceCmThreshold: toPositiveNumber(
      config.distanceCmThreshold,
      fallback.distanceCmThreshold
    ),
    suspiciousPresenceDurationSec: toPositiveNumber(
      config.suspiciousPresenceDurationSec,
      fallback.suspiciousPresenceDurationSec
    ),
    deniedAccessLookbackSec: toPositiveNumber(
      config.deniedAccessLookbackSec,
      fallback.deniedAccessLookbackSec
    ),
    suspiciousPresenceCooldownSec: toPositiveNumber(
      config.suspiciousPresenceCooldownSec,
      fallback.suspiciousPresenceCooldownSec
    ),
  }
}

function sanitizeBoxOverrides(boxOverrides = {}) {
  const entries = Object.entries(boxOverrides || {})
  const normalizedEntries = entries
    .filter(([boxId]) => Boolean(boxId))
    .map(([boxId, override]) => [
      String(boxId),
      sanitizePresenceDetectionConfig(
        override || {},
        DEFAULT_PRESENCE_DETECTION
      ),
    ])

  return Object.fromEntries(normalizedEntries)
}

function normalizeConfiguration(configuration = {}, organizationId = null) {
  return {
    organizationId: organizationId || configuration.organizationId || null,
    presenceDetection: sanitizePresenceDetectionConfig(
      configuration.presenceDetection || {}
    ),
    boxOverrides: sanitizeBoxOverrides(configuration.boxOverrides || {}),
  }
}

async function getConfigurationForOrganization(organizationId) {
  const cached = configurationCache.get(organizationId)
  const nowMs = Date.now()

  if (cached && nowMs - cached.createdAt <= CONFIG_CACHE_TTL_MS) {
    return cached.value
  }

  const current = await getConfigurationByOrganizationId(organizationId)
  const normalized = normalizeConfiguration(current || {}, organizationId)
  configurationCache.set(organizationId, {
    createdAt: nowMs,
    value: normalized,
  })
  return normalized
}

async function saveConfigurationForOrganization(organizationId, patch = {}) {
  const current = await getConfigurationForOrganization(organizationId)
  const next = {
    organizationId,
    presenceDetection: sanitizePresenceDetectionConfig(
      patch.presenceDetection || current.presenceDetection,
      current.presenceDetection
    ),
    boxOverrides:
      patch.boxOverrides !== undefined
        ? sanitizeBoxOverrides(patch.boxOverrides)
        : current.boxOverrides,
  }

  const saved = await upsertConfigurationByOrganizationId(organizationId, next)
  const normalized = normalizeConfiguration(saved, organizationId)
  configurationCache.set(organizationId, {
    createdAt: Date.now(),
    value: normalized,
  })
  return normalized
}

async function getPresenceDetectionConfigForBox(organizationId, boxId) {
  const configuration = await getConfigurationForOrganization(organizationId)
  const override = configuration.boxOverrides[String(boxId)] || null

  return sanitizePresenceDetectionConfig(
    override || configuration.presenceDetection,
    configuration.presenceDetection
  )
}

module.exports = {
  DEFAULT_PRESENCE_DETECTION,
  getConfigurationForOrganization,
  saveConfigurationForOrganization,
  getPresenceDetectionConfigForBox,
}
