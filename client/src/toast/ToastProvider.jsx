import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-500",
  },
  error: {
    icon: AlertCircle,
    iconClassName: "text-orange-500",
  },
  info: {
    icon: Info,
    iconClassName: "text-sky-400",
  },
};

function ToastItem({ toast, onDismiss }) {
  const style = TOAST_STYLES[toast.tone] || TOAST_STYLES.info;
  const Icon = style.icon;

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700 bg-[#10192b] text-white shadow-2xl">
      <div className="flex items-start gap-4 px-5 py-4">
        <div className="mt-0.5 shrink-0 rounded-full bg-white/5 p-1.5">
          <Icon size={22} className={style.iconClassName} />
        </div>

        <div className="min-w-0 flex-1">
          {toast.title && (
            <p className="truncate text-base font-bold text-white">
              {toast.title}
            </p>
          )}
          {toast.message && (
            <p className="mt-1 text-sm leading-6 text-slate-200">
              {toast.message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((input) => {
    const toast = {
      id: createToastId(),
      tone: input?.tone || "info",
      title: input?.title || "",
      message: input?.message || "",
      duration: Number(input?.duration || 4000),
    };

    setToasts((current) => [...current, toast]);

    if (toast.duration > 0) {
      window.setTimeout(() => {
        dismissToast(toast.id);
      }, toast.duration);
    }

    return toast.id;
  }, [dismissToast]);

  const api = useMemo(() => ({
    showToast,
    success(title, message, duration) {
      return showToast({ tone: "success", title, message, duration });
    },
    error(title, message, duration) {
      return showToast({ tone: "error", title, message, duration });
    },
    info(title, message, duration) {
      return showToast({ tone: "info", title, message, duration });
    },
    dismissToast,
  }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
        <div className="pointer-events-auto flex w-full max-w-2xl flex-col gap-3">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={dismissToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
