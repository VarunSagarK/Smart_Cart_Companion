import { useMemo, useState } from "react";
import { Plus, Heart, Sparkles, TrendingDown, ShoppingBag, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { useStore } from "@/contexts/DemoStoreContext";
import { CATALOG } from "@/lib/mockCatalog";
import { suggestSwap } from "@/lib/budgetEngine";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMOJI: Record<string, string> = {
  produce: "🥬",
  dairy: "🥛",
  pantry: "🥫",
  snacks: "🍿",
  beverages: "🥤",
  protein: "🍗",
};

type Tab = "reorder" | "favorites";

const MyItems = () => {
  const { state, addItemsToBasket, toggleWishlist } = useStore();
  const [tab, setTab] = useState<Tab>("reorder");

  // Reorder tab: usual essentials from catalog
  const reorderItems = useMemo(() => {
    return CATALOG.filter(c => c.tags?.includes("family-essentials") || c.onSale).slice(0, 10);
  }, []);

  // Favorites tab: wishlisted items
  const favoriteItems = useMemo(() => {
    return CATALOG.filter(c => state.wishlist.includes(c.id));
  }, [state.wishlist]);

  // Smart Repeat logic
  const repeatBasket = useMemo(() => ({
    lines: reorderItems.map(item => ({ item, qty: 1 })),
    subtotal: reorderItems.reduce((n, i) => n + i.price, 0),
    savings: 0,
    budget: state.prefs.weeklyBudget,
    strategy: "healthiest" as const,
  }), [reorderItems, state.prefs.weeklyBudget]);

  const swapSuggestions = useMemo(() => {
    return repeatBasket.lines
      .map(l => ({ line: l, swap: suggestSwap(l, repeatBasket, CATALOG) }))
      .filter(s => s.swap)
      .slice(0, 4);
  }, [repeatBasket]);

  const dealSavings = +reorderItems.reduce((n, i) => n + (i.basePrice - i.price), 0).toFixed(2);

  const handleRepeatAll = () => {
    addItemsToBasket(reorderItems);
    toast.success("Smart Repeat: usual basket added with this week's deals");
  };

  return (
    <Screen title="My Items" subtitle="Reorder & favorites">
      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1">
        {(["reorder", "favorites"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 rounded-md text-xs font-semibold capitalize transition",
              tab === t ? "bg-background shadow-sm text-walmart-blue-dark" : "text-muted-foreground",
            )}
          >
            {t === "reorder" ? "Reorder" : `Favorites${state.wishlist.length ? ` (${state.wishlist.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* ── Reorder Tab ─────────────────────────────────────────────────── */}
      {tab === "reorder" && (
        <>
          {/* Smart Repeat banner */}
          <Card className="bg-gradient-to-br from-walmart-blue to-walmart-blue-dark text-primary-foreground border-0">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Sparkles className="size-5 text-walmart-yellow mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold">Smart Repeat is on</p>
                  <p className="text-xs text-white/85 mt-0.5">
                    {swapSuggestions.length} swap{swapSuggestions.length !== 1 ? "s" : ""} available · save ~${dealSavings.toFixed(2)} this week
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRepeatAll}
                className="w-full bg-walmart-yellow text-walmart-blue-dark hover:bg-walmart-yellow/90 font-bold h-10"
              >
                <RefreshCw className="size-4 mr-1" /> Repeat with this week's deals
              </Button>
            </CardContent>
          </Card>

          {/* Item list */}
          <Card>
            <CardContent className="p-4 divide-y divide-border">
              {reorderItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="size-10 rounded-md bg-secondary flex items-center justify-center text-xl shrink-0">
                    {EMOJI[item.category] ?? "🛒"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.brand} · {item.unit}</p>
                    {item.onSale && (
                      <p className="text-[11px] text-green-600 font-semibold">
                        Save ${(item.basePrice - item.price).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-walmart-blue">${item.price.toFixed(2)}</p>
                    <button
                      onClick={() => { addItemsToBasket([item]); toast.success(`${item.name} added`); }}
                      className="text-[11px] text-walmart-blue font-semibold flex items-center gap-1 ml-auto mt-0.5"
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
                      <div className="min-w-0 flex-1">
                        <p className="truncate"><span className="line-through text-muted-foreground">{line.item.name}</span></p>
                        <p className="font-semibold text-walmart-blue truncate">→ {swap.name}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] shrink-0"
                        onClick={() => { addItemsToBasket([swap]); toast.success(`Swapped to ${swap.name}`); }}
                      >
                        Try
                      </Button>
                    </div>
                  ) : null,
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ── Favorites Tab ────────────────────────────────────────────────── */}
      {tab === "favorites" && (
        <>
          {favoriteItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 flex flex-col items-center text-center gap-3">
                <Heart className="size-10 text-muted-foreground/30" />
                <p className="text-sm font-semibold">No favorites yet</p>
                <p className="text-xs text-muted-foreground">
                  Tap the ♥ on any product card to save it here.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast("Browse products in the AI Planner or Search to favorite items")}
                >
                  <ShoppingBag className="size-3.5 mr-1" /> Browse products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{favoriteItems.length} saved item{favoriteItems.length !== 1 ? "s" : ""}</p>
                <button
                  onClick={() => { addItemsToBasket(favoriteItems); toast.success("All favorites added to cart"); }}
                  className="text-xs font-semibold text-walmart-blue"
                >
                  Add all to cart
                </button>
              </div>
              <Card>
                <CardContent className="p-4 divide-y divide-border">
                  {favoriteItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="size-10 rounded-md bg-secondary flex items-center justify-center text-xl shrink-0">
                        {EMOJI[item.category] ?? "🛒"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.brand} · {item.unit}</p>
                        {item.onSale && (
                          <p className="text-[11px] text-green-600 font-semibold">
                            Save ${(item.basePrice - item.price).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <p className="text-sm font-bold text-walmart-blue">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { toggleWishlist(item.id); toast("Removed from favorites"); }}
                            className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1"
                          >
                            <Heart className="size-3 fill-destructive text-destructive" />
                          </button>
                          <button
                            onClick={() => { addItemsToBasket([item]); toast.success(`${item.name} added`); }}
                            className="text-[11px] text-walmart-blue font-semibold flex items-center gap-1"
                          >
                            <Plus className="size-3" /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </Screen>
  );
};

export default MyItems;
