import { Loader2 } from 'lucide-react';

export const GlobalLoader = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/50">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
        Loading your experience...
      </p>
    </div>
  );
};
