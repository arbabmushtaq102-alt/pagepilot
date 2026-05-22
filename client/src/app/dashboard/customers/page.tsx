export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Customers CRM</h1>
        <p className="text-textMuted mt-1">View and manage your audience data.</p>
      </header>
      
      <div className="glass rounded-2xl p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border text-textMuted">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Last Contact</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-4 font-semibold">Alice Smith</td>
              <td className="py-4"><span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">Active Lead</span></td>
              <td className="py-4 text-textMuted">Just now</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-4 font-semibold">John Doe</td>
              <td className="py-4"><span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs">Customer</span></td>
              <td className="py-4 text-textMuted">2m ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
