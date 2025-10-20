import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle, Badge } from '../ui'
import { Form, Field, getError } from '../form/Form'
import type { CreatePostInput, Post, UpdatePostInput } from '../../types'

const Schema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Max 200 characters'),
  content: z.string().min(1, 'Content is required'),
  tagsCsv: z.string().optional()
})

type Values = {
  title: string
  content: string
  tagsCsv: string
}

export type PostFormProps = {
  defaultValues?: Partial<Post>
  submitting?: boolean
  onSubmit: (input: CreatePostInput | UpdatePostInput) => Promise<void> | void
}

export default function PostForm({ defaultValues, submitting, onSubmit }: PostFormProps) {
  const [previewTags, setPreviewTags] = useState<string[]>(
    (defaultValues?.tags as string[]) || []
  )

  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      content: defaultValues?.content ?? '',
      tagsCsv: (defaultValues?.tags as string[])?.join(',') ?? ''
    },
    mode: 'onTouched'
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = form

  const tagsCsv = watch('tagsCsv')
  
  // keep live preview
  if (typeof tagsCsv === 'string') {
    const arr = tagsCsv
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
    if (arr.join(',') !== previewTags.join(',')) setPreviewTags(arr)
  }

  async function submit(values: Values) {
    await onSubmit({
      title: values.title,
      content: values.content,
      tags: values.tagsCsv
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{defaultValues?.id ? 'Edit post' : 'Create a post'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit(submit)}>
          <Field label="Title" htmlFor="title" error={getError(errors, 'title')}>
            <Input id="title" placeholder="A concise title" {...register('title')} />
          </Field>

          <Field label="Content" htmlFor="content" error={getError(errors, 'content')}>
            <Textarea id="content" placeholder="Write your post…" rows={10} {...register('content')} />
          </Field>

          <Field
            label="Tags"
            htmlFor="tags"
            help="Comma-separated. Example: go, database, api"
            error={getError(errors, 'tagsCsv')}
          >
            <Input id="tags" placeholder="go, database, api" {...register('tagsCsv')} />
          </Field>

          {previewTags.length ? (
            <div className="flex flex-wrap gap-1.5">
              {previewTags.map(t => (
                <Badge key={t}>#{t}</Badge>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex justify-end">
            <Button type="submit" loading={submitting} disabled={submitting}>
              {submitting ? 'Saving…' : defaultValues?.id ? 'Save changes' : 'Publish'}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}