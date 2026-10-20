import { ChevronRight, Heart, MapPin, CreditCard, Package, Bell, HelpCircle, LogOut, User, Loader2, CheckCircle2, Unplug } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui/button";
import { useStore } from "@/contexts/DemoStoreContext";
import { useYnab } from "@/hooks/useYnab";
import { usePlaid } from "@/hooks/usePlaid";

const ROW_GROUPS = [
  {
    title: "Purchases",
    rows: [
      { icon: Package, label: "Purchase history", value: "" },
      { icon: Heart, label: "Lists & registries", value: "" },
    ],
  },
  {
    title: "Account",
    rows: [
      { icon: MapPin, label: "Addresses", value: "Home" },
      { icon: CreditCard, label: "Payment methods", value: "Visa ••4242" },
      { icon: Bell, label: "Notifications", value: "On" },
    ],
  },
  {
    title: "Support",
    rows: [
      { icon: HelpCircle, label: "Help center", value: "" },
    ],
  },
];

const Account = () => {
  const { state } = useStore();
  const p = state.prefs;
  // This call handles the ?code= YNAB OAuth callback and redirects to /ai
  const { loading: ynabLoading, connected: ynabConnected, disconnect: ynabDisconnect } = useYnab();
  const { connected: plaidConnected, disconnect: plaidDisconnect } = usePlaid();

  // Show a brief loading screen while the YNAB token exchange is happening
  if (ynabLoading) {
    return (
      <Screen title="Connecting YNAB…" hideTabs>
        <Card>
          <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
            <Loader2 className="size-10 text-walmart-blue animate-spin" />
            <p className="font-semibold">Pulling your grocery budget from YNAB…</p>
            <p className="text-xs text-muted-foreground">You'll be taken to the AI Planner in a moment</p>
          </CardContent>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Account" subtitle="Demo user">
      {/* Profile header — Walmart account style */}
      <Card className="bg-walmart-blue text-primary-foreground border-0">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="size-12 rounded-full bg-walmart-yellow text-walmart-blue-dark flex items-center justify-center font-bold text-lg">
            <User className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold leading-tight">Hi, Demo Shopper</p>
            <p className="text-xs text-white/80 truncate">demo@walmart.ai</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-primary-foreground hover:bg-walmart-blue-dark"
          >
            Edit
          </Button>
        </CardContent>
      </Card>

      {/* AI summary card */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-bold text-walmart-blue uppercase tracking-wide mb-2">AI Planner</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-walmart-blue-dark">${p.weeklyBudget}</p>
              <p className="text-[11px] text-muted-foreground capitalize">{p.duration} budget</p>
            </div>
            <div>
              <p className="text-lg font-bold text-walmart-blue-dark">{p.household}</p>
              <p className="text-[11px] text-muted-foreground">Household</p>
            </div>
            <div>
              <p className="text-lg font-bold text-walmart-blue-dark">{state.history.length}</p>
              <p className="text-[11px] text-muted-foreground">Total shops</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 px-1">
          Integrations
        </p>
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {/* YNAB */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="size-8 rounded flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: "#85B934" }}>
                Y
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">YNAB</p>
                <p className="text-[11px] text-muted-foreground">
                  {ynabConnected ? "Connected — budget synced" : "Not connected"}
                </p>
              </div>
              {ynabConnected ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                  <button
                    onClick={() => {
                      ynabDisconnect();
                      localStorage.removeItem("ynab_token");
                      localStorage.removeItem("walmart-ai-demo-v3");
                      location.reload();
                    }}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>

            {/* KOHO / Plaid */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="size-8 rounded bg-[#2C3E50] flex items-center justify-center text-white text-xs font-bold shrink-0">
                K
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">KOHO</p>
                <p className="text-[11px] text-muted-foreground">
                  {plaidConnected ? "Connected via Plaid" : "Not connected"}
                </p>
              </div>
              {plaidConnected ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                  <button
                    onClick={plaidDisconnect}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setting rows — Walmart-style stacked groups */}
      {ROW_GROUPS.map(group => (
        <div key={group.title}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 px-1">
            {group.title}
          </p>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {group.rows.map(row => (
                <button
                  key={row.label}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 transition"
                >
                  <row.icon className="size-5 text-walmart-blue shrink-0" />
                  <span className="flex-1 text-sm font-medium">{row.label}</span>
                  {row.value && <span className="text-xs text-muted-foreground">{row.value}</span>}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Reset demo — nukes all localStorage and reloads fresh */}
      <Button
        variant="outline"
        className="w-full border-destructive text-destructive hover:bg-destructive/10 font-semibold"
        onClick={() => { localStorage.clear(); location.reload(); }}
      >
        <Unplug className="size-4 mr-2" /> Reset all demo data
      </Button>
    </Screen>
  );
};

export default Account;
