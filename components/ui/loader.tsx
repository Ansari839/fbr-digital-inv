import { Loader2 } from "lucide-react";

export function Loader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-[#1a7368] mb-3 opacity-80" />
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}
