export default function Page() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative text-center pt-20 pb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0b0d]/40 to-transparent pointer-events-none"></div>

        {/* Transparent icon + text brand */}
        <img
          src="/logo-icon.png"
          alt="Media Finance.Ai Logo Icon"
          className="mx-auto mb-2 relative z-10"
          style={{ width: 'clamp(90px, 18vw, 160px)', height: 'auto' }}
        />
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6 relative z-10">
          MediaFinance.<span style={{ color: '#8b5cf6' }}>Ai</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight drop-shadow leading-tight relative z-10">
          The AI Operating System for
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg,#8b5cf6,#3b82f6)' }}
          >
            Production Finance
          </span>
        </h1>

        <p className="mt-4 mb-4 text-lg text-gray-300 max-w-3xl mx-auto relative z-10">
          MediaFinance.Ai is building an end-to-end, AI-native production finance platform for film and HETV — designed to sit
          alongside existing accounting systems and quietly automate the work nobody has time for.
        </p>
      </section>

      {/* About */}
      <section id="about" className="max-w-3xl mx-auto">
        <div className="card p-6">
          <h2 className="text-xl font-medium mb-3">About MediaFinance.Ai</h2>
          <p className="text-gray-200">
            MediaFinance.Ai builds practical, production-proven finance workflows for film and HETV, with a simple goal:
            streamline complex financial processes so crews can move faster with fewer errors and full auditability.
            Founded by working production accountants, we design for real-world pressures — heavy workloads, tight timelines,
            changing schedules, global tax incentives, and strict studio compliance.
          </p>
          <p className="text-gray-200 mt-3">
            Our long-term vision is an AI-powered, end-to-end production finance stack: budgets, cost reports, approvals,
            payroll bridges, incentives, VAT, AP, and audit trails, all orchestrated by a single intelligent layer that
            works with the tools productions already use.
          </p>
        </div>
      </section>

      {/* Pitch Deck baked into homepage (reusing #demos anchor) */}
      <section id="demos" className="max-w-3xl mx-auto">
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-medium text-left">MediaFinance.Ai in 8 Slides</h2>
          <p className="text-sm text-gray-300 text-left">
            An AI-first production finance platform, outlined the way we’d pitch it to studios, investors, and partners — all on one page.
          </p>

          {/* 01 Problem */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 mb-1">01 — The Problem</h3>
            <p className="text-gray-300 text-sm">
              Production finance is still driven by spreadsheets, PDFs, and desktop software. Data is re-keyed multiple times
              across budgeting, payroll, AP, VAT, and incentives. Approvals live in email threads. Compliance is manual. Audits
              are forensic exercises. Nothing is truly real-time.
            </p>
          </div>

          {/* 02 Vision */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 mb-1">02 — The Vision</h3>
            <p className="text-gray-300 text-sm">
              An AI-native operating system for production finance: one layer that understands the budget, the schedule, the
              ledger, and the studio manual — and uses that intelligence to draft, check, route, and reconcile financial data
              automatically, while humans supervise and approve.
            </p>
          </div>

          {/* 03 Product: OS, not a tool */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 mb-1">03 — What We’re Building</h3>
            <p className="text-gray-300 text-sm mb-2">
              MediaFinance.Ai is not a single tool. It’s a connected stack of AI services designed around real productions:
            </p>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
              <li>AI Budget Engine – from script or outline to studio-ready top sheet.</li>
              <li>Live Cost Reporting – forecasts, variances, and burn-rate in real time.</li>
              <li>Incentive &amp; VAT Engine – all lines tagged and reconciled to boxes and rebates.</li>
              <li>Approvals &amp; Workflow – POs, overages, savings, and sign-offs with full audit trails.</li>
              <li>Payroll &amp; AP Bridges – timesheets, loan-outs, and vendor invoices pre-checked before export.</li>
            </ul>
          </div>

          {/* 04 Works with existing systems */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 mb-1">04 — Built to Work Alongside Existing Systems</h3>
            <p className="text-gray-300 text-sm">
              We don’t ask productions to rip out PSL+, SmartAccounting, Netsuite, Xero, or Sargent Disc. MediaFinance.Ai
              sits on top as an AI coordination layer, ingesting ledgers, POs, timesheets, and invoices, then pushing back
              clean, coded, compliance-ready data.
            </p>
          </div>

          {/* 05 Who it's for */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 mb-1">05 — Who We Serve</h3>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
              <li>Studios and streamers needing real-time, audit-ready oversight across slates.</li>
              <li>Line Producers and Finance Controllers juggling budgets, overages, and approvals.</li>
              <li>Production Accountants and AP teams buried in invoices, POs, and manual checks.</li>
              <li>Payroll, tax, and audit partners who want structured, tagged, and reconciled data from day one.</li>
            </ul>
          </div>

          {/* 06 Why us */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 mb-1">06 — Why Us</h3>
            <p className="text-gray-300 text-sm mb-2">
              MediaFinance.Ai is founded by working production accountants who have run multiple large-scale UK and
              international shows. We’ve:
            </p>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
              <li>Designed and stress-tested VAT, incentive, and free-field frameworks on real productions.</li>
              <li>Built and deployed early prototypes for payroll checking, VAT reconciliation, and flash budgeting.</li>
              <li>Lived the pain points across scouting, prep, shoot, post, and wrap — and know where AI can safely step in.</li>
            </ul>
          </div>

          {/* 07 Roadmap */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 mb-1">07 — Roadmap</h3>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
              <li>
                <span className="font-semibold">Now:</span> Codify production finance rules, workflows, and incentives as reusable AI “brains”.
              </li>
              <li>
                <span className="font-semibold">Next 12 months:</span> Deepen prototypes into private betas across budgeting, VAT/incentives,
                and payroll/AP checking with selected productions.
              </li>
              <li>
                <span className="font-semibold">Beyond:</span> Launch a full production-finance OS: multi-show dashboards, global incentive
                engine, and integrations across major accounting and payroll platforms.
              </li>
            </ul>
          </div>

          {/* 08 How to engage */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 mb-1">08 — How We Work With You</h3>
            <p className="text-gray-300 text-sm mb-2">
              We’re not selling a generic SaaS seat. We co-design with real productions:
            </p>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
              <li>Pilot programmes on live or upcoming shows.</li>
              <li>Discovery workshops with finance, tech, and audit teams.</li>
              <li>Bespoke guardrails aligned to your studio manuals and approval thresholds.</li>
            </ul>
            <p className="text-gray-300 text-sm mt-2">
              If you’d like to explore pilots, co-development, or investment, reach out via the contacts below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-3xl mx-auto">
        <div className="card p-6">
          <h2 className="text-xl font-medium mb-3 text-left">Contact</h2>
          <p className="text-gray-300 mb-5 text-left">
            We are production accountants turned product builders, focused on making the financial side of film and HETV
            radically more efficient, compliant, and transparent. If you’re a studio, financier, or production company
            interested in pilots, co-design, or investment conversations, we’d love to talk.
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
