export default function Page() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative text-center pt-20 pb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0b0d]/40 to-transparent pointer-events-none"></div>

        <img
          src="/logo.png"
          alt="Media Finance.Ai"
          className="mx-auto mb-6 relative z-10"
          style={{ width: 'clamp(160px, 22vw, 280px)', height: 'auto' }}
        />

        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight drop-shadow leading-tight relative z-10">
          Financial Intelligence for
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg,#8b5cf6,#3b82f6)' }}
          >
            the Media Industry
          </span>
        </h1>

        <p className="mt-4 mb-4 text-lg text-gray-300 max-w-3xl mx-auto relative z-10">
          A suite of studio-approved, tested tools for FCs, Production Accountants, and finance teams.
        </p>
      </section>

      {/* About */}
      <section id="about" className="max-w-3xl mx-auto">
        <div className="card p-6">
          <h2 className="text-xl font-medium mb-3">About MediaFinance.Ai</h2>
          <p className="text-gray-200">
            MediaFinance.Ai builds practical, production-proven finance tools for film and HETV, built to work
            alongside existing accounting software and systems. Our goal is simple: streamline complex financial
            workflows and administrative burdens so crews can move faster with fewer errors and full auditability.
            Founded by working production accountants, we design for real-world pressures — heavy workloads,
            tight timelines, changing schedules, and strict studio compliance.
          </p>
        </div>
      </section>

      {/* Demo Links */}
      <section id="demos" className="max-w-3xl mx-auto">
        <div className="card p-6">
          <h2 className="text-xl font-medium mb-2 text-left">Demo Links</h2>
          <p className="text-sm text-gray-300 mb-4 text-left">
            Working prototypes you can click through now. These are live builds shaped by real productions — expect rapid iteration.
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 justify-center place-items-center text-sm">
            <li>
              <a
                className="button w-52 text-center"
                href="https://payroll.mediafinance.ai/"
                target="_blank"
                rel="noreferrer"
                data-protect="1"
              >
                Payroll Builder
              </a>
            </li>
            <li>
              <a
                className="button w-52 text-center"
                href="https://flash.mediafinance.ai/"
                target="_blank"
                rel="noreferrer"
                data-protect="1"
              >
                Flash Budget Builder
              </a>
            </li>
            <li>
              <a className="button w-52 text-center" href="/coming-soon-ap">
                AP Matcher
              </a>
            </li>
            <li>
              <a className="button w-52 text-center" href="/coming-soon-vat">
                VAT Checker
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-3xl mx-auto">
        <div className="card p-6">
          <h2 className="text-xl font-medium mb-3 text-left">Contact</h2>
          <p className="text-gray-300 mb-5 text-left">
            We’re production accountants turned toolmakers — enthusiastic inventors focused on making film finance better.
            If you want a quick spin-through or a sandbox, drop us a line and we’ll tailor a short demo to your workflow.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 text-sm justify-center">
            <div className="card p-4 text-center">
              <div className="font-semibold mb-1">David Blank — Co-Founder</div>
              <a className="underline" href="mailto:david@mediafinance.ai">
                david@mediafinance.ai
              </a>
            </div>
            <div className="card p-4 text-center">
              <div className="font-semibold mb-1">Laurence West — Co-Founder</div>
              <a className="underline" href="mailto:laurence@mediafinance.ai">
                laurence@mediafinance.ai
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
