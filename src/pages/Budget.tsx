import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Screen } from "@/components/Screen";
import { useDemoStore } from "@/hooks/useDemoStore";
import { optimizeBasket } from "@/lib/budgetEngine";
import { CATALOG } from "@/lib/mockCatalog";
import { cn } from "@/lib/utils";

const DIETS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "low-sugar", label: "Low-sugar" },
];

const Budget = () => {
  const nav = useNavigate();
  const { state, setPrefs, setBasket } = useDemoStore();
  const [budget, setBudget] = useState(state.prefs.weeklyBudget);
  const [household, setHousehold] = useState(state.prefs.household);
  const [diets, setDiets] = useState<string[]>(state.prefs.diets);
  const [avoidJunk, setAvoidJunk] = useState(state.prefs.avoidJunk);

  const toggleDiet = (id: string) =>
    setDiets(d => (d.includes(id) ? d.filter(x => x !== id) : [...d, id]));

  const handleGenerate = () => {
    const prefs = { weeklyBudget: budget, household, diets, avoidJunk };
    setPrefs(prefs);
    const basket = optimizeBasket(prefs, CATALOG);
    setBasket(basket);
    nav("/basket");
  };

  return (
    <Screen title="Set Your Budget" back subtitle="We'll do the math">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label htmlFor="budget" className="text-sm">Weekly grocery budget</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="budget"
                type="number"
                min={20}
                value={budget}
                onChange={e => setBudget(+e.target.value || 0)}
                className="pl-7 text-lg font-semibold"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="household" className="text-sm">Household size</Label>
            <Input
              id="household"
              type="number"
              min={1}
              max={10}
              value={household}
              onChange={e => setHousehold(+e.target.value || 1)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <Label className="text-sm">Dietary preferences</Label>
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
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Avoid junk food</p>
            <p className="text-xs text-muted-foreground">
              Hide chips, soda, and cookies from your basket.
            </p>
          </div>
          <Switch checked={avoidJunk} onCheckedChange={setAvoidJunk} />
        </CardContent>
      </Card>

      <Button
        onClick={handleGenerate}
        className="w-full bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground h-12 text-base font-semibold"
      >
        Build My AI Basket
      </Button>
    </Screen>
  );
};

export default Budget;
