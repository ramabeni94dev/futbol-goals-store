"use client";

import Link from "next/link";
import { LogOut, ShieldCheck, ShoppingCart, UserRound } from "lucide-react";

import { siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, profile, isAdmin, logout, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-background/85 backdrop-blur-xl">
      <div className="page-shell flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand text-lg font-black text-white">
            F
          </span>
          <div>
            <p className="font-heading text-2xl uppercase tracking-[0.18em] text-foreground">
              {siteConfig.shortName}
            </p>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Arcos de futbol
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white/70 px-4 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            <ShoppingCart className="size-4" />
            <span>Carrito</span>
          </Link>

          {loading ? (
            <span className="rounded-full border border-line bg-white/70 px-4 py-3 text-xs font-semibold text-muted">
              Cargando sesion
            </span>
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white/70 px-4 text-sm font-semibold text-foreground transition hover:bg-white"
              >
                <UserRound className="size-4" />
                <span>{profile?.name ?? user.displayName ?? "Mi cuenta"}</span>
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 text-sm font-semibold text-brand transition hover:bg-brand/15"
                >
                  <ShieldCheck className="size-4" />
                  <span>Admin</span>
                </Link>
              ) : null}
              <button
                onClick={() => logout()}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white/70 px-4 text-sm font-semibold text-foreground transition hover:bg-white"
                type="button"
              >
                <LogOut className="size-4" />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold text-foreground transition hover:bg-white/70"
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,53,40,0.2)] transition hover:bg-brand-strong"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
