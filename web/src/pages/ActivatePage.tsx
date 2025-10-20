import { useParams } from 'react-router-dom'

export default function ActivatePage() {
  const { token } = useParams()
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Activate account</h1>
      <p className="text-neutral-600">Token: <code className="rounded bg-neutral-200 px-1 py-0.5">{token}</code></p>
    </section>
  )
}
