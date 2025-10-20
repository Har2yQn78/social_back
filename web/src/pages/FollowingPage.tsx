import { useParams } from 'react-router-dom'

export default function FollowingPage() {
  const { id } = useParams()
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Following</h1>
      <p className="text-neutral-600">For user ID: <code className="rounded bg-neutral-200 px-1 py-0.5">{id}</code></p>
    </section>
  )
}
