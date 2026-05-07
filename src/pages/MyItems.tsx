import { useMemo } from "react";
import { Plus, Sparkles, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { useDemoStore } from "@/hooks/useDemoStore";
import { CATALOG } from "@/lib/mockCatalog";
import { suggestSwap } from "@/lib/budgetEngine";
import { toast } from "sonner";

/** "My Items" — Walmart-style reorder list with Smart Repeat overlay. */
const MyItems = () => {
  const { state, addItemsToBasket } = useDemoStore();

  const items = useMemo(() => {
    const base = CATALOG.filter(c => c.tags?.includes("family-essentials") || c.onSale).slice(0, 8);
    return base;
  }, []);

  // Smart Repeat: count savings available across the usual basket using current sale prices
  const repeatBasket = useMemo(() => ({
    lines: items.map(item => ({ item, qty: 1 })),
    subtotal: items.reduce((n, i) => n + i.price, 0),
    savings: 0,
    budget: state.prefs.weeklyBudget,
    strategy: "healthiest" as const,
  }), [items, state.prefs.weeklyBudget]);

  const swapSuggestions = useMemo(() => {
    return repeatBasket.lines
      .map(l => ({ line: l, swap: suggestSwap(l, repeatBasket, CATALOG) }))
      .filter(s => s.swap)
      .slice(0, 5);
  }, [repeatBasket]);

  const dealSavings = +items.reduce((n, i) => n + (i.basePrice - i.price), 0).toFixed(2);

  const handleRepeatAll = () => {
    addItemsToBasket(items);
    toast.success("Smart Repeat: usual basket added with this week's deals");
  };

  return (
    <Screen title="My Items" subtitle="Reorder favorites">
      {/* Smart Repeat banner */}
      <Card className="bg-gradient-to-br from-walmart-blue to-walmart-blue-dark text-primary-foreground border-0">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Sparkles className="size-5 text-walmart-yellow mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold">Smart Repeat is on</p>
              <p className="text-xs text-white/85 mt-0.5">
                We found {swapSuggestions.length} ways to save about ${dealSavings.toFixed(2)} on your usual basket this week.
              </p>
            </div>
          </div>
          <Button
            onClick={handleRepeatAll}
            className="w-full bg-walmart-yellow text-walmart-blue-dark hover:bg-walmart-yellow/90 font-bold h-10"
          >
            Repeat with this week's deals
          </Button>
        </CardContent>
      </Card>

      {/* Reorder list */}
      <Card>
        <CardContent className="p-4 divide-y divide-border">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="size-10 rounded-md bg-secondary flex items-center justify-center text-sm font-semibold text-walmart-blue uppercase">
                {item.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.brand} · {item.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-walmart-blue">${item.price.toFixed(2)}</p>
                <button
                  onClick={() => {
                    addItemsToBasket([item]);
                    toast.success(`${item.name} added`);
                  }}
                  className="text-[11px] text-walmart-blue font-semibold flex items-center gap-1 ml-auto"
                >
                  <Plus className="size-3" /> Add
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Substitution suggestions */}
      {swapSuggestions.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="size-4 text-success" />
              <p className="text-sm font-semibold">Healthier or cheaper swaps</p>
            </div>
            {swapSuggestions.map(({ line, swap }) =>
              swap ? (
                <div key={line.item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="truncate"><span className="line-through text-muted-foreground">{line.item.name}</span></p>
                    <p className="font-semibold text-walmart-blue truncate">→ {swap.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px]"
                    onClick={() => {
                      addItemsToBasket([swap]);
                      toast.success(`Swapped to ${swap.name}`);
                    }}
                  >
                    Try
                  </Button>
                </div>
              ) : null,
            )}
          </CardContent>
        </Card>
      )}

      {!state.history.length && (
        <Card>
          <CardContent className="p-4 text-xs text-muted-foreground">
            These are demo essentials based on your household. Run the AI planner to personalize further.
          </CardContent>
        </Card>
      )}
    </Screen>
  );
};

export default MyItems;
