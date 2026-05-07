import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ALL_BRANDS } from "@/lib/mockCatalog";
import { cn } from "@/lib/utils";

interface Props {
  selected: string[];
  onChange: (next: string[]) => void;
}

/**
 * Walmart-light multi-select for preferred brands.
 * - Searchable
 * - Chip toggling
 * - Selected chips pinned to the top, scrollable list below
 */
export const BrandMultiSelect = ({ selected, onChange }: Props) => {
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = term ? ALL_BRANDS.filter(b => b.toLowerCase().includes(term)) : ALL_BRANDS;
    // Already alphabetical from source.
    return list;
  }, [q]);

  const toggle = (b: string) =>
    onChange(selected.includes(b) ? selected.filter(x => x !== b) : [...selected, b]);

  const clearAll = () => onChange([]);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs text-muted-foreground">Preferred brands (optional)</Label>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] text-walmart-blue font-semibold hover:text-walmart-blue-dark"
          >
            Clear all
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-secondary/40 p-2">
          {selected.map(b => (
            <button
              key={b}
              type="button"
              onClick={() => toggle(b)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-walmart-blue text-primary-foreground text-[11px] font-semibold"
            >
              {b}
              <X className="size-3" />
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search brands…"
          className="pl-9 h-9 text-sm"
        />
      </div>

      <div className="max-h-48 overflow-y-auto rounded-lg border border-border p-2 flex flex-wrap gap-1.5 bg-card">
        {visible.length === 0 ? (
          <p className="text-xs text-muted-foreground p-2">No brands match "{q}".</p>
        ) : (
          visible.map(b => {
            const active = selected.includes(b);
            return (
              <button
                key={b}
                type="button"
                onClick={() => toggle(b)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                  active
                    ? "bg-walmart-blue text-primary-foreground border-walmart-blue"
                    : "bg-background text-foreground border-border hover:bg-secondary",
                )}
              >
                {b}
              </button>
            );
          })
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {selected.length === 0
          ? `Pick any to favor in your basket. ${ALL_BRANDS.length} brands available.`
          : `${selected.length} selected · we'll prioritize these in your AI basket.`}
      </p>
    </div>
  );
};
