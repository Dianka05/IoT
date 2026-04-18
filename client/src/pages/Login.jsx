import LoginForm from "../components/Login/LoginForm";
import LoginFooter from "../components/Login/LoginFooter";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9] p-4">

      {/* Белая карточка */}
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 space-y-6">
        <LoginForm />
      </div>

      {/* Footer — ВНЕ карточки */}
      <div className="mt-4">
        <LoginFooter />
      </div>

    </div>
  );
}
