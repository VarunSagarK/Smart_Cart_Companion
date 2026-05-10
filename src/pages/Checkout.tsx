import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Loader2,
  CreditCard,
  AlertCircle,
  ShoppingBag,
  ChevronRight,
  Banknote,
  RefreshCw,
  ChevronDown,
  BellRing,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Screen } from "@/components/Screen";
import { useStore } from "@/contexts/DemoStoreContext";
import { usePlaid } from "@/hooks/usePlaid";
import { useYnab } from "@/hooks/useYnab";
import { Basket } from "@/lib/types";
import { cn } from "@/lib/utils";

type CheckoutStep = "review" | "processing" | "confirmed";

const EMOJI: Record<string, string> = {
  produce: "🥬",
  dairy: "🥛",
  pantry: "🥫",
  snacks: "🍿",
  beverages: "🥤",
  protein: "🍗",
};

const Checkout = () => {
  const nav = useNavigate();
  const location = useLocation();
  const { state, recordPurchase, cartCount } = useStore();
  const { connected: plaidConnected, kohoBalance, mockConnect: mockPlaidConnect } = usePlaid();
  const { connected: ynabConnected, groceryBalance, syncSpend, mockConnect: mockYnabConnect } = useYnab();

  // Over-budget value passed from Cart when user confirmed "Yes, proceed"
  const overBudgetAmount: number = (location.state as { overBudget?: number })?.overBudget ?? 0;

  const [step, setStep] = useState<CheckoutStep>("review");
  const [orderId] = useState(() => `WMT-${Date.now().toString(36).toUpperCase()}`);
  const [ynabSynced, setYnabSynced] = useState<boolean | null>(null);
  // Snapshot the basket before recordPurchase clears it
  const [confirmedBasket, setConfirmedBasket] = useState<Basket | null>(null);
  const [showOrderItems, setShowOrderItems] = useState(false);
  // Reminder prompt state: null = not answered, true = accepted, false = declined
  const [reminderAnswer, setReminderAnswer] = useState<boolean | null>(null);

  const basket = state.basket;

  if (!basket || basket.lines.length === 0) {
    // If we just confirmed an order, don't show empty — show confirmed
    if (step === "confirmed" && confirmedBasket) {
      // fall through to confirmed render below
    } else {
      return (
        <Screen title="Checkout" back hideTabs>
          <Card>
            <CardContent className="p-8 flex flex-col items-center text-center gap-3">
              <ShoppingBag className="size-12 text-muted-foreground/40" />
              <p className="font-semibold">Your cart is empty</p>
              <Button onClick={() => nav("/ai")} className="bg-walmart-blue text-primary-foreground">
                Build a basket
              </Button>
            </CardContent>
          </Card>
        </Screen>
      );
    }
  }

  const activeBasket = confirmedBasket ?? basket!;
  const subtotal = activeBasket.subtotal;
  const savings = activeBasket.savings;
  const tax = +(subtotal * 0.13).toFixed(2);   // Ontario HST 13%
  const total = +(subtotal + tax).toFixed(2);
  const kohoAvailable = kohoBalance?.availableRaw ?? 0;
  const kohoShort = plaidConnected && kohoAvailable < total;

  const handlePlaceOrder = async () => {
    // Snapshot before clearing
    setConfirmedBasket(basket);
    setStep("processing");
    await new Promise(r => setTimeout(r, 1800));
    recordPurchase(basket!);

    if (ynabConnected) {
      const ok = await syncSpend(total, `Walmart order ${orderId}`);
      setYnabSynced(ok);
    }

    setStep("confirmed");
  };

  // ── Processing ───────────────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <Screen title="Processing…" hideTabs>
        <Card>
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div className="size-20 rounded-full bg-walmart-blue/10 flex items-center justify-center">
                <ShoppingBag className="size-10 text-walmart-blue" />
              </div>
              <Loader2 className="size-6 text-walmart-blue absolute -bottom-1 -right-1 animate-spin" />
            </div>
            <div>
              <p className="text-xl font-bold">Placing your order…</p>
              <p className="text-sm text-muted-foreground mt-1">Please don't close this screen</p>
            </div>
            <div className="w-full space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                <span>Basket verified · {cartCount} items</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 text-walmart-blue shrink-0 animate-spin" />
                <span>Processing payment…</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Screen>
    );
  }

  // ── Confirmed ────────────────────────────────────────────────────────────────
  if (step === "confirmed") {
    const orderLines = confirmedBasket?.lines ?? [];
    const orderItemCount = orderLines.reduce((n, l) => n + l.qty, 0);
    return (
      <Screen title="Order Confirmed" hideTabs>
        {/* Hero */}
        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <div className="size-16 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="size-9 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">Order placed!</p>
              <p className="text-sm text-white/85 mt-1">Order #{orderId}</p>
            </div>
          </CardContent>
        </Card>

        {/* Receipt */}
        <Card className={overBudgetAmount > 0 ? "border-red-200" : ""}>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-bold">Receipt</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({orderItemCount} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Rollback savings</span>
                <span>−${savings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (HST 13%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total charged</span>
                <span className="text-walmart-blue">${total.toFixed(2)}</span>
              </div>
              {overBudgetAmount > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between text-xs text-red-500 font-semibold pt-0.5">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="size-3.5 shrink-0" />
                      Over budget
                    </span>
                    <span>+${overBudgetAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget reminder prompt — only shown when over budget and not yet answered */}
        {overBudgetAmount > 0 && reminderAnswer === null && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <BellRing className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-amber-800">
                  Would you like us to remind you to stay within budget next time?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  className="bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground font-bold h-9"
                  onClick={() => setReminderAnswer(true)}
                >
                  Yes, remind me
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 font-semibold"
                  onClick={() => setReminderAnswer(false)}
                >
                  No, thanks
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reminder response message */}
        {overBudgetAmount > 0 && reminderAnswer === true && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-800 font-medium">
                We will be happy to remind you and help stay in your limit 🙂
              </p>
            </CardContent>
          </Card>
        )}

        {/* View order items — collapsible */}
        <Card>
          <CardContent className="p-0">
            <button
              className="w-full flex items-center justify-between p-4 text-sm font-semibold"
              onClick={() => setShowOrderItems(v => !v)}
            >
              <span>View order items ({orderItemCount})</span>
              <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", showOrderItems && "rotate-180")} />
            </button>
            {showOrderItems && (
              <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                {orderLines.map(l => (
                  <div key={l.item.id} className="flex items-center gap-3">
                    <div className="size-9 rounded-md bg-secondary flex items-center justify-center text-lg shrink-0">
                      {EMOJI[l.item.category] ?? "🛒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{l.item.name}</p>
                      <p className="text-[11px] text-muted-foreground">{l.item.brand} · {l.qty}×</p>
                    </div>
                    <span className="text-xs font-semibold text-walmart-blue shrink-0">
                      ${(l.item.price * l.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment method */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-md bg-[#2C3E50] flex items-center justify-center">
              <CreditCard className="size-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {plaidConnected && kohoBalance ? kohoBalance.accountName : "Simulated payment"}
              </p>
              <p className="text-xs text-muted-foreground">
                {plaidConnected && kohoBalance ? `•••• ${kohoBalance.mask}` : "No real charge was made"}
              </p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-0">Paid</Badge>
          </CardContent>
        </Card>

        {/* YNAB sync status */}
        {ynabConnected && (
          <Card className={cn("border", ynabSynced ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50")}>
            <CardContent className="p-3 flex items-center gap-2">
              {ynabSynced ? (
                <>
                  <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-800">Synced to YNAB</p>
                    <p className="text-[11px] text-green-700">
                      ${total.toFixed(2)} recorded to your Groceries category
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="size-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">YNAB sync pending</p>
                    <p className="text-[11px] text-amber-700">Will retry automatically</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => nav("/wellness")}>
            Payment History
          </Button>
          <Button className="bg-walmart-blue text-primary-foreground" onClick={() => nav("/")}>
            Keep Shopping
          </Button>
        </div>
      </Screen>
    );
  }

  // ── Review (default) ─────────────────────────────────────────────────────────
  return (
    <Screen title="Checkout" back subtitle={`${cartCount} items · $${total.toFixed(2)}`} hideTabs>
      {/* Order summary */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-bold">Order summary</p>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {basket!.lines.map(l => (
              <div key={l.item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-7 rounded bg-secondary flex items-center justify-center text-base shrink-0">
                    {EMOJI[l.item.category] ?? "🛒"}
                  </span>
                  <span className="truncate text-xs">{l.item.name}</span>
                  {l.item.onSale && (
                    <Badge variant="secondary" className="text-[9px] shrink-0 px-1 py-0">Sale</Badge>
                  )}
                </div>
                <span className="shrink-0 text-xs font-semibold ml-2">
                  {l.qty}× ${l.item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600 text-xs">
              <span>Rollback savings</span>
              <span>−${savings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tax (HST 13%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-walmart-blue text-lg">${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KOHO balance */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold flex items-center gap-2">
              <Banknote className="size-4 text-walmart-blue" /> Payment
            </p>
            {!plaidConnected && (
              <button
                className="text-xs text-walmart-blue font-semibold"
                onClick={() => mockPlaidConnect()}
              >
                Connect KOHO
              </button>
            )}
          </div>

          {plaidConnected && kohoBalance ? (
            <div className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-md bg-[#2C3E50] flex items-center justify-center text-white text-xs font-bold">
                  K
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{kohoBalance.accountName}</p>
                  <p className="text-xs text-muted-foreground">•••• {kohoBalance.mask} · {kohoBalance.currency}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-walmart-blue">{kohoBalance.available}</p>
                  <p className="text-[10px] text-muted-foreground">available</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Order total ${total.toFixed(2)}</span>
                  <span>Balance {kohoBalance.available}</span>
                </div>
                <Progress
                  value={Math.min(100, (total / kohoAvailable) * 100)}
                  className={cn("h-1.5", kohoShort ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500")}
                />
              </div>
              {kohoShort && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle className="size-3.5 shrink-0" />
                  Insufficient balance — top up ${(total - kohoAvailable).toFixed(2)} more
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
              <CreditCard className="size-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">
                Connect your KOHO card to see your balance before paying
              </p>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => mockPlaidConnect()}>
                Connect KOHO (demo)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* YNAB budget check */}
      {ynabConnected && groceryBalance && (
        <Card className="border-[#85B934]/30 bg-[#85B934]/5">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="size-8 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#85B934" }}>
              Y
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold">YNAB · {groceryBalance.name}</p>
              <p className="text-[11px] text-muted-foreground">
                ${groceryBalance.remaining.toFixed(2)} remaining · after this order: ${Math.max(0, groceryBalance.remaining - total).toFixed(2)}
              </p>
            </div>
            {total > groceryBalance.remaining && (
              <AlertCircle className="size-4 text-amber-500 shrink-0" />
            )}
          </CardContent>
        </Card>
      )}

      {!ynabConnected && (
        <button
          onClick={() => mockYnabConnect(state.prefs.weeklyBudget * 4)}
          className="w-full text-xs text-muted-foreground text-center py-1 hover:text-walmart-blue transition"
        >
          <RefreshCw className="size-3 inline mr-1" />
          Connect YNAB to track budget impact
        </button>
      )}

      {/* Delivery info */}
      <Card>
        <CardContent className="p-4">
          <button className="w-full flex items-center gap-3 text-left">
            <ShoppingBag className="size-5 text-walmart-blue shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Walmart Pickup · Free</p>
              <p className="text-xs text-muted-foreground">Ready in 2–4 hours · Simulated for MVP</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      {/* Place order */}
      <Button
        onClick={handlePlaceOrder}
        disabled={kohoShort}
        className="w-full bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground h-12 font-semibold sticky bottom-2 shadow-lg"
      >
        {kohoShort ? <>Insufficient KOHO balance</> : <>Place order · ${total.toFixed(2)}</>}
      </Button>

      <p className="text-[10px] text-muted-foreground text-center pb-2">
        This is a simulated MVP checkout. No real payment is processed.
      </p>
    </Screen>
  );
};

export default Checkout;
