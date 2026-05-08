import Sidebar from './sidebar';

export default function PageShell({
  sidebarOpen,
  setSidebarOpen,
  children,
  shellClassName = 'flex min-h-screen h-screen bg-[#f8fafc] overflow-hidden',
  mainClassName = 'flex-1 p-4 md:p-8 overflow-y-auto',
  contentClassName = 'max-w-[1400px] mx-auto',
  sidebarProps = {},
}) {
  return (
    <div className={shellClassName}>
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        {...sidebarProps}
      />

      <main className={mainClassName}>
        {contentClassName ? (
          <div className={contentClassName}>
            {children}
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
