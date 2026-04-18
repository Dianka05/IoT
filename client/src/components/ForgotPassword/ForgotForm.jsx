import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    alert("If this email exists, a reset link has been sent.");
  };

  return (
    <div className="space-y-4">

      <h2 className="text-xl font-semibold text-gray-800 text-center">
        Reset your password
      </h2>

      <p className="text-sm text-gray-600 text-center">
        Enter your email and we will send you a reset link.
      </p>

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

      <button
        onClick={handleSubmit}
        className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-2 rounded-lg font-medium transition"
      >
        Send reset link
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
