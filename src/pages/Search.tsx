import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { CATALOG } from "@/lib/mockCatalog";

const SearchPage = () => {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = term
      ? CATALOG.filter(c => c.name.toLowerCase().includes(term) || c.brand?.toLowerCase().includes(term))
      : CATALOG;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [q]);

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
      <Card>
        <CardContent className="p-4 divide-y divide-border">
          {results.map(item => (
            <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="size-10 rounded-md bg-secondary flex items-center justify-center text-sm font-semibold text-walmart-blue uppercase">
                {item.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.brand} · {item.unit}</p>
              </div>
              <p className="text-sm font-bold text-walmart-blue">${item.price.toFixed(2)}</p>
            </div>
          ))}
          {!results.length && (
            <p className="text-sm text-muted-foreground text-center py-6">No items match "{q}".</p>
          )}
        </CardContent>
      </Card>
    </Screen>
  );
};

export default SearchPage;
