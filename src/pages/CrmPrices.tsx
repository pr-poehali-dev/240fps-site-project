import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Components, SelectKey, COMPONENTS_API_URL, LABELS, STEPS, fmt } from "@/lib/pcParts";

const AUTH_KEY = "admin_authed";

function CategoryCard({ categoryKey, components }: { categoryKey: SelectKey; components: Components }) {
  const info = LABELS[categoryKey];
  const parts = components[categoryKey];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40">
        <Icon name={info.icon} size={16} className="text-primary shrink-0" />
        <h2 className="font-semibold text-sm">{info.label}</h2>
        <span className="text-xs text-muted-foreground ml-auto">{parts.length}</span>
      </div>
      <div className="overflow-y-auto max-h-[420px]">
        <table className="w-full text-xs">
          <tbody>
            {parts.length === 0 && (
              <tr>
                <td className="p-3 text-center text-muted-foreground" colSpan={2}>Нет позиций</td>
              </tr>
            )}
            {parts.map((p, i) => (
              <tr key={p.id} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                <td className="p-1.5 pl-3 break-words">{p.name}</td>
                <td className="p-1.5 pr-3 text-right font-medium whitespace-nowrap align-top">{fmt(p.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PricesBoard() {
  const [components, setComponents] = useState<Components | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(COMPONENTS_API_URL)
      .then((r) => r.json())
      .then(setComponents)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold uppercase">Цены на комплектующие</h1>
        <div className="flex items-center gap-4">
          <Link to="/admin/crm" className="text-sm text-primary hover:underline flex items-center gap-1">
            <Icon name="ArrowLeft" size={16} /> В CRM
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm py-10 text-center">Загрузка...</div>
      ) : !components ? (
        <div className="text-muted-foreground text-sm py-10 text-center">Не удалось загрузить данные</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STEPS.map((key) => (
            <CategoryCard key={key} categoryKey={key} components={components} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CrmPrices() {
  const authed = sessionStorage.getItem(AUTH_KEY) === "1";
  if (!authed) return <Navigate to="/admin/crm" replace />;
  return <PricesBoard />;
}