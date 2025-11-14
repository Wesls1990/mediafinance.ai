'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isTop, setIsTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setIsTop(window.scrollY < 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkBase =
    'text-sm tracking-wide hover:text-white transition-colors cursor-pointer';
  const linkMuted = 'text-gray-400';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors ${
        isTop ? 'bg-transparent' : 'bg-black/70 backdrop-blur'
      }`}
    >
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold text-white">
          MediaFinance.<span style={{ color: '#8b5cf6' }}>Ai</span>
        </Link>

        <div className="flex items-center gap-6">
          <a href="#about" className={`${linkBase} ${linkMuted}`}>
            About
          </a>
          <a href="#pitch" className={`${linkBase} ${linkMuted}`}>
            Pitch
          </a>
          <a href="#contact" className={`${linkBase} ${linkMuted}`}>
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}
