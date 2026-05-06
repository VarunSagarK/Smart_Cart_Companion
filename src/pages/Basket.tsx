import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { BasketItemRow } from "@/components/BasketItemRow";
import { useDemoStore } from "@/hooks/useDemoStore";

const Basket = () => {
  const nav = useNavigate();
  const { state } = useDemoStore();
  const basket = state.basket;

  const sorted = useMemo(
    () => (basket ? [...basket.lines].sort((a, b) => a.item.name.localeCompare(b.item.name)) : []),
    [basket],
  );

  if (!basket) {
    return (
      <Screen title="Cart" subtitle="Empty">
        <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">
          Your cart is empty. Build a basket with the AI planner.
        </CardContent></Card>
        <Button onClick={() => nav("/ai")} className="w-full bg-walmart-blue text-primary-foreground">
          Open AI Planner
        </Button>
      </Screen>
    );
  }

  return (
    <Screen title="Cart" subtitle={`${sorted.length} items`}>
      <Card>
        <CardContent className="p-4 flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-2xl font-bold text-walmart-blue">${basket.subtotal.toFixed(2)}</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          {sorted.map(l => <BasketItemRow key={l.item.id} line={l} />)}
        </CardContent>
      </Card>
      <Button
        onClick={() => nav("/checkout")}
        className="w-full bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground h-12 font-semibold"
      >
        Check out · ${basket.subtotal.toFixed(2)}
      </Button>
    </Screen>
  );
};

export default Basket;
