import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] w-full animate-in fade-in duration-300">
      <div className="w-16 h-16 relative flex items-center justify-center mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-[spin_3s_linear_infinite]" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin" />
        <Loader2 className="w-6 h-6 text-primary absolute animate-pulse" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Loading Workspace...</h3>
      <p className="text-sm text-textMuted font-medium">Please wait while we sync your data</p>
    </div>
  );
}
