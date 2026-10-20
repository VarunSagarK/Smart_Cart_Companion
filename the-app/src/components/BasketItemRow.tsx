import { Minus, Plus, Trash2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BasketLine } from "@/lib/types";

interface Props {
  line: BasketLine;
  onRemove?: (id: string) => void;
  onQtyChange?: (id: string, qty: number) => void;
}

export const BasketItemRow = ({ line, onRemove, onQtyChange }: Props) => {
  const { item, qty, appliedDeal } = line;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="size-10 rounded-md bg-secondary flex items-center justify-center text-sm font-semibold text-walmart-blue uppercase shrink-0">
        {item.name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.unit}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {appliedDeal && (
            <Badge className="bg-walmart-yellow text-walmart-blue-dark hover:bg-walmart-yellow gap-1 text-[10px] px-1.5 py-0">
              <Tag className="size-2.5" /> {appliedDeal.label}
            </Badge>
          )}
          {item.healthScore >= 8 && (
            <Badge variant="secondary" className="text-success text-[10px] px-1.5 py-0">Healthy</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <p className="font-semibold text-sm text-walmart-blue">${(item.price * qty).toFixed(2)}</p>

        {/* Qty stepper */}
        {onQtyChange && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => qty === 1 ? onRemove?.(item.id) : onQtyChange(item.id, qty - 1)}
              className="size-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition"
              aria-label="Decrease quantity"
            >
              {qty === 1
                ? <Trash2 className="size-3 text-destructive" />
                : <Minus className="size-3" />
              }
            </button>
            <span className="text-xs font-bold w-5 text-center">{qty}</span>
            <button
              onClick={() => onQtyChange(item.id, qty + 1)}
              className="size-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition"
              aria-label="Increase quantity"
            >
              <Plus className="size-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
