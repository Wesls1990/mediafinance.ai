export default function Navbar() {
  return (
    <div className="nav-fixed">
      <div className="nav-inner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="MediaFinance.AI" className="w-8 h-8" />
              <span className="font-semibold tracking-tight">Media Finance AI</span>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <a href="#about" className="opacity-90 hover:opacity-100">About</a>
              <a href="#demos" className="opacity-90 hover:opacity-100">Demo Links</a>
              <a href="#contact" className="opacity-90 hover:opacity-100">Contact</a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
