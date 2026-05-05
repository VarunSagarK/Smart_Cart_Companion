import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  title?: string;
  back?: boolean;
  subtitle?: string;
}

export const WalmartHeader = ({ title, back, subtitle }: Props) => {
  const nav = useNavigate();
  return (
    <header className="bg-walmart-blue text-primary-foreground">
      <div className="px-4 pt-5 pb-4 flex items-center gap-3">
        {back ? (
          <button
            onClick={() => nav(-1)}
            aria-label="Back"
            className="p-1 -ml-1 rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <div className="size-8 rounded-full bg-walmart-yellow flex items-center justify-center">
            <Sparkles className="size-4 text-walmart-blue-dark" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-lg font-bold leading-tight">{title ?? "Walmart AI"}</h1>
          {subtitle && <p className="text-xs text-white/80">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
};
