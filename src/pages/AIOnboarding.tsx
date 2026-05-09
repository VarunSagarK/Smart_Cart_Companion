import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Screen } from "@/components/Screen";
import { useStore } from "@/contexts/DemoStoreContext";
import { buildAllStrategies } from "@/lib/budgetEngine";
import { ALL_BRANDS, CATALOG, KITCHEN_BASICS } from "@/lib/mockCatalog";
import { generateAIBasket } from "@/lib/aiPlanner";
import { ynabAuthUrl } from "@/lib/ynab";
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

// ── Static data ───────────────────────────────────────────────────────────────

const DIETS: { id: DietId; label: string; emoji: string }[] = [
  { id: "budget-saver", label: "Budget Saver", emoji: "💰" },
  { id: "dairy-free", label: "Dairy-Free", emoji: "🥛" },
  { id: "diabetic-friendly", label: "Diabetic-Friendly", emoji: "🩺" },
  { id: "family-essentials", label: "Family Essentials", emoji: "👨‍👩‍👧" },
  { id: "gluten-free", label: "Gluten-Free", emoji: "🌾" },
  { id: "halal", label: "Halal", emoji: "☪️" },
  { id: "high-protein", label: "High Protein", emoji: "💪" },
  { id: "keto", label: "Keto", emoji: "🥑" },
  { id: "kosher", label: "Kosher", emoji: "✡️" },
  { id: "low-carb", label: "Low Carb", emoji: "🥗" },
  { id: "no-preference", label: "No Preference", emoji: "✓" },
  { id: "organic-preferred", label: "Organic", emoji: "🌿" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "vegetarian", label: "Vegetarian", emoji: "🥦" },
];

const FOOD_TYPES: { id: FoodTypeId; label: string; emoji: string }[] = [
  { id: "american", label: "American", emoji: "🍔" },
  { id: "asian", label: "Asian", emoji: "🍜" },
  { id: "chinese", label: "Chinese", emoji: "🥡" },
  { id: "comfort", label: "Comfort Foods", emoji: "🍲" },
  { id: "frozen", label: "Frozen", emoji: "🧊" },
  { id: "indian", label: "Indian", emoji: "🍛" },
  { id: "italian", label: "Italian", emoji: "🍝" },
  { id: "mediterranean", label: "Mediterranean", emoji: "🫙" },
  { id: "mexican", label: "Mexican", emoji: "🌮" },
  { id: "middle-eastern", label: "Middle Eastern", emoji: "🧆" },
  { id: "organic", label: "Organic", emoji: "🌿" },
  { id: "quick-meals", label: "Quick Meals", emoji: "⚡" },
  { id: "seafood", label: "Seafood", emoji: "🐟" },
  { id: "snacks", label: "Snacks", emoji: "🍿" },
  { id: "vegetarian-comfort", label: "Vegetarian Comfort", emoji: "🥘" },
];

