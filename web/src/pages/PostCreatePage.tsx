import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PostForm from '../components/posts/PostForm'
import { createPost } from '../services/posts'
import { toast } from 'sonner'
import type { CreatePostInput, UpdatePostInput } from '../types'

export default function PostCreatePage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(input: CreatePostInput | UpdatePostInput) {
    if (!('title' in input) || !input.title) {
      toast.error('Title is required')
      return
    }

    setSubmitting(true)
    try {
      const post = await createPost(input as CreatePostInput)
      toast.success('Post created')
      navigate(`/post/${post.id}`)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Create a post</h1>
      <PostForm onSubmit={handleSubmit} submitting={submitting} />
    </section>
  )
}