import { useState } from "react";
import { CatalogItem } from "@/lib/types";
import { CATEGORY_EMOJI } from "@/lib/mockCatalog";
import { cn } from "@/lib/utils";

interface Props {
  item: Pick<CatalogItem, "image" | "category" | "name">;
  className?: string;
  rounded?: "sm" | "md" | "lg";
}

/**
 * Renders a realistic product image with graceful emoji fallback.
 * Used across Search, AI Basket, Cart, My Items, Wishlist & Index.
 */
export const ProductImage = ({ item, className, rounded = "md" }: Props) => {
  const [errored, setErrored] = useState(false);
  const radius = rounded === "lg" ? "rounded-lg" : rounded === "sm" ? "rounded" : "rounded-md";

  if (!item.image || errored) {
    return (
      <div className={cn("bg-secondary flex items-center justify-center", radius, className)}>
        <span className="text-3xl leading-none">{CATEGORY_EMOJI[item.category] ?? "🛒"}</span>
      </div>
    );
  }

  return (
    <div className={cn("bg-secondary overflow-hidden", radius, className)}>
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        onError={() => setErrored(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
