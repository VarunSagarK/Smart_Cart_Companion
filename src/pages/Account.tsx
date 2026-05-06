import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { useDemoStore } from "@/hooks/useDemoStore";
import { Button } from "@/components/ui/button";

const Account = () => {
  const { state } = useDemoStore();
  const p = state.prefs;
  return (
    <Screen title="Account" subtitle="Demo user">
      <Card>
        <CardContent className="p-4 space-y-1">
          <p className="text-sm font-semibold">Demo Shopper</p>
          <p className="text-xs text-muted-foreground">demo@walmart.ai</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Plan duration</span><span className="font-semibold capitalize">{p.duration}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Budget source</span><span className="font-semibold uppercase">{p.budgetSource}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Weekly budget</span><span className="font-semibold">${p.weeklyBudget}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Household</span><span className="font-semibold">{p.household}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Diets</span><span className="font-semibold">{p.diets.length || "None"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Avoid junk</span><span className="font-semibold">{p.avoidJunk ? "On" : "Off"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total shops</span><span className="font-semibold">{state.history.length}</span></div>
        </CardContent>
      </Card>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => { localStorage.clear(); location.reload(); }}
      >
        Reset demo data
      </Button>
    </Screen>
  );
};

export default Account;
