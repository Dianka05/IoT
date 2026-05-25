import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { changePassword } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await changePassword(password);
      const currentUser = await refreshAuth();
      const nextProfile = currentUser?.profile || null;

      navigate(
        nextProfile?.currentOrganizationId ? "/dashboard" : "/create-organization"
      );
    } catch (err) {
      console.error("Failed to change password:", err);
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9] p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-black text-slate-800">Change Password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Update the temporary password before you continue to the dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none transition focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={loading}
              className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none transition focus:border-orange-400"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {loading ? "Saving..." : "Save New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
