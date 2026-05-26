import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/auth";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../toast/ToastProvider";

export default function RegistrationForm() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match", "Enter the same password in both fields.");
      return;
    }

    if (!form.email || !form.password) {
      toast.error("Missing fields", "Enter your email and password to create the admin account.");
      return;
    }

    setLoading(true);

    try {
      const result = await register(form.email, form.password);

      if (result.success) {
        toast.success("Admin account created", "You can now create your first organization.");
        const currentUser = await refreshAuth();
        const nextProfile = currentUser?.profile || null;
        const hasCurrentOrganization = Boolean(nextProfile?.currentOrganizationId);
        navigate(hasCurrentOrganization ? "/dashboard" : "/create-organization");
      } else {
        toast.error("Registration failed", result.error?.message || "The account could not be created.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Connection error", err.message || "The server is not responding right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-center text-xl font-semibold text-gray-800">
        Create an account
      </h2>

      <p className="text-center text-sm text-gray-600">
        Register a new admin account to create your first organization.
      </p>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
          placeholder="********"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
          placeholder="********"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full rounded-lg py-2 font-medium text-white transition ${
          loading
            ? "cursor-not-allowed bg-orange-300"
            : "bg-orange-500 hover:bg-orange-600 active:bg-orange-700"
        }`}
      >
        {loading ? "Registering..." : "Register"}
      </button>

      <div className="text-center">
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-gray-600 transition hover:text-gray-800 active:text-gray-900"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}
