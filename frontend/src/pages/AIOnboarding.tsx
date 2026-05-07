import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Screen } from "@/components/Screen";
import { useDemoStore } from "@/hooks/useDemoStore";
import { buildAllStrategies } from "@/lib/budgetEngine";
import { CATALOG, KITCHEN_BASICS } from "@/lib/mockCatalog";
import { BrandMultiSelect } from "@/components/BrandMultiSelect";
import {
  BudgetSource,
  DietId,
  FoodTypeId,
  Household,
  MotivationId,
  PlanDuration,
  Preferences,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/** Alphabetical chip lists. */
const DIETS: { id: DietId; label: string }[] = [
  { id: "budget-saver", label: "Budget Saver" },
  { id: "dairy-free", label: "Dairy-Free" },
  { id: "diabetic-friendly", label: "Diabetic-Friendly" },
  { id: "family-essentials", label: "Family Essentials" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "halal", label: "Halal" },
  { id: "high-protein", label: "High Protein" },
  { id: "keto", label: "Keto" },
  { id: "kosher", label: "Kosher" },
  { id: "low-carb", label: "Low Carb" },
  { id: "no-preference", label: "No Preference" },
  { id: "organic-preferred", label: "Organic Preferred" },
  { id: "vegan", label: "Vegan" },
  { id: "vegetarian", label: "Vegetarian" },
];

const FOOD_TYPES: { id: FoodTypeId; label: string }[] = [
  { id: "american", label: "American" },
  { id: "asian", label: "Asian" },
  { id: "chinese", label: "Chinese" },
  { id: "comfort", label: "Comfort Foods" },
  { id: "frozen", label: "Frozen Foods" },
  { id: "indian", label: "Indian" },
  { id: "italian", label: "Italian" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "mexican", label: "Mexican" },
  { id: "middle-eastern", label: "Middle Eastern" },
  { id: "organic", label: "Organic" },
  { id: "quick-meals", label: "Quick Meals" },
  { id: "seafood", label: "Seafood" },
  { id: "snacks", label: "Snacks" },
  { id: "vegetarian-comfort", label: "Vegetarian Comfort Foods" },
];

const MOTIVATIONS: { id: MotivationId; label: string }[] = [
  { id: "birthday-week", label: "Birthday Week" },
  { id: "budget-friendly", label: "Budget Friendly" },
  { id: "comfort-meals", label: "Comfort Meals" },
  { id: "family-gathering", label: "Family Gathering" },
  { id: "fitness-goals", label: "Fitness Goals" },
  { id: "health-conscious", label: "Health Conscious" },
  { id: "high-protein", label: "High Protein" },
  { id: "kids-lunch-prep", label: "Kids Lunch Prep" },
  { id: "meal-prep", label: "Meal Prep" },
  { id: "quick-easy", label: "Quick & Easy Meals" },
  { id: "special-occasion", label: "Special Occasion" },
  { id: "student-budget", label: "Student Budget" },
  { id: "vacation-prep", label: "Vacation Prep" },
  { id: "weekly-essentials", label: "Weekly Essentials" },
];

/** ---------- Section helpers ---------- */
const Section = ({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <Card>
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start gap-2">
        <span className="size-6 shrink-0 rounded-full bg-walmart-blue/10 text-walmart-blue text-xs font-bold flex items-center justify-center mt-0.5">
          {step}
        </span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
        </div>
      </div>
      <div>{children}</div>
    </CardContent>
  </Card>
);

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
      active
        ? "bg-walmart-blue text-primary-foreground border-walmart-blue"
        : "bg-background text-foreground border-border hover:bg-secondary",
    )}
  >
    {children}
  </button>
);

/** Inline validation pill — Walmart-light. */
const ValidationNote = ({ children }: { children: React.ReactNode }) => (
  <p className="flex items-center gap-1.5 text-[11px] text-walmart-blue-dark mt-2">
    <AlertCircle className="size-3" /> {children}
  </p>
);

