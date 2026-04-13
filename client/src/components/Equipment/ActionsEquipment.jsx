import { XCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ActionsEquipment({ user, onSave }) {
  const [discardPressed, setDiscardPressed] = useState(false);
  const [savePressed, setSavePressed] = useState(false);

  if (!user) return null;

  const handleDiscard = () => {
    setDiscardPressed(true);
    setTimeout(() => setDiscardPressed(false), 200);
  };

  const handleSave = () => {
    setSavePressed(true);
    onSave?.();
    setTimeout(() => setSavePressed(false), 200);
  };

  return (
    <div className="flex items-center justify-between mb-6 w-full">

      <p className="text-lg font-semibold text-slate-700">
        Configuring access profile for{" "}
        <span className="font-bold text-orange-600">{user.name}</span>
      </p>

      <div className="flex items-center gap-3">

        <button
          onClick={handleDiscard}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            border border-slate-200
            ${discardPressed
              ? "bg-slate-300 text-slate-900 shadow-lg shadow-slate-400/50"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }
          `}
        >
          <XCircle size={18} className={discardPressed ? "animate-spin" : ""} />
          Discard
        </button>

        <button
          onClick={handleSave}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            border border-slate-200
            ${savePressed
              ? "bg-slate-300 text-slate-900 shadow-lg shadow-slate-400/50"
              : "bg-orange-500 text-white hover:bg-orange-600"
            }
          `}
        >
          <CheckCircle size={18} className={savePressed ? "animate-spin" : ""} />
          Save Changes
        </button>

      </div>

    </div>
  );
}
