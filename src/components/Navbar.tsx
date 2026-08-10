"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Github, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const REPO_URL = "https://github.com/Prestongramberg/Pastiche";
const RELEASES_URL = `${REPO_URL}/releases/latest`;

type NavLink = {
  name: string;
  href: string;
  /** Present when the link points at a section of the home page. */
  sectionId?: string;
};

const navLinks: NavLink[] = [
  { name: "Features", href: "/#features", sectionId: "features" },
  { name: "How It Works", href: "/#how-it-works", sectionId: "how-it-works" },
  { name: "Shortcuts", href: "/#shortcuts", sectionId: "shortcuts" },
  { name: "Docs", href: "/docs" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-midnight";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();

  // Scroll state + scroll-spy for the home-page anchors (rAF-throttled).
  useEffect(() => {
    const sectionIds = pathname === "/" ? ["features", "how-it-works", "shortcuts"] : [];
    let frame = 0;

    const measure = () => {
      frame = 0;
      setScrolled(window.scrollY > 16);

      if (sectionIds.length === 0) {
        setActiveSection(null);
        return;
      }

      const line = window.innerHeight * 0.35;
      let current: string | null = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line) current = id;
      }
      setActiveSection(current);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape, and once the desktop nav takes over.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onChange);
    };
  }, [isOpen]);

  const solid = scrolled || isOpen || pathname !== "/";

  const isActive = (link: NavLink) => {
    if (link.sectionId) return pathname === "/" && activeSection === link.sectionId;
    return pathname === link.href || pathname.startsWith(`${link.href}/`);
  };

  return (
    <nav
      aria-label="Main"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-midnight/75 backdrop-blur-xl border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link
          href="/"
          className={`group flex items-center gap-2.5 shrink-0 rounded-lg ${focusRing}`}
        >
          <Image
            src="/icon-512.png"
            alt=""
            width={28}
            height={28}
            priority
            className="w-7 h-7 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-lg font-black tracking-tight text-foreground">
            Pastiche
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.name}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${focusRing} ${
                  active
                    ? "text-foreground"
                    : "text-foreground/55 hover:text-foreground"
                }`}
              >
                {link.name}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-gradient origin-left transition-transform duration-300 ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Pastiche on GitHub"
            className={`ml-1 p-2 rounded-lg text-foreground/55 hover:text-foreground transition-colors duration-200 ${focusRing}`}
          >
            <Github size={18} aria-hidden="true" />
          </a>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <a
            href={RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`bg-gradient inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-opacity ${focusRing}`}
          >
            <Download size={15} aria-hidden="true" />
            Download
          </a>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            className={`p-2 rounded-lg border border-border text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-all ${focusRing}`}
          >
            {isOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="mobile-nav"
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden overflow-hidden border-t border-border bg-midnight/95 backdrop-blur-xl"
          >
            <div className="max-w-6xl mx-auto px-5 sm:px-6 py-4 flex flex-col">
              {navLinks.map((link) => {
                const active = isActive(link);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between py-3 text-base rounded-lg transition-colors ${focusRing} ${
                      active ? "text-foreground font-semibold" : "text-foreground/65 hover:text-foreground"
                    }`}
                  >
                    {link.name}
                    {active && (
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </Link>
                );
              })}
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 py-3 text-base text-foreground/65 hover:text-foreground transition-colors rounded-lg ${focusRing}`}
              >
                <Github size={17} aria-hidden="true" />
                GitHub
              </a>
              <a
                href={RELEASES_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className={`bg-gradient mt-3 mb-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white ${focusRing}`}
              >
                <Download size={16} aria-hidden="true" />
                Download for Mac
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
