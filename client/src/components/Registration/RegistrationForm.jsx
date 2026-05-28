import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/auth";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../toast/ToastProvider";

const IDENTIFIER_PATTERN = /^ID-\d{12}$/;

function normalizeIdentifierNumber(value) {
  return String(value || "").trim().toUpperCase();
}

export default function RegistrationForm() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
    customerIdentifierNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "customerIdentifierNumber" ? value.toUpperCase() : value,
    }));
  };

const handleSubmit = async () => {
    const normalizedIdentifierNumber = normalizeIdentifierNumber(
      form.customerIdentifierNumber
    );

    if (!form.email || !form.password || !form.customerIdentifierNumber) {
      toast.error(
        "Missing fields",
        "Enter your email, password and identification number to create the admin account."
      );
      return;
    }

    if (!IDENTIFIER_PATTERN.test(normalizedIdentifierNumber)) {
      toast.error(
        "Invalid identification number",
        "Identification number must match the format ID-XXXXXXXXXXXX, where X is a digit."
      );
      return;
    }

    if (form.password !== form.confirm) {
      toast.error(
        "Passwords do not match",
        "Enter the same password in both fields."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await register(
        form.email,
        form.password,
        null,
        normalizedIdentifierNumber
      );

      if (result.success) {
        toast.success(
          "Admin account created",
          "You can now create your first organization."
        );

        const currentUser = await refreshAuth();
        const nextProfile = currentUser?.profile || null;
        const hasCurrentOrganization = Boolean(
          nextProfile?.currentOrganizationId
        );

        navigate(hasCurrentOrganization ? "/dashboard" : "/create-organization");
      } else {
        toast.error(
          "Registration failed",
          result.error?.message || "The account could not be created."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(
        "Connection error",
        err.message || "The server is not responding right now."
      );
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
        Register a new admin account using the identification number provided
        with your purchase.
      </p>


      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Identification Number
        </label>
        <input
          type="text"
          name="customerIdentifierNumber"
          value={form.customerIdentifierNumber}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded-lg border px-4 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
          placeholder="ID-XXXXXXXXXXXX"
          autoComplete="off"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter the 12-digit ID number provided with your first device purchase.
        </p>
      </div>

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
