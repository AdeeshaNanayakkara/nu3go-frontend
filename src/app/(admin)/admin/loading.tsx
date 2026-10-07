export default function AdminDashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-1/3 rounded bg-muted" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
