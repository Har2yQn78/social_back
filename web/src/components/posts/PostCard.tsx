import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../ui'
import type { Post } from '../../types'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'

type Props = {
  post: Post
}

function truncate(text: string, max = 220) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

export default function PostCard({ post }: Props) {
  const currentUser = useAuthStore(s => s.user)
  const isOwner =
    currentUser && (String(currentUser?.id) === String(post.userId) || currentUser?.username === post.userId)

  return (
    <Card>
      <CardHeader className="mb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="leading-tight">{post.title}</CardTitle>
          {isOwner ? (
            <Link to={`/post/${post.id}/edit`} className="ml-3">
              <Button variant="secondary" size="sm">Edit</Button>
            </Link>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-700">{truncate(post.content)}</p>

        {post.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map(tag => (
              <Badge key={tag}>#{tag}</Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-4 text-sm text-neutral-500">
          <span>By user #{post.userId}</span>
          <span className="mx-2">•</span>
          <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString()}</time>
        </div>
      </CardContent>
    </Card>
  )
}
