export default function Page() {
  return (
    <div className="space-y-20">
      {/* Hero / Holding */}
      <section className="relative text-center pt-20 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0b0d]/40 to-transparent pointer-events-none"></div>

        {/* Logo */}
        <img
          src="/logo-icon.png"
          alt="Media Finance.Ai Logo Icon"
          className="mx-auto mb-2 relative z-10"
          style={{ width: 'clamp(90px, 18vw, 160px)', height: 'auto' }}
        />

        {/* Brand text */}
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6 relative z-10">
          MediaFinance.<span style={{ color: '#8b5cf6' }}>Ai</span>
        </div>

        {/* Coming soon headline */}
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight drop-shadow leading-tight relative z-10">
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg,#8b5cf6,#3b82f6)' }}
          >
            Coming Soon
          </span>
        </h1>

        {/* Short subcopy */}
        <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto relative z-10">
          We’re building an Ai-native operating suite for production finance.
          <br />
          Full site launching soon.
        </p>

        {/* Optional contact line – remove if you truly want nothing else */}
        <p className="mt-6 text-sm text-gray-400 relative z-10">
          For enquiries:&nbsp;
          <a href="mailto:laurence@mediafinance.ai" className="underline">
            laurence@mediafinance.ai
          </a>
        </p>
      </section>
    </div>
  )
}
