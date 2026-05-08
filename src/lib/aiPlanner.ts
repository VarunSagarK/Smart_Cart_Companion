/**
 * AI Grocery Planner — OpenAI integration.
 *
 * Takes user preferences + the mock catalog and asks GPT to:
 *  1. Rank/select the best items from the catalog
 *  2. Return a structured basket JSON
 *  3. Provide a short personalized explanation
 *
 * We send the catalog as a compact JSON array so GPT can reason over real
 * product data rather than hallucinating items.
 *
 * When VITE_OPENAI_API_KEY is not set, falls back to the local budgetEngine
 * so the app stays fully functional without a key.
 */

import OpenAI from "openai";
import { buildAllStrategies } from "./budgetEngine";
import { CATALOG } from "./mockCatalog";
import type { BasketStrategy, CatalogItem, Preferences } from "./types";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

// Only instantiate if key is present — avoids throwing on missing key
const openai = apiKey ? new OpenAI({ apiKey, dangerouslyAllowBrowser: true }) : null;

export interface AIPlannerResult {
  strategy: BasketStrategy;
  explanation: string;
  selectedIds: string[];
  usedAI: boolean;
}

const SYSTEM_PROMPT = `You are an expert grocery planner for Walmart Canada.
Given a user's preferences and a product catalog, select the best items and return a JSON object.

Rules:
- Only select items from the provided catalog (use exact item IDs).
- Stay within the total budget (weeklyBudget * weeks).
- Respect dietary restrictions strictly.
- Prefer items on sale when possible.
- Cover all major food categories (produce, dairy, protein, pantry, etc.).
- Return ONLY valid JSON, no markdown.

Response format:
{
  "strategy": "healthiest" | "lowest-cost" | "bulk-saver" | "family" | "brand",
  "explanation": "2-3 sentence personalized explanation of the basket",
  "selectedIds": ["item-id-1", "item-id-2", ...]
}`;

function buildUserPrompt(prefs: Preferences, catalog: CatalogItem[]): string {
  const weeks = prefs.duration === "monthly" ? 4 : prefs.duration === "biweekly" ? 2 : 1;
  const totalBudget = prefs.weeklyBudget * weeks;

  const compactCatalog = catalog.map(i => ({
    id: i.id,
    name: i.name,
    category: i.category,
    price: i.price,
    onSale: i.onSale,
    healthScore: i.healthScore,
    tags: i.tags,
    bulk: i.bulk,
  }));

  return JSON.stringify({
    preferences: {
      budget: `$${totalBudget} for ${weeks} week(s)`,
      household: prefs.householdBreakdown ?? prefs.household,
      diets: prefs.diets,
      foodTypes: prefs.foodTypes,
      motivation: prefs.motivation,
      avoidJunk: prefs.avoidJunk,
      preferredBrand: prefs.preferredBrand,
    },
    catalog: compactCatalog,
  });
}

export async function generateAIBasket(prefs: Preferences): Promise<AIPlannerResult> {
  // Fallback: no API key → use local engine
  if (!openai) {
    const all = buildAllStrategies(prefs, CATALOG);
    const strategy: BasketStrategy = prefs.motivation === "budget-friendly" || prefs.motivation === "student-budget"
      ? "lowest-cost"
      : prefs.diets.includes("high-protein") || prefs.motivation === "fitness-goals"
        ? "healthiest"
        : prefs.household > 3 || prefs.motivation === "family-gathering"
          ? "family"
          : prefs.motivation === "meal-prep"
            ? "bulk-saver"
            : "healthiest";

    return {
      strategy,
      explanation: `I've built your ${strategy.replace("-", " ")} basket based on your $${prefs.weeklyBudget}/week budget for ${prefs.household} people. Add your OpenAI API key to VITE_OPENAI_API_KEY for AI-personalized recommendations.`,
      selectedIds: all[strategy].lines.map(l => l.item.id),
      usedAI: false,
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(prefs, CATALOG) },
      ],
      temperature: 0.4,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as {
      strategy?: string;
      explanation?: string;
      selectedIds?: string[];
    };

    // Validate IDs against actual catalog
    const validIds = new Set(CATALOG.map(i => i.id));
    const selectedIds = (parsed.selectedIds ?? []).filter(id => validIds.has(id));

    return {
      strategy: (parsed.strategy as BasketStrategy) ?? "healthiest",
      explanation: parsed.explanation ?? "Here's your personalized basket.",
      selectedIds,
      usedAI: true,
    };
  } catch (err) {
    console.error("[AI Planner] OpenAI call failed, falling back to local engine:", err);
    const all = buildAllStrategies(prefs, CATALOG);
    return {
      strategy: "healthiest",
      explanation: "AI planning is temporarily unavailable. Here's your healthiest basket instead.",
      selectedIds: all.healthiest.lines.map(l => l.item.id),
      usedAI: false,
    };
  }
}
