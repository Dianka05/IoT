
import { twMerge } from './../../node_modules/tailwind-merge/src/lib/tw-merge';
export default function SurfaceCard({
  as: Tag = 'div',
  className = '',
  children,
}) {
  return (
    <Tag className={twMerge(
      'bg-white border rounded border-slate-100 shadow-sm',
        className
    )}>
      {children}
     </Tag>
  );
}
