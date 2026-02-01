export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary">AR Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Authorized Representative Portal
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
