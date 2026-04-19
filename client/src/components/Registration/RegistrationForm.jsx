import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistrationForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (form.password !== form.confirm) {
      alert("Passwords do not match");
      return;
    }

    alert("Account created successfully");
  };

  return (
    <div className="space-y-4">

      <h2 className="text-xl font-semibold text-gray-800 text-center">
        Create an account
      </h2>

      <p className="text-sm text-gray-600 text-center">
        Fill in your details to register.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-2 rounded-lg font-medium transition"
      >
        Register
      </button>

      <div className="text-center">
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-gray-600 hover:text-gray-800 active:text-gray-900 transition"
        >
          Back to login
        </button>
      </div>

    </div>
  );
}
