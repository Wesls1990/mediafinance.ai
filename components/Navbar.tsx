export default function Navbar() {
  return (
    <div className="nav-fixed">
      <div className="nav-inner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="nav-bar flex items-center justify-between">
            <a href="/" className="flex items-center gap-2" aria-label="Media Finance.Ai – Home">
              <img src="/logo-icon.png" alt="Media Finance.Ai" className="w-6 h-6" />
              <span className="font-semibold tracking-tight">
                Media Finance<span style={{ color: '#8b5cf6' }}>.Ai</span>
              </span>
            </a>
            <nav className="flex items-center gap-6 text-sm">
              <a href="#about"  className="nav-link">About</a>
              <a href="#demos"  className="nav-link">Demo</a>
              <a href="#contact" className="nav-link">Contact</a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
