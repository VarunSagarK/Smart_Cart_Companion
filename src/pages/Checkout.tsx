import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/Screen";
import { useDemoStore } from "@/hooks/useDemoStore";

const Checkout = () => {
  const nav = useNavigate();
  const { state, recordPurchase } = useDemoStore();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!state.basket) {
      nav("/budget", { replace: true });
      return;
    }
    const t = setTimeout(() => {
      recordPurchase(state.basket!);
      setDone(true);
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen title="Checkout" back hideTabs>
      <Card>
        <CardContent className="p-8 flex flex-col items-center text-center gap-3">
          {!done ? (
            <>
              <Loader2 className="size-12 text-walmart-blue animate-spin" />
              <p className="font-semibold mt-2">Opening Walmart…</p>
              <p className="text-sm text-muted-foreground">
                Handing off your basket to the Walmart cart.
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-14 text-success" />
              <p className="text-xl font-bold mt-1">Order placed!</p>
              <p className="text-sm text-muted-foreground">
                Your purchase has been recorded. See how this week stacked up.
              </p>
              <Button
                onClick={() => nav("/dashboard")}
                className="mt-4 bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground"
              >
                View Wellness Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Screen>
  );
};

export default Checkout;
