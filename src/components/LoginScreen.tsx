import React, { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (username !== "admin" || password !== "admine") {
      setError("Nom d'utilisateur ou mot de passe incorrect.");
      return;
    }

    setLoading(true);
    setTimeout(onLogin, 450);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ rotate: -8, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.4 }}
            className="mx-auto mb-4 w-14 h-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200"
          >
            <span className="text-lg font-bold">SIT</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900">SIT ERP</h1>
          <p className="mt-1 text-sm text-slate-500">Connectez-vous à votre espace de gestion</p>
        </div>

        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 p-6 space-y-5">
          <label className="block">
            <span className="block mb-1.5 text-sm font-medium text-slate-700">Nom d'utilisateur</span>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                autoFocus
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </label>

          <label className="block">
            <span className="block mb-1.5 text-sm font-medium text-slate-700">Mot de passe</span>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="admine"
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>

          {error && (
            <motion.p initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </motion.p>
          )}

          <button disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors">
            {loading ? "Connexion..." : "Se connecter"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">Solutions IT Algérie</p>
      </motion.div>
    </div>
  );
}
