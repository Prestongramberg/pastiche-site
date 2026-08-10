import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Github, Laptop } from "lucide-react";

const REPO_URL = "https://github.com/Prestongramberg/Pastiche";

type FooterLink = {
  name: string;
  href: string;
  external?: boolean;
};

const productLinks: FooterLink[] = [
  { name: "Features", href: "/#features" },
  { name: "Shortcuts", href: "/#shortcuts" },
  { name: "Docs", href: "/docs" },
  { name: "Changelog", href: `${REPO_URL}/releases`, external: true },
];

const projectLinks: FooterLink[] = [
  { name: "GitHub", href: REPO_URL, external: true },
  { name: "Report an Issue", href: `${REPO_URL}/issues/new`, external: true },
  { name: "License", href: `${REPO_URL}/blob/main/LICENSE`, external: true },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-darker rounded";

const linkClass = `inline-flex items-center gap-1 text-sm text-foreground/50 hover:text-foreground transition-colors duration-200 ${focusRing}`;

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-foreground/40 mb-4">
        {title}
      </h2>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {link.name}
                <ArrowUpRight size={13} aria-hidden="true" className="opacity-50" />
              </a>
            ) : (
              <Link href={link.href} className={linkClass}>
                {link.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-darker">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[42rem] max-w-[120%] h-80 bg-accent/10 rounded-full blur-[120px]"
      />

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:pr-8">
            <Link
              href="/"
              className={`inline-flex items-center gap-2.5 ${focusRing}`}
            >
              <Image
                src="/icon-512.png"
                alt=""
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-lg font-black tracking-tight text-foreground">
                Pastiche
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/50">
              A limitless clipboard for macOS. Every copy you make, kept on your
              Mac and one keystroke away.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pastiche on GitHub"
                className={`p-2 rounded-lg border border-border text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-all ${focusRing}`}
              >
                <Github size={17} aria-hidden="true" />
              </a>
              <span className="text-xs text-foreground/40">
                Free &amp; open source · macOS 13+
              </span>
            </div>
          </div>

          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Project" links={projectLinks} />
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-foreground/40">
            MIT licensed. Built by Preston Gramberg.
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-foreground/40">
            <Laptop size={15} aria-hidden="true" className="text-accent" />
            All data stays on your Mac.
          </p>
        </div>
      </div>
    </footer>
  );
}
