export default function Page() {
  return (
    <div style={{padding:'96px 16px', maxWidth:960, margin:'0 auto', color:'#fff'}}>
      <h1 style={{fontSize:40, marginBottom:8}}>Media Finance AI — Flash</h1>
      <p style={{opacity:.8, marginBottom:24}}>
        Simple hub with sticky nav. (This view uses inline styles so we can confirm routing.)
      </p>

      <img src="/logo.svg" alt="Logo" style={{width:64, height:64}} />

      <h2 id="about" style={{marginTop:40}}>About</h2>
      <p>AI budgeting • Compliance • Incentives • VAT.</p>

      <h2 id="demos" style={{marginTop:40}}>Demo Links</h2>
      <ul>
        <li><a href="https://vat-checker.flash.mediafinance.ai" target="_blank">VAT Checker</a></li>
        <li><a href="https://budget-builder.flash.mediafinance.ai" target="_blank">Budget Builder (AI)</a></li>
      </ul>

      <h2 id="contact" style={{marginTop:40}}>Contact</h2>
      <p><a href="mailto:hello@mediafinance.ai">hello@mediafinance.ai</a></p>
    </div>
  );
}
