import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Screen } from "@/components/Screen";
import { useDemoStore } from "@/hooks/useDemoStore";
import { buildAllStrategies } from "@/lib/budgetEngine";
import { ALL_BRANDS, CATALOG } from "@/lib/mockCatalog";
import { BudgetSource, DietId, PlanDuration, Preferences } from "@/lib/types";
import { cn } from "@/lib/utils";

const DIETS: { id: DietId; label: string }[] = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "high-protein", label: "High Protein" },
  { id: "keto", label: "Keto" },
  { id: "low-carb", label: "Low Carb" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "dairy-free", label: "Dairy-Free" },
  { id: "halal", label: "Halal" },
  { id: "kosher", label: "Kosher" },
  { id: "diabetic-friendly", label: "Diabetic-Friendly" },
  { id: "family-essentials", label: "Family Essentials" },
  { id: "budget-saver", label: "Budget Saver" },
  { id: "organic-preferred", label: "Organic Preferred" },
  { id: "no-preference", label: "No Preference" },
];

const STEPS = ["Duration", "Budget", "Household", "Diet", "Junk"] as const;

const IntegrationLogin = ({
  brand,
  color,
  onConnect,
  onCancel,
}: {
  brand: string;
  color: string;
  onConnect: () => void;
  onCancel: () => void;
}) => {
  const [email, setEmail] = useState(`demo@${brand.toLowerCase()}.com`);
  const [pwd, setPwd] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => onConnect(), 900);
  };
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col items-center text-center gap-2">
          <div
            className="size-12 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg"
            style={{ backgroundColor: color }}
          >
            {brand.charAt(0)}
          </div>
          <p className="font-semibold">Sign in to {brand}</p>
          <p className="text-xs text-muted-foreground">
            Demo only — credentials are pre-filled and not stored.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="iemail" className="text-xs">Email</Label>
            <Input id="iemail" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ipwd" className="text-xs">Password</Label>
            <Input id="ipwd" type="password" value={pwd} onChange={e => setPwd(e.target.value)} />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 font-semibold text-primary-foreground"
            style={{ backgroundColor: color }}
          >
            {loading ? "Connecting…" : `Connect ${brand}`}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>
            Use manual entry instead
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const AIOnboarding = () => {
  const nav = useNavigate();
  const { state, setPrefs, setBasket } = useDemoStore();
  const [step, setStep] = useState(0);

  const [duration, setDuration] = useState<PlanDuration>(state.prefs.duration);
  const [budgetSource, setBudgetSource] = useState<BudgetSource>(state.prefs.budgetSource);
  const [budget, setBudget] = useState<number>(state.prefs.weeklyBudget);
  const [household, setHousehold] = useState(state.prefs.household);
  const [diets, setDiets] = useState<DietId[]>(state.prefs.diets);
  const [avoidJunk, setAvoidJunk] = useState(state.prefs.avoidJunk);
  const [brand, setBrand] = useState(state.prefs.preferredBrand ?? ALL_BRANDS[0]);
  const [connected, setConnected] = useState<Record<BudgetSource, boolean>>({
    manual: true,
    ynab: false,
    mint: false,
  });

  const toggleDiet = (id: DietId) =>
    setDiets(d => {
      if (id === "no-preference") return d.includes(id) ? [] : ["no-preference"];
      const without = d.filter(x => x !== "no-preference");
      return without.includes(id) ? without.filter(x => x !== id) : [...without, id];
    });

  const weeklyBudget = useMemo(
    () => (duration === "monthly" ? +(budget / 4).toFixed(2) : budget),
    [budget, duration],
  );

  const canNext = useMemo(() => {
    if (step === 1) {
      if (budgetSource !== "manual" && !connected[budgetSource]) return false;
      return budget >= 20;
    }
    return true;
  }, [step, budget, budgetSource, connected]);

  const handleFinish = () => {
    const prefs: Preferences = {
      duration,
      budgetSource,
      weeklyBudget,
      household,
      diets,
      avoidJunk,
      preferredBrand: brand,
    };
    setPrefs(prefs);
    // Pre-build healthiest basket for results page
    const all = buildAllStrategies(prefs, CATALOG);
    setBasket(all.healthiest);
    nav("/results");
  };

  const next = () => (step === STEPS.length - 1 ? handleFinish() : setStep(s => s + 1));
  const prev = () => setStep(s => Math.max(0, s - 1));

  return (
    <Screen title="AI Grocery Planner" subtitle={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`}>
      <Progress value={((step + 1) / STEPS.length) * 100} className="h-1" />

      {step === 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold">How long should we plan for?</p>
            <div className="grid grid-cols-2 gap-2">
              {(["weekly", "monthly"] as PlanDuration[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    "rounded-lg border p-4 text-sm font-semibold capitalize transition",
                    duration === d
                      ? "border-walmart-blue bg-walmart-blue/5 text-walmart-blue"
                      : "border-border bg-background",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <>
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold">Where should we get your budget?</p>
              <div className="grid grid-cols-3 gap-2">
                {(["manual", "ynab", "mint"] as BudgetSource[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setBudgetSource(s)}
                    className={cn(
                      "rounded-lg border py-3 text-xs font-semibold uppercase transition relative",
                      budgetSource === s
                        ? "border-walmart-blue bg-walmart-blue/5 text-walmart-blue"
                        : "border-border bg-background",
                    )}
                  >
                    {s === "manual" ? "Manual" : s.toUpperCase()}
                    {s !== "manual" && connected[s] && (
                      <span className="absolute top-1 right-1 size-2 rounded-full bg-success" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {budgetSource !== "manual" && !connected[budgetSource] ? (
            <IntegrationLogin
              brand={budgetSource === "ynab" ? "YNAB" : "Mint"}
              color={budgetSource === "ynab" ? "#85B934" : "#00A38B"}
              onConnect={() => {
                setConnected(c => ({ ...c, [budgetSource]: true }));
                // Pretend the integration prefills a recommended budget
                setBudget(budgetSource === "ynab" ? 120 : 110);
              }}
              onCancel={() => setBudgetSource("manual")}
            />
          ) : (
            <Card>
              <CardContent className="p-4 space-y-2">
                {budgetSource !== "manual" && (
                  <p className="text-xs text-success font-semibold">
                    ✓ Connected to {budgetSource.toUpperCase()} — budget pre-filled
                  </p>
                )}
                <Label htmlFor="b" className="text-sm">
                  {duration === "weekly" ? "Weekly" : "Monthly"} grocery budget
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="b"
                    type="number"
                    min={20}
                    value={budget}
                    onChange={e => setBudget(+e.target.value || 0)}
                    className="pl-7 text-lg font-semibold"
                  />
                </div>
                {duration === "monthly" && (
                  <p className="text-xs text-muted-foreground">≈ ${weeklyBudget}/week</p>
                )}
                {budget < 20 && (
                  <p className="text-xs text-destructive">Minimum $20 required.</p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <Label htmlFor="hh" className="text-sm">Household size</Label>
            <Input
              id="hh"
              type="number"
              min={1}
              max={10}
              value={household}
              onChange={e => setHousehold(+e.target.value || 1)}
            />
            <p className="text-xs text-muted-foreground">We'll scale quantities accordingly.</p>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <>
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold">Dietary preferences</p>
              <div className="flex flex-wrap gap-2">
                {DIETS.map(d => {
                  const active = diets.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      onClick={() => toggleDiet(d.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        active
                          ? "bg-walmart-blue text-primary-foreground border-walmart-blue"
                          : "bg-background text-foreground border-border hover:bg-secondary",
                      )}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <Label className="text-sm">Preferred brand (optional)</Label>
              <select
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {ALL_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </CardContent>
          </Card>
        </>
      )}

      {step === 4 && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Avoid junk food</p>
              <p className="text-xs text-muted-foreground">Hide soda, chips, cookies.</p>
            </div>
            <Switch checked={avoidJunk} onCheckedChange={setAvoidJunk} />
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 pt-2">
        {step > 0 && (
          <Button variant="outline" onClick={prev} className="flex-1">
            <ChevronLeft className="size-4 mr-1" /> Back
          </Button>
        )}
        <Button
          onClick={next}
          disabled={!canNext}
          className="flex-1 bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground h-11 font-semibold"
        >
          {step === STEPS.length - 1 ? (
            <>
              <Sparkles className="size-4 mr-1" /> Build My Basket
            </>
          ) : (
            <>Next <ChevronRight className="size-4 ml-1" /></>
          )}
        </Button>
      </div>
    </Screen>
  );
};

export default AIOnboarding;
