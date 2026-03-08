import JoinScreen from '@/components/onboarding/JoinScreen'

export default async function JoinWithCodePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  return <JoinScreen initialCode={code} />
}
