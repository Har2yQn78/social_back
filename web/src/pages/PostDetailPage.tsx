import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { getPostWithComments, addComment } from '../services/postDetail'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Spinner } from '../components/ui'
import CommentList from '../components/comments/CommentList'
import CommentForm from '../components/comments/CommentForm'
import { useAuthStore } from '../stores/auth.store'
import { toast } from 'sonner'

export default function PostDetailPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const token = useAuthStore(s => s.token)
  const currentUser = useAuthStore(s => s.user)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['post-detail', id],
    queryFn: () => getPostWithComments(id)
  })

  async function handleAdd(content: { content: string }) {
    try {
      await addComment(id, content)
      toast.success('Comment added')
      await queryClient.invalidateQueries({ queryKey: ['post-detail', id] })
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add comment')
    }
  }

  if (isLoading) {
    return (
      <section className="flex items-center gap-2">
        <Spinner /> <span>Loading post…</span>
      </section>
    )
  }
  if (isError || !data) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
        {(error as Error)?.message || 'Failed to load post.'}
      </section>
    )
  }

  const { post, comments } = data
  const isOwner =
    currentUser && String(currentUser?.id) === String(post.userId)

  return (
    <section className="space-y-6">
      {/* Post */}
      <Card>
        <CardHeader className="mb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="leading-tight">{post.title}</CardTitle>
            {isOwner ? (
              <Link to={`/post/${post.id}/edit`}>
                <Button variant="secondary" size="sm">Edit</Button>
              </Link>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none prose-p:my-3">
            <p className="whitespace-pre-wrap text-neutral-800">{post.content}</p>
          </div>

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

      {/* Comments */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Comments</h2>
        <CommentList comments={comments} />

        {token ? (
          <div className="mt-4">
            <CommentForm onSubmit={handleAdd} />
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-700">
            <Link to={`/login?from=/post/${post.id}`} className="font-medium underline">
              Log in
            </Link>{' '}
            to write a comment.
          </div>
        )}
      </div>
    </section>
  )
}
