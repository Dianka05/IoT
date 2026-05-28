import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Building2, Plus } from 'lucide-react'
import { createOrganization } from '../api/organizations'
import LoadingScreen from '../components/loadingScreen'
import StatusBanner from '../components/statusBanner'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../toast/ToastProvider'

function normalizeOrganizationId(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

export default function CreateOrganization() {
  const navigate = useNavigate()
  const {
    isAuthenticated,
    loading: authLoading,
    hasOrganizations,
    canCreateOrganizations,
    refreshAuth,
  } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState({
    name: '',
    organizationId: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (authLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (hasOrganizations && !canCreateOrganizations) {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => {
      if (name === 'name') {
        return {
          ...prev,
          name: value,
          organizationId: prev.organizationId || normalizeOrganizationId(value),
        }
      }

      return {
        ...prev,
        [name]: value,
      }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const name = String(form.name || '').trim()
    const organizationId = normalizeOrganizationId(form.organizationId)

    if (!name) {
      setError('Organization name is required')
      return
    }

    if (!organizationId) {
      setError('Organization ID is required')
      return
    }

    setSubmitting(true)

    try {
      await createOrganization({
        name,
        organizationId,
        active: true,
      })

      await refreshAuth()
      toast.success('Organization created', 'Your workspace is ready.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to create organization')
      toast.error('Create organization failed', err.message || 'The organization could not be created.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-10">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-100 bg-white p-8 shadow-xl sm:p-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
            <Building2 size={30} />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-800">
              Create Organization
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create your workspace before you start using the dashboard.
            </p>
          </div>
        </div>

        {error && (
          <StatusBanner tone="error" className="mb-6">
            {error}
          </StatusBanner>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              Organization Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Organization-1"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-orange-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              Organization ID
            </label>
            <input
              type="text"
              name="organizationId"
              value={form.organizationId}
              onChange={handleChange}
              disabled={submitting}
              placeholder="org-1"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-orange-400"
            />
            <p className="mt-2 text-xs text-slate-400">
              Use a stable ID like <span className="font-semibold">org-1</span> or <span className="font-semibold">acme-lab</span>.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-400">
              {hasOrganizations ? 'This will add one more organization to your account.' : 'Your first organization will become the current workspace.'}
            </div>

            <div className="flex items-center gap-3">
              {hasOrganizations && (
                <Link
                  to="/dashboard"
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
                >
                  Cancel
                </Link>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={16} />
                {submitting ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
