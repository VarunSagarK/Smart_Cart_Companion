import { useMemo } from "react";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { useDemoStore } from "@/hooks/useDemoStore";
import { CATALOG } from "@/lib/mockCatalog";

/** "My Items" — recurring items from past purchases, Walmart-style reorder list. */
const MyItems = () => {
  const { state } = useDemoStore();

  const ids = useMemo(() => {
    // Demo: derive from preferences favoring family essentials & on-sale
    const base = CATALOG.filter(c => c.tags?.includes("family-essentials") || c.onSale).slice(0, 8);
    return base;
  }, []);

  return (
    <Screen title="My Items" subtitle="Reorder favorites">
      {!state.history.length && (
        <Card>
          <CardContent className="p-4 text-xs text-muted-foreground">
            These are demo essentials based on your household. Run the AI planner to personalize.
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="p-4 divide-y divide-border">
          {ids.map(item => (
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
                <button className="text-[11px] text-walmart-blue font-semibold flex items-center gap-1">
                  <Heart className="size-3" /> Reorder
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </Screen>
  );
};

export default MyItems;
