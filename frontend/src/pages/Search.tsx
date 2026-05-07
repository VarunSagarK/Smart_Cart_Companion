import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/Screen";
import { ProductCard } from "@/components/ProductCard";
import { CATALOG } from "@/lib/mockCatalog";
import { useDemoStore } from "@/hooks/useDemoStore";
import { toast } from "sonner";

const SearchPage = () => {
  const nav = useNavigate();
  const { addItemsToBasket } = useDemoStore();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = term
      ? CATALOG.filter(c => c.name.toLowerCase().includes(term) || c.brand?.toLowerCase().includes(term))
      : CATALOG;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [q]);

  const toggle = (id: string) =>
    setSelected(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleAdd = () => {
    const items = CATALOG.filter(c => selected.has(c.id));
    addItemsToBasket(items);
    toast.success(`${items.length} item${items.length === 1 ? "" : "s"} added to cart`);
    setSelected(new Set());
    nav("/basket");
  };

  return (
    <Screen title="Search" subtitle="Walmart catalog">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search items, brands…"
          className="pl-9"
        />
      </div>

      {selected.size > 0 && (
        <div className="sticky top-2 z-20 -mx-4 px-4 py-2 bg-walmart-blue text-primary-foreground flex items-center justify-between rounded-md mx-2 shadow-md">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <Button
            size="sm"
            onClick={handleAdd}
            className="bg-walmart-yellow text-walmart-blue-dark hover:bg-walmart-yellow/90 h-8 font-semibold"
          >
            <ShoppingCart className="size-3.5 mr-1" /> Add to cart
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {results.map(item => (
          <ProductCard
            key={item.id}
            item={item}
            selected={selected.has(item.id)}
            onToggle={toggle}
          />
        ))}
      </div>
      {!results.length && (
        <p className="text-sm text-muted-foreground text-center py-6">No items match "{q}".</p>
      )}
    </Screen>
  );
};

export default SearchPage;
