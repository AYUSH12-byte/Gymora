import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { login, loading } = useAuth();

  const [email, setEmail] = useState("admin@gymora.com");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-lg">
            <ShieldCheck
              size={32}
              strokeWidth={2}
              className="text-white"
            />
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
            Gymora
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Main Administrator Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">

          {/* Card Header */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to manage gyms, subscriptions, and
              platform administration.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="admin@gymora.com"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Gymora Platform Administration
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            Secure administrator access
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;