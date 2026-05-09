const TONE_CLASSES = {
  error: 'border-red-200 bg-red-50 text-red-700',
  neutral: 'border-slate-200 bg-white text-slate-600',
};

export default function StatusBanner({ tone = 'neutral', className = '', children }) {
  const toneClasses = TONE_CLASSES[tone] || TONE_CLASSES.neutral;

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${toneClasses} ${className}`.trim()}>
      {children}
    </div>
  );
}
