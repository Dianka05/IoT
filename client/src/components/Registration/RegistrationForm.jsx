import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/auth"; // Путь к твоему файлу auth.js

export default function RegistrationForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // 1. Валидация совпадения паролей
    if (form.password !== form.confirm) {
      alert("Passwords do not match");
      return;
    }

    // 2. Валидация заполнения полей
    if (!form.email || !form.password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // 3. Отправка данных на бэкенд
      // Передаем email и password. Третий аргумент (name) опционален.
      const result = await register(form.email, form.password);

      if (result.success) {
        alert("Account created successfully");
        // После успешной регистрации перенаправляем на логин или главную
        navigate("/login");
      } else {
        // Выводим ошибку из объекта, который прислал твой бэкенд
        alert(result.error?.message || "Registration failed");
      }
    } catch (err) {
      // Обработка сетевых ошибок (если бэкенд недоступен)
      console.error("Registration error:", err);
      alert("Server is not responding. Please try again later.");
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none disabled:bg-gray-100"
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
          disabled={loading}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none disabled:bg-gray-100"
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
          disabled={loading}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none disabled:bg-gray-100"
          placeholder="••••••••"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full text-white py-2 rounded-lg font-medium transition ${
          loading 
            ? "bg-orange-300 cursor-not-allowed" 
            : "bg-orange-500 hover:bg-orange-600 active:bg-orange-700"
        }`}
      >
        {loading ? "Registering..." : "Register"}
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