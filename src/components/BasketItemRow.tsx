import { Repeat, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BasketLine } from "@/lib/types";

interface Props {
  line: BasketLine;
  onSwap?: () => void;
}

export const BasketItemRow = ({ line, onSwap }: Props) => {
  const { item, qty, appliedDeal } = line;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="size-10 rounded-md bg-secondary flex items-center justify-center text-sm font-semibold text-walmart-blue uppercase">
        {item.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.unit} · qty {qty}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {appliedDeal && (
            <Badge className="bg-walmart-yellow text-walmart-blue-dark hover:bg-walmart-yellow gap-1">
              <Tag className="size-3" /> {appliedDeal.label}
            </Badge>
          )}
          {item.healthScore >= 8 && (
            <Badge variant="secondary" className="text-success">Healthy</Badge>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold text-sm">${(item.price * qty).toFixed(2)}</p>
        {onSwap && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-walmart-blue"
            onClick={onSwap}
          >
            <Repeat className="size-3 mr-1" /> Swap
          </Button>
        )}
      </div>
    </div>
  );
};
