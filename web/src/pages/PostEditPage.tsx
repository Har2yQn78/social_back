import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PostForm from '../components/posts/PostForm'
import { getPost, updatePost } from '../services/posts'
import { toast } from 'sonner'
import type { UpdatePostInput } from '../types'
import { Spinner } from '../components/ui'

export default function PostEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [post, setPost] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      try {
        const p = await getPost(id)
        if (mounted) setPost(p)
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load post')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [id])

  async function handleSubmit(input: UpdatePostInput) {
    if (!id) return
    setSubmitting(true)
    try {
      const updated = await updatePost(id, input) // no version sent
      toast.success('Post updated')
      navigate(`/post/${updated.id}`)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update post')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="flex items-center gap-2">
        <Spinner /> <span>Loading post…</span>
      </section>
    )
  }

  if (!post) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
        Post not found.
      </section>
    )
  }

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
      <PostForm defaultValues={post} onSubmit={handleSubmit} submitting={submitting} />
    </section>
  )
}
