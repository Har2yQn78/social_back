import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-neutral-600">The page you’re looking for doesn’t exist.</p>
      <Link to="/feed" className="mt-6 rounded-xl bg-primary px-4 py-2 text-white hover:bg-primary-dark">
        Go to feed
      </Link>
    </section>
  )
}
