'use client'

import { useHousehold } from '@/hooks/useHousehold'
import ProfileHeaderButton from '@/components/profile/ProfileHeaderButton'

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function formatDateFr(): string {
  const formatted = dateFmt.format(new Date())
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export default function DashboardHeader() {
  const { profile, isDemo } = useHousehold()

  return (
    <div className="flex items-center justify-between">
      <span
        className="text-text-sec"
        style={{ fontSize: '10px', fontWeight: 600 }}
      >
        {formatDateFr()}
      </span>
      {profile && <ProfileHeaderButton babyName={profile.babyName} isDemo={isDemo} />}
    </div>
  )
}
