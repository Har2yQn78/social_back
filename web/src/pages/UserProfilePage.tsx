import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUser, getUserPosts } from '../services/users'
import { Spinner, Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../components/ui'
import UserHeader from '../components/users/UserHeader'
import type { Post, User } from '../types'

export default function UserProfilePage() {
  const { id = '' } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const [u, p] = await Promise.all([getUser(id), getUserPosts(id)])
        if (!mounted) return
        setUser(u)
        setPosts(p)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load user')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <section className="flex items-center gap-2">
        <Spinner /> <span>Loading profile…</span>
      </section>
    )
  }
  if (error || !user) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
        {error || 'User not found.'}
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <UserHeader user={user} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Posts by @{user.username}</h2>
        <div className="flex items-center gap-2">
          <Link to={`/user/${user.id}/followers`}>
            <Button variant="secondary" size="sm">Followers</Button>
          </Link>
          <Link to={`/user/${user.id}/following`}>
            <Button variant="secondary" size="sm">Following</Button>
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold">No posts yet</h3>
          <p className="mt-1 text-neutral-600">This user hasn’t posted anything.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Card key={String(post.id)}>
              <CardHeader className="mb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="leading-tight">{post.title}</CardTitle>
                  <Link to={`/post/${post.id}`}>
                    <Button variant="secondary" size="sm">Open</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700">{post.content.length > 220 ? post.content.slice(0, 219) + '…' : post.content}</p>
                {post.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map(t => <Badge key={t}>#{t}</Badge>)}
                  </div>
                ) : null}
                <div className="mt-4 text-sm text-neutral-500">
                  <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString()}</time>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