/** ---------- Lightweight integration login mocks ---------- */
const IntegrationLogin = ({
  brand,
  color,
  connected,
  onConnect,
}: {
  brand: string;
  color: string;
  connected: boolean;
  onConnect: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(`demo@${brand.toLowerCase()}.com`);
  const [pwd, setPwd] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  if (connected) {
    return (
      <div className="rounded-lg border border-success/40 bg-success/5 p-3 text-xs flex items-center justify-between">
        <span className="font-semibold text-success">✓ Connected to {brand}</span>
        <span className="text-muted-foreground">grocery budget pre-filled</span>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-lg border border-border bg-background hover:bg-secondary transition p-3 text-left"
      >
        <span
          className="size-9 rounded-md flex items-center justify-center text-primary-foreground text-sm font-bold"
          style={{ backgroundColor: color }}
        >
          {brand.charAt(0)}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Connect {brand}</p>
          <p className="text-[11px] text-muted-foreground">Pull your grocery budget automatically</p>
        </div>
        <span className="text-xs font-semibold text-walmart-blue">Sign in</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setOpen(false);
          onConnect();
        }, 700);
      }}
      className="rounded-lg border border-border p-3 space-y-2 bg-secondary/40"
    >
      <p className="text-xs font-semibold">Sign in to {brand}</p>
      <Input value={email} onChange={e => setEmail(e.target.value)} className="h-9 text-sm" />
      <Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} className="h-9 text-sm" />
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={loading}
          className="flex-1 text-primary-foreground"
          style={{ backgroundColor: color }}
        >
          {loading ? "Connecting…" : "Connect"}
        </Button>
      </div>
    </form>
  );
};

