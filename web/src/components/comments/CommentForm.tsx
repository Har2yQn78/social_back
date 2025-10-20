import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Textarea } from '../ui'
import { Form, Field, getError } from '../form/Form'
import type { CreateCommentInput } from '../../types'

const Schema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Max 1000 characters')
})
type Values = z.infer<typeof Schema>

type Props = {
  onSubmit: (input: CreateCommentInput) => Promise<void> | void
}

export default function CommentForm({ onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { content: '' },
    mode: 'onTouched'
  })

  async function handle(values: Values) {
    setSubmitting(true)
    try {
      await onSubmit({ content: values.content })
      form.reset()
    } finally {
      setSubmitting(false)
    }
  }

  const { register, handleSubmit, formState } = form

  return (
    <Form onSubmit={handleSubmit(handle)}>
      <Field label="Add a comment" htmlFor="content" error={getError(formState.errors, 'content')}>
        <Textarea id="content" rows={4} placeholder="Share your thoughts…" {...register('content')} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitting ? 'Posting…' : 'Post comment'}
        </Button>
      </div>
    </Form>
  )
}
