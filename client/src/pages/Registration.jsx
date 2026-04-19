import RegistrationForm from "../components/Registration/RegistrationForm";
import RegistrationFooter from "../components/Registration/RegistrationFooter";

export default function Registration() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9] p-4">

      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 space-y-6">
        <RegistrationForm />
      </div>

      <div className="mt-4">
        <RegistrationFooter />
      </div>

    </div>
  );
}
