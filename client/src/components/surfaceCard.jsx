export default function SurfaceCard({
  as: Tag = 'div',
  className = '',
  children,
}) {
  return (
    <Tag className={`bg-white border rounded-xl border-slate-100 shadow-sm ${className}`.trim()}>
      {children}
    </Tag>
  );
}
