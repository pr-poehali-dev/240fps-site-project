import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Components, SelectKey, Part, COMPONENTS_API_URL, LABELS, STEPS } from "@/lib/pcParts";

const AUTH_KEY = "admin_authed";
const PWD_KEY = "admin_pwd";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Admin-Password": sessionStorage.getItem(PWD_KEY) || "",
  };
}

function PriceCell({ part, categoryKey, onSaved }: { part: Part; categoryKey: SelectKey; onSaved: () => void }) {
  const [value, setValue] = useState(String(part.price));
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(String(part.price)), [part.price]);

  const commit = async () => {
    const price = Number(value);
    if (!Number.isFinite(price) || price === part.price) {
      setValue(String(part.price));
      return;
    }
    setSaving(true);
    try {
      await fetch(COMPONENTS_API_URL, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ category: categoryKey, id: part.id, price }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Input
      type="number"
      value={value}
      disabled={saving}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      className="h-8 w-28 text-right text-base"
    />
  );
}

function AddRow({ categoryKey, onAdded }: { categoryKey: SelectKey; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!name.trim() || !price) return;
    setSaving(true);
    try {
      await fetch(COMPONENTS_API_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ category: categoryKey, name: name.trim(), price: Number(price) }),
      });
      setName("");
      setPrice("");
      onAdded();
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-t border-border">
      <td className="p-1.5 pl-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" className="h-8 text-base" />
      </td>
      <td className="p-1.5 pr-3">
        <div className="flex items-center gap-2 justify-end">
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Цена" className="h-8 w-24 text-right text-base" />
          <button onClick={add} disabled={saving || !name.trim() || !price} className="text-primary hover:opacity-70 transition-opacity disabled:opacity-30 shrink-0">
            <Icon name="Plus" size={20} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function CategoryCard({ categoryKey, components, onChanged }: { categoryKey: SelectKey; components: Components; onChanged: () => void }) {
  const info = LABELS[categoryKey];
  const parts = components[categoryKey];

  const remove = async (id: number) => {
    if (!confirm("Удалить позицию из справочника?")) return;
    await fetch(COMPONENTS_API_URL, {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ category: categoryKey, id }),
    });
    onChanged();
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40">
        <Icon name={info.icon} size={20} className="text-primary shrink-0" />
        <h2 className="font-semibold text-[1.3125rem]">{info.label}</h2>
        <span className="text-lg text-muted-foreground ml-auto">{parts.length}</span>
      </div>
      <div className="overflow-y-auto max-h-[420px]">
        <table className="w-full text-lg">
          <tbody>
            {parts.length === 0 && (
              <tr>
                <td className="p-3 text-center text-muted-foreground" colSpan={2}>Нет позиций</td>
              </tr>
            )}
            {parts.map((p, i) => (
              <tr key={p.id} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                <td className="p-1.5 pl-3 break-words">{p.name}</td>
                <td className="p-1.5 pr-3">
                  <div className="flex items-center gap-2 justify-end">
                    <PriceCell part={p} categoryKey={categoryKey} onSaved={onChanged} />
                    <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            <AddRow categoryKey={categoryKey} onAdded={onChanged} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PricesBoard() {
  const [components, setComponents] = useState<Components | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch(`${COMPONENTS_API_URL}?all=1`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setComponents)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

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
            <CategoryCard key={key} categoryKey={key} components={components} onChanged={load} />
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