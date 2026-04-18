import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  return (
    <div className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      <button
        className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-2 rounded-lg font-medium transition"
      >
        Login
      </button>

      {/* Forgot password */}
      <div className="text-center">
        <button
          onClick={() => navigate("/forgot-password")}
          className="text-sm text-gray-600 hover:text-gray-800 active:text-gray-900 transition"
        >
          Forgot password?
        </button>
      </div>

      {/* Register */}
      <div className="text-center">
        <button
          onClick={() => navigate("/register")}
          className="text-sm text-gray-600 hover:text-gray-800 active:text-gray-900 transition"
        >
          Register
        </button>
      </div>

      {/* STATUS — внутри формы */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-2">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        All systems operational
      </div>

    </div>
  );
}
