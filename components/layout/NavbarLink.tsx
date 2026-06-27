"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavbarLinkProps = {
  href: string;
  label: string;
};

export function NavbarLink({ href, label }: NavbarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`text-sm font-medium transition-colors ${
        isActive
          ? "text-accent"
          : "text-text-dark hover:text-accent"
      }`}
    >
      {label}
    </Link>
  );
}
