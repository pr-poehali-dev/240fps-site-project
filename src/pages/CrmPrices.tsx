import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Components, SelectKey, Part, COMPONENTS_API_URL, LABELS, STEPS } from "@/lib/pcParts";

const SOCKET_OPTIONS = [
  { value: "lga1700", label: "LGA1700" },
  { value: "lga1851", label: "LGA1851" },
  { value: "am4", label: "AM4" },
  { value: "am5", label: "AM5" },
];

const RAM_TYPE_OPTIONS = [
  { value: "ddr4", label: "DDR4" },
  { value: "ddr5", label: "DDR5" },
];

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

function NameCell({ part, categoryKey, onSaved }: { part: Part; categoryKey: SelectKey; onSaved: () => void }) {
  const [value, setValue] = useState(part.name);
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(part.name), [part.name]);

  const commit = async () => {
    const name = value.trim();
    if (!name || name === part.name) {
      setValue(part.name);
      return;
    }
    setSaving(true);
    try {
      await fetch(COMPONENTS_API_URL, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ category: categoryKey, id: part.id, name }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Input
      value={value}
      disabled={saving}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      className="h-8 text-base border-transparent bg-transparent hover:border-border focus:border-primary px-2 -ml-2"
    />
  );
}

function SocketSelect({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border border-input bg-background px-2 text-sm shrink-0"
    >
      <option value="">{placeholder}</option>
      {SOCKET_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function RamTypeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border border-input bg-background px-2 text-sm shrink-0"
    >
      <option value="">Тип памяти</option>
      {RAM_TYPE_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function SocketCell({ part, categoryKey, onSaved }: { part: Part; categoryKey: SelectKey; onSaved: () => void }) {
  const [value, setValue] = useState(part.socket || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(part.socket || ""), [part.socket]);

  const commit = async (next: string) => {
    if (next === (part.socket || "")) return;
    setSaving(true);
    setValue(next);
    try {
      await fetch(COMPONENTS_API_URL, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ category: categoryKey, id: part.id, socket: next || null }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return <SocketSelect value={value} onChange={commit} placeholder="Сокет" />;
}

function RamTypeCell({ part, categoryKey, onSaved }: { part: Part; categoryKey: SelectKey; onSaved: () => void }) {
  const [value, setValue] = useState(part.ram_type || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(part.ram_type || ""), [part.ram_type]);

  const commit = async (next: string) => {
    if (next === (part.ram_type || "")) return;
    setSaving(true);
    setValue(next);
    try {
      await fetch(COMPONENTS_API_URL, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ category: categoryKey, id: part.id, ram_type: next || null }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return <RamTypeSelect value={value} onChange={commit} />;
}

function AddRow({ categoryKey, onAdded }: { categoryKey: SelectKey; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [socket, setSocket] = useState("");
  const [ramType, setRamType] = useState("");
  const [saving, setSaving] = useState(false);

  const needsSocket = categoryKey === "cpu" || categoryKey === "motherboard";
  const needsRamType = categoryKey === "ram";

  const add = async () => {
    if (!name.trim() || !price) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { category: categoryKey, name: name.trim(), price: Number(price) };
      if (needsSocket && socket) body.socket = socket;
      if (needsRamType && ramType) body.ram_type = ramType;
      await fetch(COMPONENTS_API_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      setName("");
      setPrice("");
      setSocket("");
      setRamType("");
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
          {needsSocket && <SocketSelect value={socket} onChange={setSocket} placeholder="Сокет" />}
          {needsRamType && <RamTypeSelect value={ramType} onChange={setRamType} />}
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
  const [pendingDelete, setPendingDelete] = useState<Part | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmRemove = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await fetch(COMPONENTS_API_URL, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ category: categoryKey, id: pendingDelete.id }),
      });
      onChanged();
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
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
                <td className="p-1.5 pl-3">
                  <NameCell part={p} categoryKey={categoryKey} onSaved={onChanged} />
                </td>
                <td className="p-1.5 pr-3">
                  <div className="flex items-center gap-2 justify-end">
                    {(categoryKey === "cpu" || categoryKey === "motherboard") && (
                      <SocketCell part={p} categoryKey={categoryKey} onSaved={onChanged} />
                    )}
                    {categoryKey === "ram" && <RamTypeCell part={p} categoryKey={categoryKey} onSaved={onChanged} />}
                    <PriceCell part={p} categoryKey={categoryKey} onSaved={onChanged} />
                    <button onClick={() => setPendingDelete(p)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
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

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить позицию?</AlertDialogTitle>
            <AlertDialogDescription>
              «{pendingDelete?.name}» будет удалена из справочника. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} disabled={deleting}>
              {deleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PricesBoard() {
  const [components, setComponents] = useState<Components | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch(COMPONENTS_API_URL)
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