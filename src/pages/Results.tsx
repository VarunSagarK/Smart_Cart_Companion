import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, ShoppingCart, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Screen } from "@/components/Screen";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/contexts/DemoStoreContext";
import {
  applyResultFilter,
  buildAllStrategies,
  RESULT_FILTERS,
  STRATEGY_META,
} from "@/lib/budgetEngine";
import { CATALOG } from "@/lib/mockCatalog";
import { BasketStrategy, Preferences, ResultFilter } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Results = () => {
  const nav = useNavigate();
  const location = useLocation();
  const { state, addItemsToBasket, clearBasket } = useStore();

  // AIOnboarding passes the freshly-submitted prefs via location state so we
  // don't depend on React state having flushed yet. Fall back to store prefs.
  const prefs: Preferences = (location.state as { prefs?: Preferences })?.prefs ?? state.prefs;

  const allBaskets = useMemo(() => buildAllStrategies(prefs, CATALOG), [prefs]);

  const initialStrategy: BasketStrategy =
    (location.state as { strategy?: BasketStrategy })?.strategy ?? state.basket?.strategy ?? "healthiest";

  const [strategy, setStrategy] = useState<BasketStrategy>(initialStrategy);
  const [filter, setFilter] = useState<ResultFilter>("all");
  const basket = allBaskets[strategy];

  const filteredLines = useMemo(
    () => applyResultFilter(basket.lines, filter).sort((a, b) => a.item.name.localeCompare(b.item.name)),
    [basket, filter],
  );

  // Start with nothing selected
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  // Reset to empty selection when strategy changes
  useEffect(() => {
    setSelected(new Set());
  }, [strategy]);

  const toggle = (id: string) =>
    setSelected(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allFilteredIds = filteredLines.map(l => l.item.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selected.has(id));

  const selectAll = () => setSelected(new Set(allFilteredIds));
  const deselectAll = () => setSelected(new Set());

  const selectedLines = filteredLines.filter(l => selected.has(l.item.id));
  const subtotal = +selectedLines.reduce((n, l) => n + l.item.price * l.qty, 0).toFixed(2);
  const savings = +selectedLines.reduce((n, l) => n + (l.item.basePrice - l.item.price) * l.qty, 0).toFixed(2);
  const pct = Math.min(100, (subtotal / basket.budget) * 100);

  const handleAddToCart = () => {
    if (!selectedLines.length) {
      toast("Select at least one item to add to cart.");
      return;
    }
    addItemsToBasket(
      [],
      undefined,
      selectedLines.map(l => ({ item: l.item, weekIndex: l.weekIndex })),
    );
    toast.success(`${selectedLines.length} items added to cart`);
    nav("/basket");
  };

  return (
    <Screen title="Your AI Basket" back subtitle={STRATEGY_META[strategy].tagline}>

      {/* Strategy chips */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 no-scrollbar">
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

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 no-scrollbar">
        {RESULT_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition",
              filter === f.id
                ? "bg-walmart-blue-dark text-primary-foreground border-walmart-blue-dark"
                : "bg-secondary border-transparent text-foreground/70",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Budget summary */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Selected subtotal</span>
            <span className="text-2xl font-bold text-walmart-blue">${subtotal.toFixed(2)}</span>
          </div>
          <Progress value={pct} className="h-2" />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Budget ${basket.budget.toFixed(2)}</span>
            <span className="text-green-600 font-semibold">You save ${savings.toFixed(2)}</span>
          </div>
          {/* Select / Deselect all */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="size-3 text-walmart-blue" />
              {selected.size} of {filteredLines.length} selected · tap to toggle
            </div>
            <button
              onClick={allSelected ? deselectAll : selectAll}
              className="text-xs font-semibold text-walmart-blue hover:text-walmart-blue-dark transition"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-2">
        {filteredLines.map(l => (
          <ProductCard
            key={l.item.id}
            item={l.item}
            selected={selected.has(l.item.id)}
            onToggle={toggle}
          />
        ))}
      </div>

      {!filteredLines.length && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No items match this filter. Try another.
        </p>
      )}

      <Button
        onClick={handleAddToCart}
        disabled={!selectedLines.length}
        className="w-full bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground h-12 text-base font-semibold shadow-lg"
      >
        <ShoppingCart className="size-4 mr-2" />
        {selectedLines.length ? `Add ${selectedLines.length} to cart` : "Select items to add"}
      </Button>

      <Button
        onClick={() => { clearBasket(); nav("/ai", { state: { restart: true }, replace: true }); }}
        variant="outline"
        className="w-full h-12 text-base font-semibold border-destructive text-destructive hover:bg-destructive/10"
      >
        <RotateCcw className="size-4 mr-2" />
        Reset — start over
      </Button>
    </Screen>
  );
};

export default Results;
