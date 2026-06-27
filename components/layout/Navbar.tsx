import Image from "next/image";
import Link from "next/link";
import { createInsforgeServer } from "@/lib/insforge-server";
import { LogoutButton } from "./LogoutButton";
import { NavbarLink } from "./NavbarLink";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

export async function Navbar() {
  let isAuthenticated = false;

  try {
    const client = await createInsforgeServer();
    const {
      data: { user },
    } = await client.auth.getCurrentUser();
    isAuthenticated = !!user;
  } catch {
    isAuthenticated = false;
  }

  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={124}
            height={42}
            priority
            className="h-8 w-auto"
          />
        </Link>

        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavbarLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>
        )}

        {isAuthenticated ? (
          <LogoutButton />
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-accent-foreground bg-overlay-dark px-4 py-2 rounded-md hover:bg-overlay transition-colors"
          >
            Start for free
          </Link>
        )}
      </div>
    </header>
  );
}
