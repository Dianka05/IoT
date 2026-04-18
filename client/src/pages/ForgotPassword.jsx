import ForgotForm from "../components/ForgotPassword/ForgotForm";
import ForgotFooter from "../components/ForgotPassword/ForgotFooter";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9] p-4">

      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 space-y-6">
        <ForgotForm />
      </div>

      <div className="mt-4">
        <ForgotFooter />
      </div>

    </div>
  );
}
