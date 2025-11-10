export default function Page(){
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="text-center pt-6">
        <div className="inline-block card px-4 py-1 small">AI budgeting • Compliance • Incentives • VAT</div>
        <h1 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight drop-shadow">The future of film budgeting</h1>
        <p className="mt-3 text-lg text-gray-300 max-w-2xl mx-auto">AI‑driven. Studio‑compliant. Built for Line Producers, Production Accountants and Finance Execs.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a className="button" href="#demos">See demo links</a>
          <a className="button" href="#contact" style={{background:'linear-gradient(90deg,#22c55e,#10b981)'}}>Contact</a>
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-3xl mx-auto">
        <div className="card p-6">
          <h2 className="text-xl font-medium mb-2">About</h2>
          <p className="text-gray-300">Media Finance AI builds modern, cloud‑first tools for film & HETV finance: Budget Builder, Top Sheet Generator, VAT Checker, Payroll, Scenario Planning, and Compliance Guardrails. Fully aligned with studio manuals and UK/EU/US incentives.</p>
        </div>
      </section>

      {/* Demo Links */}
      <section id="demos" className="max-w-3xl mx-auto">
        <div className="card p-6">
          <h2 className="text-xl font-medium mb-3">Demo Links</h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            <li><a className="button w-full" href="https://vat-checker.flash.mediafinance.ai" target="_blank" rel="noreferrer">VAT Checker</a></li>
            <li><a className="button w-full" href="https://budget-builder.flash.mediafinance.ai" target="_blank" rel="noreferrer">Budget Builder (AI)</a></li>
            <li><a className="button w-full" href="https://top-sheet.flash.mediafinance.ai" target="_blank" rel="noreferrer">Top Sheet Generator</a></li>
            <li><a className="button w-full" href="mailto:hello@mediafinance.ai">More on request</a></li>
          </ul>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-3xl mx-auto">
        <div className="card p-6">
          <h2 className="text-xl font-medium mb-2">Contact</h2>
          <p className="text-gray-300">Email <a className="underline" href="mailto:hello@mediafinance.ai">hello@mediafinance.ai</a> to book a walkthrough or request access.</p>
        </div>
      </section>
    </div>
  )
}