/** ---------- Main page ---------- */
const AIOnboarding = () => {
  const nav = useNavigate();
  const { state, setPrefs, setBasket } = useDemoStore();

  const [duration, setDuration] = useState<PlanDuration>(state.prefs.duration);
  const [budgetSource, setBudgetSource] = useState<BudgetSource>(state.prefs.budgetSource);
  const [budget, setBudget] = useState<number>(state.prefs.rawBudget ?? state.prefs.weeklyBudget);
  const [hh, setHh] = useState<Household>(
    state.prefs.householdBreakdown ?? { adults: 2, seniors: 0, kids: 0 },
  );
  const [diets, setDiets] = useState<DietId[]>(state.prefs.diets);
  const [foodTypes, setFoodTypes] = useState<FoodTypeId[]>(state.prefs.foodTypes ?? []);
  const [motivation, setMotivation] = useState<MotivationId>(state.prefs.motivation ?? "weekly-essentials");
  const [kitchenHave, setKitchenHave] = useState<string[]>(state.prefs.kitchenHave ?? []);
  const [avoidJunk, setAvoidJunk] = useState(state.prefs.avoidJunk);
  const [brands, setBrands] = useState<string[]>(state.prefs.preferredBrands ?? []);
  const [connected, setConnected] = useState<Record<BudgetSource, boolean>>({
    manual: true,
    ynab: false,
    koho: false,
  });
  const [showErrors, setShowErrors] = useState(false);

  const toggleDiet = (id: DietId) =>
    setDiets(d => {
      if (id === "no-preference") return d.includes(id) ? [] : ["no-preference"];
      const without = d.filter(x => x !== "no-preference");
      return without.includes(id) ? without.filter(x => x !== id) : [...without, id];
    });
  const toggleFood = (id: FoodTypeId) =>
    setFoodTypes(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  const toggleHave = (id: string) =>
    setKitchenHave(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));

  const weeks = duration === "monthly" ? 4 : duration === "biweekly" ? 2 : 1;
  const weeklyBudget = useMemo(() => +(budget / weeks).toFixed(2), [budget, weeks]);
  const totalPeople = hh.adults + hh.seniors + hh.kids;

  // Detailed validation flags
  const errors = useMemo(() => {
    const e: { duration?: string; budget?: string; household?: string; foodOrDiet?: string } = {};
    if (!duration) e.duration = "Choose how long you're planning for.";
    if (budgetSource === "manual" && (!budget || budget < 20)) {
      e.budget = "Enter a grocery budget of at least $20.";
    } else if (budgetSource !== "manual" && !connected[budgetSource]) {
      e.budget = `Sign in to ${budgetSource.toUpperCase()} or switch to manual entry.`;
    }
    if (totalPeople < 1) e.household = "Add at least one person in your household.";
    const hasDiet = diets.some(d => d !== "no-preference");
    if (foodTypes.length === 0 && !hasDiet) {
      e.foodOrDiet = "Pick at least one food type or dietary preference.";
    }
    return e;
  }, [duration, budgetSource, budget, connected, totalPeople, diets, foodTypes]);

  const valid = Object.keys(errors).length === 0;

  const handleFinish = () => {
    if (!valid) {
      setShowErrors(true);
      const first = errors.duration || errors.budget || errors.household || errors.foodOrDiet;
      if (first) toast.error(first);
      // Try to scroll to first error
      setTimeout(() => {
        document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }
    const prefs: Preferences = {
      duration,
      budgetSource,
      weeklyBudget,
      rawBudget: budget,
      household: totalPeople,
      householdBreakdown: hh,
      diets,
      foodTypes,
      motivation,
      kitchenHave,
      avoidJunk,
      preferredBrands: brands,
    };
    setPrefs(prefs);
    const all = buildAllStrategies(prefs, CATALOG);
    setBasket(all.healthiest);
    nav("/results");
  };

  return (
    <Screen
      title="AI Grocery Planner"
      back
      subtitle="Let's plan groceries together"
    >
      {/* Friendly intro */}
      <Card className="bg-gradient-to-br from-walmart-blue to-walmart-blue-dark text-primary-foreground border-0">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className="size-5 text-walmart-yellow mt-0.5" />
          <div>
            <p className="font-bold">Hi! Let's build this week's basket together.</p>
            <p className="text-xs text-white/85 mt-1">
              A few quick details and we'll match your budget with this week's deals.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 1 — Duration */}
      <div data-error={showErrors && !!errors.duration}>
        <Section step={1} title="How long are we planning for?" hint="Pick the rhythm that fits your household.">
          <div className="grid grid-cols-3 gap-2">
            {(["weekly", "biweekly", "monthly"] as PlanDuration[]).map(d => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  "rounded-lg border py-3 text-xs font-semibold capitalize transition",
                  duration === d ? "border-walmart-blue bg-walmart-blue/5 text-walmart-blue" : "border-border bg-background",
                )}
              >
                {d === "biweekly" ? "Bi-weekly" : d}
              </button>
            ))}
          </div>
          {showErrors && errors.duration && <ValidationNote>{errors.duration}</ValidationNote>}
        </Section>
      </div>

      {/* 2 — Budget */}
      <div data-error={showErrors && !!errors.budget}>
        <Section step={2} title="Where should we get our budget from?" hint="Manual works great. Connect YNAB or KOHO to pull a recommended grocery budget.">
          <div className="space-y-2">
            {/* Manual */}
            <button
              type="button"
              onClick={() => setBudgetSource("manual")}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition",
                budgetSource === "manual"
                  ? "border-walmart-blue bg-walmart-blue/5"
                  : "border-border bg-background hover:bg-secondary",
              )}
            >
              <span className="size-9 rounded-md bg-walmart-blue text-primary-foreground flex items-center justify-center text-sm font-bold">$</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">Manual Entry</p>
                <p className="text-[11px] text-muted-foreground">Set a grocery budget yourself</p>
              </div>
              {budgetSource === "manual" && <span className="text-xs font-semibold text-walmart-blue">Selected</span>}
            </button>

            {/* KOHO (alphabetically before YNAB) */}
            <div onClick={() => setBudgetSource("koho")}>
              <IntegrationLogin
                brand="KOHO"
                color="#0F172A"
                connected={connected.koho}
                onConnect={() => {
                  setConnected(c => ({ ...c, koho: true }));
                  setBudgetSource("koho");
                  setBudget(110 * weeks);
                }}
              />
            </div>

            {/* YNAB */}
            <div onClick={() => setBudgetSource("ynab")}>
              <IntegrationLogin
                brand="YNAB"
                color="#85B934"
                connected={connected.ynab}
                onConnect={() => {
                  setConnected(c => ({ ...c, ynab: true }));
                  setBudgetSource("ynab");
                  setBudget(120 * weeks);
                }}
              />
            </div>

            {/* Always show the budget input — required if no integration connected */}
            <div className="rounded-lg border border-border p-3 space-y-1.5 bg-card">
              <Label htmlFor="b" className="text-xs font-semibold">
                {duration === "weekly" ? "Weekly" : duration === "biweekly" ? "Bi-weekly" : "Monthly"} grocery budget
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
              <p className="text-[11px] text-muted-foreground">
                ≈ ${weeklyBudget}/week · for {weeks} week{weeks > 1 ? "s" : ""}
              </p>
              {budget < 20 && <p className="text-xs text-destructive">Minimum $20 required.</p>}
            </div>
          </div>
          {showErrors && errors.budget && <ValidationNote>{errors.budget}</ValidationNote>}
        </Section>
      </div>

      {/* 3 — Household */}
      <div data-error={showErrors && !!errors.household}>
        <Section step={3} title="How many people are we shopping for?" hint="We use this to estimate quantities and nutrition.">
          <div className="grid grid-cols-3 gap-2">
            {[
              { k: "adults" as const, label: "Adults" },
              { k: "kids" as const, label: "Kids" },
              { k: "seniors" as const, label: "Seniors" },
            ].map(({ k, label }) => (
              <div key={k} className="rounded-lg border border-border p-2">
                <Label className="text-[11px] text-muted-foreground">{label}</Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={hh[k]}
                  onChange={e => setHh(h => ({ ...h, [k]: Math.max(0, +e.target.value || 0) }))}
                  className="h-9 text-base font-semibold mt-1"
                />
              </div>
            ))}
          </div>
          {(hh.kids > 0 || hh.seniors > 0) && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {hh.kids > 0 && (
                <div>
                  <Label className="text-[11px] text-muted-foreground">Kids ages (optional)</Label>
                  <Input placeholder="e.g. 4, 9" value={hh.kidsAges ?? ""} onChange={e => setHh(h => ({ ...h, kidsAges: e.target.value }))} className="h-9 text-sm mt-1" />
                </div>
              )}
              {hh.seniors > 0 && (
                <div>
                  <Label className="text-[11px] text-muted-foreground">Seniors ages (optional)</Label>
                  <Input placeholder="e.g. 68, 72" value={hh.seniorsAges ?? ""} onChange={e => setHh(h => ({ ...h, seniorsAges: e.target.value }))} className="h-9 text-sm mt-1" />
                </div>
              )}
            </div>
          )}
          {showErrors && errors.household && <ValidationNote>{errors.household}</ValidationNote>}
        </Section>
      </div>

      {/* 4 — Food Types */}
      <div data-error={showErrors && !!errors.foodOrDiet && foodTypes.length === 0}>
        <Section step={4} title="What kind of foods do we enjoy most?" hint="Pick a few to shape grocery suggestions.">
          <div className="flex flex-wrap gap-2">
            {FOOD_TYPES.map(f => (
              <Chip key={f.id} active={foodTypes.includes(f.id)} onClick={() => toggleFood(f.id)}>{f.label}</Chip>
            ))}
          </div>
        </Section>
      </div>

      {/* 5 — Diets */}
      <div data-error={showErrors && !!errors.foodOrDiet}>
        <Section step={5} title="Any dietary preferences?" hint="Multi-select. Use 'No Preference' to skip.">
          <div className="flex flex-wrap gap-2">
            {DIETS.map(d => (
              <Chip key={d.id} active={diets.includes(d.id)} onClick={() => toggleDiet(d.id)}>{d.label}</Chip>
            ))}
          </div>
          {showErrors && errors.foodOrDiet && <ValidationNote>{errors.foodOrDiet}</ValidationNote>}
        </Section>
      </div>

      {/* 6 — Motivation */}
      <Section step={6} title="What are we focusing on this time?" hint="We'll prioritize items that match.">
        <select
          value={motivation}
          onChange={e => setMotivation(e.target.value as MotivationId)}
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {MOTIVATIONS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </Section>

      {/* 7 — Kitchen Have (renamed copy) */}
      <Section step={7} title="What do we already have at home?" hint="Helps us avoid duplicate purchases.">
        <div className="grid grid-cols-4 gap-2">
          {KITCHEN_BASICS.map(k => {
            const active = kitchenHave.includes(k.id);
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => toggleHave(k.id)}
                className={cn(
                  "aspect-square rounded-lg border flex flex-col items-center justify-center gap-1 p-1 transition text-center",
                  active ? "border-walmart-blue bg-walmart-blue/5" : "border-border bg-background",
                )}
              >
                <span className="text-2xl leading-none">{k.emoji}</span>
                <span className="text-[10px] font-medium leading-tight">{k.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* 8 — Junk + Brand */}
      <Section step={8} title="A couple of finishing touches" hint="">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Avoid junk food</p>
              <p className="text-xs text-muted-foreground">
                {avoidJunk ? "We'll filter out soda, chips, cookies." : "Snacks and treats will be included."}
              </p>
            </div>
            <Switch checked={avoidJunk} onCheckedChange={setAvoidJunk} />
          </div>
          <BrandMultiSelect selected={brands} onChange={setBrands} />
        </div>
      </Section>

      {/* Submit */}
      <Button
        onClick={handleFinish}
        className="w-full bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground h-12 font-semibold sticky bottom-2 shadow-lg"
      >
        <Sparkles className="size-4 mr-2" />
        Build our basket
      </Button>
      {showErrors && !valid && (
        <p className="text-[11px] text-center text-walmart-blue-dark -mt-2">
          A few details still need your attention above.
        </p>
      )}
    </Screen>
  );
};

export default AIOnboarding;
