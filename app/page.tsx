export default function Page() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="text-center pt-6">
        {/* Full logo */}
        <img
          src="/logo.png"
          alt="Media Finance AI"
          className="mx-auto mb-6"
          style={{ width: 'clamp(140px, 22vw, 280px)', height: 'auto' }}
        />

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight drop-shadow leading-tight">
          Financial Intelligence for{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(90deg,#8b5cf6,#3b82f6)',
            }}
          >
            the Media Industry
          </span>
        </h1>

        {/* Subhead (suite of approved + tested tools) */}
        <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
          A suite of approved, tested tools for production accountants and finance teams—covering
          payroll, flash budgeting, VAT, AP matching and compliance—fast, accurate, and studio-ready.
        </p>
      </section>

      {/* About */}
      <section id="about" className="max-w-3xl mx-auto">
        <div className="card p-6">
          <h2 className="text-xl font-medium mb-3">About MediaFinance.Ai</h2>
          <p className="text-gray-200 mb-3">
            MediaFinance.Ai builds practical, production-proven finance tools for film & HETV. Our goal is
            simple: streamline complex financial workflows so crews can move faster with fewer errors and full
            auditability. Founded by working production accountants, we design for real-world pressures—tight
            timelines, changing schedules, and strict studio compliance.
          </p>
          <p className="text-gray-300">
            The platform includes Payroll Builder, Flash Budget Builder, VAT Checker, and AP Matcher—each aligned
            to studio manuals and UK/EU/US incentive requirements. Expect clean exports, standardised charts of
            accounts, approval guardrails, and reporting packs that hold up to audit.
          </p>
        </div>
      </section>

      {/* Demo Links */}
      <section id="demos" className="max-w-3xl mx-auto">
        <div className="card p-6">
          <h2 className="text-xl font-medium mb-3">Demo Links</h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            <li>
              <a className="button w-full" href="#" target="_blank" rel="noreferrer">
                Payroll Builder
              </a>
            </li>
            <li>
              <a className="button w-full" href="#" target="_blank" rel="noreferrer">
                Flash Budget Builder
              </a>
            </li>
            <li>
              <a className="button w-full" href="#" target="_blank" rel="noreferrer">
                AP Matcher
              </a>
            </li>
            <li>
              <a className="button w-full" href="#" target="_blank" rel="noreferrer">
                VAT Checker
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-3xl mx-auto">
        <div className="card p-6">
          <h2 className="text-xl font-medium mb-2">Contact</h2>
          <p className="text-gray-300 mb-3">
            Want a quick walkthrough or sandbox access? Drop us a line—our team will share a short demo and
            set you up with a trial environment tailored to your production.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="card p-4">
              <div className="font-semibold mb-1">David Blank — Co-Founder</div>
              <a className="underline" href="mailto:david@mediafinance.ai">david@mediafinance.ai</a>
            </div>
            <div className="card p-4">
              <div className="font-semibold mb-1">Laurence West — Co-Founder</div>
              <a className="underline" href="mailto:laurence@mediafinance.ai">laurence@mediafinance.ai</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
