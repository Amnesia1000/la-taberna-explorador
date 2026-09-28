"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await loginAdmin(password);
    setBusy(false);
    if (res.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(res.error || "No se pudo ingresar.");
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border border-[#3d2215] bg-[#180d07] p-6 rounded-sm space-y-4"
      >
        <div className="text-center">
          <p className="font-tavern text-xs uppercase tracking-widest text-[#b45309] font-bold">
            Gremio de Taberneros
          </p>
          <h1 className="font-tavern text-xl font-bold uppercase text-[#fef3c7] mt-1">
            Ingreso al panel
          </h1>
        </div>
        <div>
          <label htmlFor="admin-password" className="block text-xs font-mono uppercase text-[#d1baa5] mb-1">
            Clave
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#29170e] border border-[#5a3219] text-[#fef3c7] px-3 py-2 text-sm rounded-sm outline-none focus:border-[#f59e0b]"
          />
        </div>
        {error && (
          <p role="alert" className="text-xs font-mono text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || password === ""}
          className="w-full tavern-btn-gold rounded-sm py-2 disabled:opacity-50"
        >
          {busy ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
