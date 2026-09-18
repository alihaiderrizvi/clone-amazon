export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-gray-500 border-t">
        <p>© {new Date().getFullYear()} Amazon Clone. This is a demo project.</p>
      </footer>
    </div>
  );
}
