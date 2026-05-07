import { useMemo, useState } from "react";
import { Heart, Plus, Sparkles, ShoppingCart, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { ProductImage } from "@/components/ProductImage";
import { useDemoStore } from "@/hooks/useDemoStore";
import { CATALOG } from "@/lib/mockCatalog";
import { suggestSwap } from "@/lib/budgetEngine";
import { CatalogItem } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "reorder" | "wishlist";

const TABS: { id: Tab; label: string }[] = [
  { id: "reorder", label: "Reorder" },
  { id: "wishlist", label: "Favorites" },
];

/** "My Items" — Walmart-style two-tab layout: Reorder | Favorites. */
const MyItems = () => {
  const { state, addItemsToBasket, toggleWishlist } = useDemoStore();
  const [tab, setTab] = useState<Tab>("reorder");

  // Reorder list — alphabetical by name
  const reorderItems = useMemo<CatalogItem[]>(() => {
    return CATALOG
      .filter(c => c.tags?.includes("family-essentials") || c.onSale)
      .slice(0, 8)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const wishlistItems = useMemo<CatalogItem[]>(
    () =>
      CATALOG.filter(c => state.wishlist.includes(c.id)).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [state.wishlist],
  );

  // Smart Repeat data
  const repeatBasket = useMemo(
    () => ({
      lines: reorderItems.map(item => ({ item, qty: 1 })),
      subtotal: reorderItems.reduce((n, i) => n + i.price, 0),
      savings: 0,
      budget: state.prefs.weeklyBudget,
      strategy: "healthiest" as const,
    }),
    [reorderItems, state.prefs.weeklyBudget],
  );

  const swapSuggestions = useMemo(
    () =>
      repeatBasket.lines
        .map(l => ({ line: l, swap: suggestSwap(l, repeatBasket, CATALOG) }))
        .filter(s => s.swap)
        .slice(0, 5),
    [repeatBasket],
  );

  const dealSavings = +reorderItems.reduce((n, i) => n + (i.basePrice - i.price), 0).toFixed(2);

  const handleRepeatAll = () => {
    addItemsToBasket(reorderItems);
    toast.success("Smart Repeat: usual basket added with this week's deals");
  };

  const handleAddOne = (item: CatalogItem) => {
    addItemsToBasket([item]);
    toast.success(`${item.name} added`);
  };

  const handleAddAllFavorites = () => {
    if (!wishlistItems.length) return;
    addItemsToBasket(wishlistItems);
    toast.success(`${wishlistItems.length} favorites added to cart`);
  };

  return (
    <Screen title="My Items" subtitle={tab === "wishlist" ? "Favorites" : "Reorder favorites"}>
      {/* Walmart-style segmented tab bar */}
      <div className="flex bg-secondary rounded-lg p-1 gap-1">
        {TABS.map(t => {
          const active = tab === t.id;
          const count = t.id === "wishlist" ? wishlistItems.length : reorderItems.length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-9 rounded-md text-sm font-semibold transition",
                active
                  ? "bg-background text-walmart-blue-dark shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "min-w-[20px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center",
                  active ? "bg-walmart-blue text-primary-foreground" : "bg-background text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {tab === "reorder" && (
        <>
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
              {reorderItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <ProductImage item={item} className="size-12 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.brand} · {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-walmart-blue">${item.price.toFixed(2)}</p>
                    <button
                      onClick={() => handleAddOne(item)}
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
                        <p className="truncate">
                          <span className="line-through text-muted-foreground">{line.item.name}</span>
                        </p>
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
        </>
      )}

      {tab === "wishlist" && (
        <>
          {wishlistItems.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center space-y-2">
                <Heart className="size-10 text-muted-foreground/40 mx-auto" />
                <p className="text-sm font-semibold">No favorites yet</p>
                <p className="text-xs text-muted-foreground">
                  Tap the ❤️ on any product to save it for later. Your saved items will show up here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Button
                onClick={handleAddAllFavorites}
                className="w-full bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground h-10 font-semibold"
              >
                <ShoppingCart className="size-4 mr-2" />
                Add all {wishlistItems.length} to cart
              </Button>

              <Card>
                <CardContent className="p-4 divide-y divide-border">
                  {wishlistItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <ProductImage item={item} className="size-12 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.brand} · {item.unit}</p>
                        <p className="text-sm font-bold text-walmart-blue mt-0.5">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleAddOne(item)}
                          aria-label="Add to cart"
                          className="size-8 rounded-full bg-walmart-blue text-primary-foreground flex items-center justify-center hover:bg-walmart-blue-dark transition"
                        >
                          <Plus className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            toggleWishlist(item.id);
                            toast(`Removed ${item.name} from favorites`);
                          }}
                          aria-label="Remove from favorites"
                          className="size-8 rounded-full border border-border bg-background flex items-center justify-center text-destructive hover:bg-destructive/10 transition"
                        >
                          <Heart className="size-4 fill-destructive" />
                        </button>
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