const MOTIVATIONS: { id: MotivationId; label: string; emoji: string }[] = [
  { id: "birthday-week", label: "Birthday Week", emoji: "🎂" },
  { id: "budget-friendly", label: "Budget Friendly", emoji: "💰" },
  { id: "comfort-meals", label: "Comfort Meals", emoji: "🍲" },
  { id: "family-gathering", label: "Family Gathering", emoji: "👨‍👩‍👧" },
  { id: "fitness-goals", label: "Fitness Goals", emoji: "🏋️" },
  { id: "health-conscious", label: "Health Conscious", emoji: "🥗" },
  { id: "high-protein", label: "High Protein", emoji: "💪" },
  { id: "kids-lunch-prep", label: "Kids Lunch Prep", emoji: "🎒" },
  { id: "meal-prep", label: "Meal Prep", emoji: "📦" },
  { id: "quick-easy", label: "Quick & Easy", emoji: "⚡" },
  { id: "special-occasion", label: "Special Occasion", emoji: "🎉" },
  { id: "student-budget", label: "Student Budget", emoji: "📚" },
  { id: "vacation-prep", label: "Vacation Prep", emoji: "✈️" },
  { id: "weekly-essentials", label: "Weekly Essentials", emoji: "🛒" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

const Section = ({
  step,
  totalSteps,
  title,
  hint,
  children,
}: {
  step: number;
  totalSteps: number;
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
        <div className="flex-1">
          <p className="text-sm font-semibold">{title}</p>
          {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
        </div>
        <span className="text-[10px] text-muted-foreground">{step}/{totalSteps}</span>
      </div>
      <div>{children}</div>
    </CardContent>
  </Card>
);

const Chip = ({
  active,
  onClick,
  emoji,
  children,
}: {
  active: boolean;
  onClick: () => void;
  emoji?: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
      active
        ? "bg-walmart-blue text-primary-foreground border-walmart-blue"
        : "bg-background text-foreground border-border hover:bg-secondary",
    )}
  >
    {emoji && <span>{emoji}</span>}
    {children}
  </button>
);

// YNAB OAuth connect widget
const YnabConnect = ({
  connected,
  ynabBudget,
  onMockConnect,
}: {
  connected: boolean;
  ynabBudget: number | null;
  onMockConnect: () => void;
}) => {
  const hasClientId = !!import.meta.env.VITE_YNAB_CLIENT_ID;

  if (connected) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center gap-3">
        <CheckCircle2 className="size-5 text-green-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800">YNAB Connected</p>
          {ynabBudget !== null && (
            <p className="text-xs text-green-700">
              Grocery budget remaining: <strong>${ynabBudget.toFixed(2)}</strong>
            </p>
          )}
        </div>
        <Badge variant="outline" className="text-green-700 border-green-300 text-[10px]">Live</Badge>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-center gap-3">
        <span className="size-9 rounded-md flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "#85B934" }}>
          Y
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Connect YNAB</p>
          <p className="text-[11px] text-muted-foreground">Pull your grocery budget automatically</p>
        </div>
      </div>
      {hasClientId ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-[#85B934] text-[#85B934] hover:bg-[#85B934]/10"
          onClick={() => window.location.href = ynabAuthUrl()}
        >
          Connect with YNAB →
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full text-[10px]"
          onClick={onMockConnect}
        >
          Demo: Simulate YNAB connection
        </Button>
      )}
    </div>
  );
};

// AI generating state overlay
const AIGenerating = ({ explanation }: { explanation: string }) => (
  <Card className="bg-gradient-to-br from-walmart-blue to-walmart-blue-dark text-primary-foreground border-0">
    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
      <div className="relative">
        <div className="size-16 rounded-full bg-walmart-yellow/20 flex items-center justify-center">
          <Sparkles className="size-8 text-walmart-yellow animate-pulse" />
        </div>
        <Loader2 className="size-5 text-white absolute -bottom-1 -right-1 animate-spin" />
      </div>
      <div>
        <p className="font-bold text-lg">Building your basket…</p>
        <p className="text-sm text-white/80 mt-1">AI is picking the best items for you</p>
      </div>
      {explanation && (
        <p className="text-xs text-white/70 bg-white/10 rounded-lg p-3 text-left">{explanation}</p>
      )}
    </CardContent>
  </Card>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 8;

const AIOnboarding = () => {
  const nav = useNavigate();
  const location = useLocation();
  const { state, setPrefs, setBasket } = useStore();

  // If user explicitly restarted, skip the redirect below
  const didRestart = (location.state as { restart?: boolean } | null)?.restart === true;

  // If we already have a generated basket (and user didn't restart),
  // go straight back to results so they don't lose their work
  useEffect(() => {
    if (!didRestart && state.basket && state.basket.lines.length > 0 && state.onboarded) {
      nav("/results", {
        state: { prefs: state.prefs, strategy: state.basket.strategy },
        replace: true,
      });
    }
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const [brands, setBrands] = useState<string[]>(
    state.prefs.preferredBrands?.length
      ? state.prefs.preferredBrands
      : state.prefs.preferredBrand ? [state.prefs.preferredBrand] : [],
  );
  const SORTED_BRANDS = useMemo(() => [...ALL_BRANDS].sort((a, b) => a.localeCompare(b)), []);
  const toggleBrand = (b: string) =>
    setBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);

  // YNAB state — only pre-connect if budget just came in from OAuth redirect
  const ynabBudgetFromRedirect = (location.state as { ynabBudget?: number } | null)?.ynabBudget ?? null;
  const [ynabConnected, setYnabConnected] = useState(ynabBudgetFromRedirect !== null);
  const [ynabBudget, setYnabBudget] = useState<number | null>(ynabBudgetFromRedirect);

  // AI generation state
  const [generating, setGenerating] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");

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
  const effectiveBudget = ynabConnected && ynabBudget !== null ? ynabBudget : budget;
  const budgetPct = Math.min(100, (effectiveBudget / (weeklyBudget * weeks)) * 100);

  const valid = effectiveBudget >= 20 && totalPeople >= 1;

  const handleMockYnabConnect = () => {
    const mockRemaining = +(budget * 0.85).toFixed(2);
    setYnabConnected(true);
    setYnabBudget(mockRemaining);
    setBudgetSource("ynab");
  };

  const handleFinish = async () => {
    if (!valid || generating) return;

    const prefs: Preferences = {
      duration,
      budgetSource: ynabConnected ? "ynab" : budgetSource,
      weeklyBudget: +(effectiveBudget / weeks).toFixed(2),
      rawBudget: effectiveBudget,
      household: totalPeople,
      householdBreakdown: hh,
      diets,
      foodTypes,
      motivation,
      kitchenHave,
      avoidJunk,
      preferredBrand: brands[0],       // legacy compat
      preferredBrands: brands,
    };

    setPrefs(prefs);
    setGenerating(true);

    try {
      const result = await generateAIBasket(prefs);
      setAiExplanation(result.explanation);

      // Give user a moment to read the explanation
      await new Promise(r => setTimeout(r, 800));

      // Build the basket using the AI-selected IDs on the chosen strategy
      const allStrategies = buildAllStrategies(prefs, CATALOG);
      const baseBasket = allStrategies[result.strategy];

      // Filter to AI-selected items if AI was used and returned IDs
      const finalBasket = result.usedAI && result.selectedIds.length > 0
        ? {
            ...baseBasket,
            lines: baseBasket.lines.filter(l => result.selectedIds.includes(l.item.id)),
          }
        : baseBasket;

      setBasket(finalBasket);
      nav("/results", { state: { prefs, strategy: result.strategy } });
    } catch {
      // Graceful fallback
      const allStrategies = buildAllStrategies(prefs, CATALOG);
      setBasket(allStrategies.healthiest);
      nav("/results", { state: { prefs, strategy: "healthiest" } });
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <Screen title="AI Grocery Planner" subtitle="Building your basket…" hideTabs>
        <div className="flex flex-col gap-4 mt-4">
          <AIGenerating explanation={aiExplanation} />
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Analyzing your preferences…</p>
              <Progress value={aiExplanation ? 80 : 40} className="h-1.5" />
              <div className="flex flex-wrap gap-1 mt-2">
                {diets.slice(0, 3).map(d => <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>)}
                {foodTypes.slice(0, 2).map(f => <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="AI Grocery Planner" back subtitle="Let's plan groceries together">
      {/* Intro hero */}
      <Card className="bg-gradient-to-br from-walmart-blue to-walmart-blue-dark text-primary-foreground border-0">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className="size-5 text-walmart-yellow mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Hi! Let's build your basket together.</p>
            <p className="text-xs text-white/85 mt-1">
              Fill in a few details and our AI will build an optimized basket from this week's deals.
            </p>
          </div>
          {import.meta.env.VITE_OPENAI_API_KEY ? (
            <Badge className="shrink-0 bg-walmart-yellow text-walmart-blue-dark text-[10px] flex items-center gap-1">
              <Zap className="size-2.5" /> AI
            </Badge>
          ) : null}
        </CardContent>
      </Card>

      {/* 1 — Duration */}
      <Section step={1} totalSteps={TOTAL_STEPS} title="How long are we planning for?" hint="Pick the rhythm that fits your household.">
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
      </Section>

      {/* 2 — Budget */}
      <Section step={2} totalSteps={TOTAL_STEPS} title="Budget" hint="Set manually or pull from YNAB.">
        <div className="space-y-3">
          {/* Manual / YNAB toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setBudgetSource("manual"); setYnabConnected(false); }}
              className={cn(
                "rounded-lg border p-3 text-center transition",
                !ynabConnected ? "border-walmart-blue bg-walmart-blue/5" : "border-border bg-background hover:bg-secondary",
              )}
            >
              <p className="text-sm font-semibold">Manual</p>
              <p className="text-[10px] text-muted-foreground">I'll set my budget</p>
            </button>
            <button
              type="button"
              onClick={() => ynabConnected ? null : handleMockYnabConnect()}
              className={cn(
                "rounded-lg border p-3 text-center transition",
                ynabConnected ? "border-[#85B934] bg-[#85B934]/5" : "border-border bg-background hover:bg-secondary",
              )}
            >
              <p className="text-sm font-semibold" style={{ color: ynabConnected ? "#85B934" : undefined }}>YNAB</p>
              <p className="text-[10px] text-muted-foreground">{ynabConnected ? "Connected ✓" : "Pull from budget"}</p>
            </button>
          </div>

          {/* YNAB connect widget */}
          {!ynabConnected && (
            <YnabConnect
              connected={ynabConnected}
              ynabBudget={ynabBudget}
              onMockConnect={handleMockYnabConnect}
            />
          )}

          {ynabConnected && ynabBudget !== null && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-green-800">YNAB grocery budget remaining</p>
                <CheckCircle2 className="size-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">${ynabBudget.toFixed(2)}</p>
              <Progress value={budgetPct} className="h-1.5 bg-green-100 [&>div]:bg-green-500" />
            </div>
          )}

          {/* Budget input */}
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
                value={ynabConnected && ynabBudget !== null ? ynabBudget : budget}
                onChange={e => {
                  if (!ynabConnected) setBudget(+e.target.value || 0);
                }}
                readOnly={ynabConnected}
                className={cn("pl-7 text-lg font-semibold", ynabConnected && "bg-muted")}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              ≈ ${weeklyBudget}/week · for {weeks} week{weeks > 1 ? "s" : ""}
            </p>
            {effectiveBudget < 20 && <p className="text-xs text-destructive">Minimum $20 required.</p>}
          </div>
        </div>
      </Section>

      {/* 3 — Household */}
      <Section step={3} totalSteps={TOTAL_STEPS} title="How many people are we shopping for?" hint="We use this to estimate quantities.">
        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "adults" as const, label: "Adults", emoji: "👤" },
            { k: "seniors" as const, label: "Seniors", emoji: "👴" },
            { k: "kids" as const, label: "Kids", emoji: "👶" },
          ].map(({ k, label, emoji }) => (
            <div key={k} className="rounded-lg border border-border p-2">
              <Label className="text-[11px] text-muted-foreground">{emoji} {label}</Label>
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
        {totalPeople < 1 && <p className="text-xs text-destructive mt-2">Add at least one person.</p>}
      </Section>

      {/* 4 — Food Types */}
      <Section step={4} totalSteps={TOTAL_STEPS} title="What kind of foods do you enjoy?" hint="Pick a few to shape AI suggestions.">
        <div className="flex flex-wrap gap-2">
          {FOOD_TYPES.map(f => (
            <Chip key={f.id} active={foodTypes.includes(f.id)} onClick={() => toggleFood(f.id)} emoji={f.emoji}>
              {f.label}
            </Chip>
          ))}
        </div>
      </Section>

      {/* 5 — Diets */}
      <Section step={5} totalSteps={TOTAL_STEPS} title="Any dietary preferences?" hint="Multi-select. AI will respect these strictly.">
        <div className="flex flex-wrap gap-2">
          {DIETS.map(d => (
            <Chip key={d.id} active={diets.includes(d.id)} onClick={() => toggleDiet(d.id)} emoji={d.emoji}>
              {d.label}
            </Chip>
          ))}
        </div>
      </Section>

      {/* 6 — Motivation */}
      <Section step={6} totalSteps={TOTAL_STEPS} title="What's your main goal this shop?" hint="AI will prioritize items that match.">
        <div className="grid grid-cols-2 gap-2">
          {MOTIVATIONS.map(m => (
            <button
              key={m.id}
              onClick={() => setMotivation(m.id)}
              className={cn(
                "rounded-lg border p-2.5 text-left text-xs font-medium transition flex items-center gap-2",
                motivation === m.id
                  ? "border-walmart-blue bg-walmart-blue/5 text-walmart-blue"
                  : "border-border bg-background hover:bg-secondary",
              )}
            >
              <span className="text-base">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </Section>

      {/* 7 — Kitchen Have */}
      <Section step={7} totalSteps={TOTAL_STEPS} title="What's already in your kitchen?" hint="Skip buying things you already have.">
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
      <Section step={8} totalSteps={TOTAL_STEPS} title="Final preferences">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Avoid junk food</p>
              <p className="text-xs text-muted-foreground">
                {avoidJunk ? "Filtering out soda, chips, cookies." : "Snacks and treats included."}
              </p>
            </div>
            <Switch checked={avoidJunk} onCheckedChange={setAvoidJunk} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Preferred brands (optional){brands.length > 0 && <span className="ml-1 text-walmart-blue font-semibold">· {brands.length} selected</span>}
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SORTED_BRANDS.map(b => (
                <Chip key={b} active={brands.includes(b)} onClick={() => toggleBrand(b)}>
                  {b}
                </Chip>
              ))}
            </div>
            {brands.length > 0 && (
              <button
                type="button"
                onClick={() => setBrands([])}
                className="mt-2 text-[11px] text-muted-foreground hover:text-destructive transition"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Validation hints */}
      {!valid && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">
              {effectiveBudget < 20 ? "Set a budget of at least $20." : "Add at least one person to the household."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Button
        onClick={handleFinish}
        disabled={!valid || generating}
        className="w-full bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground h-12 font-semibold sticky bottom-2 shadow-lg"
      >
        {generating ? (
          <><Loader2 className="size-4 mr-2 animate-spin" /> Building basket…</>
        ) : (
          <><Sparkles className="size-4 mr-2" /> Build my basket{import.meta.env.VITE_OPENAI_API_KEY ? " with AI" : ""}</>
        )}
      </Button>
    </Screen>
  );
};

export default AIOnboarding;
