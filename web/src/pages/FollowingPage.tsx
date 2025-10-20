import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { listFollowing } from '../services/users'
import type { User } from '../types'
import { Spinner, Card } from '../components/ui'

export default function FollowingPage() {
  const { id = '' } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const list = await listFollowing(id)
        if (!mounted) return
        setUsers(list)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load following')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="flex items-center gap-2"><Spinner /> <span>Loading…</span></div>
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Following</h1>
      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          Not following anyone yet.
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {users.map(u => (
            <Card key={String(u.id)} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">@{u.username}</div>
                  <div className="text-sm text-neutral-600">ID: {String(u.id)}</div>
                </div>
                <Link to={`/user/${u.id}`} className="text-sm font-medium underline">View</Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
