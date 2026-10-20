import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: boolean;
}

export const StatCard = ({ label, value, hint, accent }: Props) => (
  <Card>
    <CardContent className="p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={`text-2xl font-bold mt-1 ${
          accent ? "text-walmart-blue" : "text-foreground"
        }`}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </CardContent>
  </Card>
);
