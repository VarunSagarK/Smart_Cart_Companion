import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { ProductCard } from "@/components/ProductCard";
import { CATALOG } from "@/lib/mockCatalog";
import { cn } from "@/lib/utils";

const DEPARTMENTS: {
  id: string;
  label: string;
  emoji: string;
  color: string;
  filter: (item: typeof CATALOG[0]) => boolean;
}[] = [
  {
    id: "grocery",
    label: "Grocery",
    emoji: "🛒",
    color: "bg-blue-50 border-blue-200",
    filter: i => ["produce","dairy","pantry","protein","beverages"].includes(i.category),
  },
  {
    id: "coupon-centre",
    label: "Coupon Centre",
    emoji: "🏷️",
    color: "bg-yellow-50 border-yellow-200",
    filter: i => i.onSale,
  },
  {
    id: "rollbacks",
    label: "Rollbacks & More",
    emoji: "💰",
    color: "bg-green-50 border-green-200",
    filter: i => i.onSale && i.basePrice > i.price,
  },
  {
    id: "outdoor",
    label: "Outdoor Living",
    emoji: "🌿",
    color: "bg-emerald-50 border-emerald-200",
    filter: () => false, // non-grocery placeholder
    placeholder: true,
  },
  {
    id: "trending",
    label: "New & Trending",
    emoji: "🔥",
    color: "bg-orange-50 border-orange-200",
    filter: i => i.healthScore >= 8 && !i.onSale,
  },
  {
    id: "get-it-fast",
    label: "Get It Fast",
    emoji: "⚡",
    color: "bg-amber-50 border-amber-200",
    filter: i => i.cuisines?.includes("quick-meals") ?? false,
  },
  {
    id: "everyday-low",
    label: "Everyday Low Prices",
    emoji: "🏷️",
    color: "bg-blue-50 border-blue-100",
    filter: i => i.price < 3,
  },
  {
    id: "clothing",
    label: "Clothing, Shoes & Accessories",
    emoji: "👗",
    color: "bg-pink-50 border-pink-200",
    filter: () => false,
    placeholder: true,
  },
  {
    id: "electronics",
    label: "Electronics",
    emoji: "📱",
    color: "bg-slate-50 border-slate-200",
    filter: () => false,
    placeholder: true,
  },
  {
    id: "toys",
    label: "Toys",
    emoji: "🧸",
    color: "bg-purple-50 border-purple-200",
    filter: () => false,
    placeholder: true,
  },
  {
    id: "snacks",
    label: "Snacks",
    emoji: "🍿",
    color: "bg-rose-50 border-rose-200",
    filter: i => i.category === "snacks",
  },
  {
    id: "health",
    label: "Health & Wellness",
    emoji: "💊",
    color: "bg-teal-50 border-teal-200",
    filter: i => i.healthScore >= 7,
  },
];

export default function Browse() {
  const nav = useNavigate();
  const [activeDept, setActiveDept] = useState<string | null>(null);

  const dept = DEPARTMENTS.find(d => d.id === activeDept);
  const filtered = useMemo(() => {
    if (!dept || (dept as { placeholder?: boolean }).placeholder) return [];
    return CATALOG.filter(dept.filter);
  }, [dept]);

  if (activeDept && dept) {
    return (
      <Screen title={dept.label} subtitle={`${filtered.length} items`}>
        <button
          onClick={() => setActiveDept(null)}
          className="flex items-center gap-1 text-sm text-walmart-blue font-semibold mb-1"
        >
          <ArrowLeft className="size-4" /> Browse Departments
        </button>

        {(dept as { placeholder?: boolean }).placeholder || filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
              <span className="text-5xl">{dept.emoji}</span>
              <p className="font-semibold text-lg">{dept.label}</p>
              <p className="text-sm text-muted-foreground">
                This department is coming soon to Smart Cart Companion.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(item => (
              <ProductCard key={item.id} item={item} showCheckbox={false} />
            ))}
          </div>
        )}
      </Screen>
    );
  }

  return (
    <Screen title="Browse" subtitle="Shop by department">
      <div className="grid grid-cols-2 gap-3">
        {DEPARTMENTS.map(d => (
          <button
            key={d.id}
            onClick={() => setActiveDept(d.id)}
            className={cn(
              "rounded-xl border p-4 flex flex-col items-start gap-2 text-left transition hover:opacity-80 active:scale-95",
              d.color,
            )}
          >
            <span className="text-3xl">{d.emoji}</span>
            <div className="flex items-center justify-between w-full">
              <p className="text-xs font-semibold leading-tight flex-1">{d.label}</p>
              <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </Screen>
  );
}
