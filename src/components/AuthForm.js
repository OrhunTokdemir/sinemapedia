"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const isSignup = mode === "signup";

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const f = new FormData(e.currentTarget);
    const id = String(f.get("identifier")).trim();
    const password = String(f.get("password"));

    const { error } = isSignup
      ? await signUp.email({
          email: String(f.get("email")).trim(),
          password,
          name: String(f.get("name")).trim(),
          username: id,
        })
      : id.includes("@")
        ? await signIn.email({ email: id, password })
        : await signIn.username({ username: id, password });

    setPending(false);
    if (error) return setError(error.message ?? "Something went wrong");
    // Only allow same-site relative redirects.
    router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto mt-10 max-w-sm space-y-3 p-6">
      <h1 className="text-xl font-bold">{isSignup ? "Create your account" : "Log in"}</h1>
      {isSignup && (
        <>
          <input name="name" required maxLength={80} placeholder="Display name" className="input" autoComplete="name" />
          <input name="email" type="email" required placeholder="Email" className="input" autoComplete="email" />
        </>
      )}
      <input
        name="identifier"
        required
        placeholder={isSignup ? "Username (letters, numbers, _)" : "Email or username"}
        pattern={isSignup ? "[A-Za-z0-9_.]{3,30}" : undefined}
        className="input"
        autoComplete="username"
      />
      <input
        name="password"
        type="password"
        required
        minLength={8}
        placeholder="Password"
        className="input"
        autoComplete={isSignup ? "new-password" : "current-password"}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
      </button>
      {isSignup && (
        <p lang="tr" className="text-center text-xs text-muted">
          Kişisel verileriniz{" "}
          <Link href="/kvkk" className="text-accent-ink underline">KVKK Aydınlatma Metni</Link> kapsamında işlenir.
        </p>
      )}
      <p className="text-center text-sm text-muted">
        {isSignup ? (
          <>Already have an account? <Link href="/login" className="text-accent-ink underline">Log in</Link></>
        ) : (
          <>New here? <Link href="/signup" className="text-accent-ink underline">Create an account</Link></>
        )}
      </p>
    </form>
  );
}
