"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      router.replace("/login");
    } catch {
      setError(
        "Impossible de créer le compte. Vérifie les informations.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Sparkles size={22} />
          </div>

          <h1 className="text-2xl font-bold">
            Créer ton compte
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Commence à construire ton deuxième cerveau.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium"
              >
                Prénom
              </label>

              <input
                id="firstName"
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium"
              >
                Nom
              </label>

              <input
                id="lastName"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
              placeholder="vous@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Mot de passe
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              minLength={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
              placeholder="Minimum 8 caractères"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Tu as déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-medium text-slate-900 hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}