import { HouseholdProvider } from '@/contexts/HouseholdContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HouseholdProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </HouseholdProvider>
  )
}
