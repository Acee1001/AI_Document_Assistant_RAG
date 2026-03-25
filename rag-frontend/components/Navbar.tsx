"use client";

import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";

const navItems = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How It Works" },
  { id: "use-cases", label: "Use Cases" },
  { id: "see-it", label: "See It In Action" },
  { id: "faq", label: "FAQ" }
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("features");

  const handleScroll = () => {
    setScrolled(window.scrollY > 30);
    const targets = navItems.map((item) => ({ ...item, element: document.getElementById(item.id) }));
    for (const target of targets) {
      if (!target.element) continue;
      const rect = target.element.getBoundingClientRect();
      if (rect.top <= 120 && rect.bottom > 120) {
        setActive(target.id);
        break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileOpen(false);
    }
  };

  return (
    <header
      className={`fixed left-0 right-0 z-40 mx-auto w-full border-b backdrop-blur-xl transition-all duration-300 ${
        scrolled ? "bg-[#090a11]/70 border-white/20 py-3" : "bg-transparent border-transparent py-4"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-white"
          onClick={() => scrollTo("features")}
          aria-label="Go to top"
        >
          <HiOutlineSparkles className="h-6 w-6 text-gradient" />
          <span className="bg-gradient-to-r from-[#6c63ff] via-[#8b8ff8] to-[#00d4ff] bg-clip-text text-transparent">
            RAG Chat
          </span>
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`text-sm font-medium transition ${
                active === item.id
                  ? "text-white drop-shadow-[0_0_16px_rgba(108,99,255,0.35)]"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
          <a
            href="/"
            className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-[#6c63ff]/20 transition hover:bg-white/20"
          >
            Open App →
          </a>
        </nav>

        <button
          className="inline-flex items-center justify-center rounded-md border border-white/20 p-2 text-white md:hidden"
          onClick={() => setMobileOpen((s) => !s)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={`absolute inset-x-0 top-full mt-2 overflow-hidden rounded-xl bg-[#10101a]/95 px-4 pb-4 transition-all duration-300 md:hidden ${
          mobileOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
              active === item.id ? "bg-white/10 text-white" : "text-text-secondary hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
        <a
          href="/"
          className="mt-2 block rounded-lg bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] px-3 py-2 text-center text-sm font-semibold text-black"
        >
          Open App →
        </a>
      </div>
    </header>
  );
}
