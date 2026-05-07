import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Screen } from "@/components/Screen";
import { ProductCard } from "@/components/ProductCard";
import { useDemoStore } from "@/hooks/useDemoStore";
import { buildAllStrategies, STRATEGY_META } from "@/lib/budgetEngine";
import { CATALOG } from "@/lib/mockCatalog";
import { BasketStrategy } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Results = () => {
  const nav = useNavigate();
  const { state, addItemsToBasket } = useDemoStore();

  const allBaskets = useMemo(() => buildAllStrategies(state.prefs, CATALOG), [state.prefs]);
  const [strategy, setStrategy] = useState<BasketStrategy>(state.basket?.strategy ?? "healthiest");
  const basket = allBaskets[strategy];

  const sortedLines = useMemo(
    () => [...basket.lines].sort((a, b) => a.item.name.localeCompare(b.item.name)),
    [basket],
  );

  const [selected, setSelected] = useState<Set<string>>(() => new Set(basket.lines.map(l => l.item.id)));

  // When strategy changes, default-select all items in the new basket
  useEffect(() => {
    setSelected(new Set(basket.lines.map(l => l.item.id)));
  }, [strategy]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: string) =>
    setSelected(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectedLines = sortedLines.filter(l => selected.has(l.item.id));
  const subtotal = +selectedLines.reduce((n, l) => n + l.item.price * l.qty, 0).toFixed(2);
  const savings = +selectedLines.reduce((n, l) => n + (l.item.basePrice - l.item.price) * l.qty, 0).toFixed(2);
  const pct = Math.min(100, (subtotal / basket.budget) * 100);

  const handleAddToCart = () => {
    if (!selectedLines.length) {
      toast("Select at least one item to add to cart.");
      return;
    }
    addItemsToBasket(selectedLines.map(l => l.item));
    toast.success(`${selectedLines.length} items added to Walmart cart`);
    nav("/basket");
  };

  return (
    <Screen title="Your AI Basket" back subtitle={STRATEGY_META[strategy].tagline}>
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {(Object.keys(STRATEGY_META) as BasketStrategy[]).map(s => (
          <button
            key={s}
            onClick={() => setStrategy(s)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition",
              strategy === s
                ? "bg-walmart-blue text-primary-foreground border-walmart-blue"
                : "bg-background border-border text-foreground",
            )}
          >
            {STRATEGY_META[s].label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Selected subtotal</span>
            <span className="text-2xl font-bold text-walmart-blue">${subtotal.toFixed(2)}</span>
          </div>
          <Progress value={pct} className="h-2" />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Budget ${basket.budget}</span>
            <span className="text-success font-semibold">You save ${savings.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
            <Sparkles className="size-3 text-walmart-blue" />
            {selected.size} of {sortedLines.length} selected · tap a card to toggle
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        {sortedLines.map(l => (
          <ProductCard
            key={l.item.id}
            item={l.item}
            selected={selected.has(l.item.id)}
            onToggle={toggle}
          />
        ))}
      </div>

      <Button
        onClick={handleAddToCart}
        className="w-full bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground h-12 text-base font-semibold sticky bottom-2"
      >
        <ShoppingCart className="size-4 mr-2" />
        Add {selected.size} to Walmart cart
      </Button>
    </Screen>
  );
};

export default Results;
