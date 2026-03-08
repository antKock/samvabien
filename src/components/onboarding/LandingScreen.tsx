import Link from 'next/link'

function BabyIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Simple sleeping baby illustration */}
      <circle cx="60" cy="52" r="28" fill="var(--sleep-bg)" />
      <circle cx="60" cy="52" r="22" fill="var(--surface)" />
      {/* Closed eyes */}
      <path d="M48 50 Q52 54 56 50" stroke="var(--sleep-icon)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M64 50 Q68 54 72 50" stroke="var(--sleep-icon)" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Small smile */}
      <path d="M54 58 Q60 63 66 58" stroke="var(--sleep-icon)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Blanket */}
      <ellipse cx="60" cy="85" rx="35" ry="18" fill="var(--sleep-bg)" />
      <ellipse cx="60" cy="82" rx="30" ry="14" fill="var(--sleep-accent)" opacity="0.3" />
      {/* Zzz */}
      <text x="82" y="36" fill="var(--sleep-icon)" fontSize="14" fontWeight="800" fontFamily="Nunito">z</text>
      <text x="90" y="28" fill="var(--sleep-icon)" fontSize="10" fontWeight="800" fontFamily="Nunito" opacity="0.6">z</text>
    </svg>
  )
}

export default function LandingScreen() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6">
      <div className="flex w-full max-w-[430px] flex-col items-center gap-8">
        <BabyIllustration />

        <div className="flex flex-col items-center gap-1">
          <h1
            className="text-sleep-icon"
            style={{ fontSize: '32px', fontWeight: 800 }}
          >
            pousse
          </h1>
          <p
            className="text-text-sec"
            style={{ fontSize: '10px', fontWeight: 600 }}
          >
            Suivi bébé simple et serein
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link
            href="#"
            className="flex h-12 items-center justify-center rounded-full bg-accent text-white"
            style={{ fontSize: '14px', fontWeight: 700 }}
          >
            Essayer la démo
          </Link>

          <Link
            href="/onboarding"
            className="flex h-12 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent"
            style={{ fontSize: '14px', fontWeight: 700 }}
          >
            Créer un profil
          </Link>

          <Link
            href="/join"
            className="flex h-12 items-center justify-center text-text-sec"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            Rejoindre un foyer
          </Link>
        </div>
      </div>
    </main>
  )
}
