import { useState } from "react";
import { userSignup, userLogin } from "../../lib/vj.server";

type Props = {
  open: boolean;
  onClose: () => void;
  onAuth: (user: any) => void;
};

export function AuthDialog({ open, onClose, onAuth }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    setError("");

    if (!phone.trim() || !password) {
      setError("Please enter phone and password");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      let res: any;

      if (mode === "signup") {
        res = await userSignup({
          data: {
            name: name.trim(),
            phone: phone.trim(),
            password: password,
          },
        });
      } else {
        res = await userLogin({
          data: {
            phone: phone.trim(),
            password: password,
          },
        });
      }

      if (!res || !res.ok) {
        setError(res?.error || "Connection problem. Please try again.");
        return;
      }

      onAuth(res.user);
      setName("");
      setPhone("");
      setPassword("");
      setError("");
      onClose();
    } catch (e: any) {
      setError(e?.message || "Connection problem. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-zinc-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-zinc-800 px-3 py-1 text-white"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex rounded-full bg-zinc-800 p-1">
          <button
            onClick={() => {
              setMode("signin");
              setError("");
            }}
            className={`flex-1 rounded-full py-2 text-sm font-semibold ${
              mode === "signin" ? "bg-red-600 text-white" : "text-zinc-300"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className={`flex-1 rounded-full py-2 text-sm font-semibold ${
              mode === "signup" ? "bg-red-600 text-white" : "text-zinc-300"
            }`}
          >
            Create Account
          </button>
        </div>

        {mode === "signup" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name e.g. okoji"
            className="mb-3 w-full rounded-xl bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
          />
        )}

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone e.g. 0774470564"
          inputMode="tel"
          className="mb-3 w-full rounded-xl bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="mb-3 w-full rounded-xl bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
        />

        {error && (
          <p className="mb-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-red-600 py-3 font-bold text-white disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : mode === "signin"
              ? "Sign In"
              : "Create Account"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-400">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                className="font-semibold text-white underline"
                onClick={() => setMode("signup")}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="font-semibold text-white underline"
                onClick={() => setMode("signin")}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
