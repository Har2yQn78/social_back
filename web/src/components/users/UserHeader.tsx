import { useState } from 'react'
import { Button, Card } from '../ui'
import type { User } from '../../types'
import { followUser, unfollowUser } from '../../services/users'
import { toast } from 'sonner'
import { useAuthStore } from '../../stores/auth.store'

type Props = {
  user: User
}

export default function UserHeader({ user }: Props) {
  const auth = useAuthStore()
  const isSelf = auth.user && String(auth.user.id) === String(user.id)

  // We don’t know initial follow state from backend; start as false (not following).
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleFollow() {
    setLoading(true)
    try {
      if (!following) {
        await followUser(user.id)
        setFollowing(true)
        toast.success(`You are now following @${user.username}`)
      } else {
        await unfollowUser(user.id)
        setFollowing(false)
        toast.success(`Unfollowed @${user.username}`)
      }
    } catch (e: any) {
      toast.error(e?.message || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">@{user.username}</h1>
          <p className="mt-1 text-sm text-neutral-600">User ID: {String(user.id)}</p>
        </div>

        {!isSelf && auth.token ? (
          <Button variant={following ? 'secondary' : 'primary'} onClick={handleFollow} loading={loading}>
            {following ? 'Following' : 'Follow'}
          </Button>
        ) : null}
      </div>
    </Card>
  )
}
