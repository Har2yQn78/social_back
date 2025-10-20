import type { Comment } from '../../types'
import { Card } from '../ui'

type Props = {
  comments: Comment[]
}

export default function CommentList({ comments }: Props) {
  if (!comments.length) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-center text-neutral-600">
        No comments yet.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {comments.map(c => (
        <Card key={String(c.id)} className="p-3">
          <div className="text-sm text-neutral-600">
            <span>By user #{c.userId}</span>
            <span className="mx-2">•</span>
            <time dateTime={c.createdAt}>
              {new Date(c.createdAt).toLocaleString()}
            </time>
          </div>
          <p className="mt-2 text-neutral-900 whitespace-pre-wrap">{c.content}</p>
        </Card>
      ))}
    </div>
  )
}
  