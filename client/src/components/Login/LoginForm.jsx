import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth"; 

export default function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await login(form.email, form.password);

      if (result.success) {
        alert("Login successful!");
        navigate("/dashboard"); 
      } else {
        alert(result.error?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Connection error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 text-center">Login</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition disabled:bg-orange-300"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="text-center">
        <button onClick={() => navigate("/register")} className="text-sm text-gray-600 underline">
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
}