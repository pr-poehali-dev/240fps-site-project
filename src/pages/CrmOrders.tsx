import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ORDERS_URL = "https://functions.poehali.dev/f37754c2-ef7c-40dc-991d-898c9d3732b4";
const COMPONENTS_URL = "https://functions.poehali.dev/5cfc8ecc-4c82-4e93-b6a3-36c98ad09e79";
const AUTH_URL = "https://functions.poehali.dev/e2bd2fe3-82aa-49a6-8f39-0bc794e6f497";
const AUTH_KEY = "admin_authed";
const PWD_KEY = "admin_pwd";
const ROLE_KEY = "admin_role";

const CITIES = ["Омск", "Краснодар", "Тюмень"] as const;
type City = (typeof CITIES)[number];

type Availability = "in_stock" | "wb" | "ozon" | "avito" | "dns" | "citilink";

const AVAILABILITY_LABELS: Record<Availability, string> = {
  in_stock: "На складе",
  wb: "WB",
  ozon: "Ozon",
  avito: "Авито",
  dns: "ДНС",
  citilink: "Ситилинк",
};

const AVAILABILITY_ROW_CLASS: Record<Availability, string> = {
  in_stock: "bg-green-100 dark:bg-green-950/40",
  wb: "bg-purple-100 dark:bg-purple-950/40",
  ozon: "bg-blue-100 dark:bg-blue-950/40",
  avito: "bg-sky-100 dark:bg-sky-950/40",
  dns: "bg-orange-100 dark:bg-orange-950/40",
  citilink: "bg-amber-100/70 dark:bg-amber-950/30",
};

type OrderItem = {
  id: number;
  order_id: number;
  component_name: string;
  price: number;
  cost_price: number;
  availability: Availability;
  delivery_date: string | null;
  sort_order: number;
};

type Order = {
  id: number;
  city: string;
  customer_name: string;
  customer_phone: string;
  final_date: string | null;
  total_price: number;
  assembly_cost: number;
  parts_cost_price: number;
  status: string;
  sort_order: number;
  created_at: string | null;
  items: OrderItem[];
};

type ComponentPart = { id: number; name: string; price: number };
type ComponentsData = {
  cpu: ComponentPart[];
  motherboard: ComponentPart[];
  ram: ComponentPart[];
  gpu: ComponentPart[];
  ssd: ComponentPart[];
  cooler: ComponentPart[];
  psu: ComponentPart[];
  case: ComponentPart[];
};

const fmt = (n: number) => n.toLocaleString("ru-RU") + " \u20bd";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Admin-Password": sessionStorage.getItem(PWD_KEY) || "",
  };
}

function allParts(comps: ComponentsData | null): ComponentPart[] {
  if (!comps) return [];
  return [
    ...comps.cpu, ...comps.motherboard, ...comps.ram, ...comps.gpu,
    ...comps.ssd, ...comps.cooler, ...comps.psu, ...comps.case,
  ];
}

function NewOrderDialog({
  city,
  open,
  onOpenChange,
  onCreated,
}: {
  city: City;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [assemblyCost, setAssemblyCost] = useState("");
  const [partsCost, setPartsCost] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName(""); setPhone(""); setFinalDate("");
    setTotalPrice(""); setAssemblyCost(""); setPartsCost("");
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`${ORDERS_URL}?resource=orders`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          city,
          customer_name: name,
          customer_phone: phone,
          final_date: finalDate || null,
          total_price: Number(totalPrice) || 0,
          assembly_cost: Number(assemblyCost) || 0,
          parts_cost_price: Number(partsCost) || 0,
        }),
      });
      reset();
      onOpenChange(false);
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новая сборка — {city}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Имя заказчика</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Иванов" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Номер телефона</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 900 000-00-00" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Финальная дата</label>
            <Input type="date" value={finalDate} onChange={(e) => setFinalDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Итоговая стоимость</label>
            <Input type="number" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Стоимость сборки</label>
            <Input type="number" value={assemblyCost} onChange={(e) => setAssemblyCost(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Себестоимость запчастей</label>
            <Input type="number" value={partsCost} onChange={(e) => setPartsCost(e.target.value)} placeholder="0" />
          </div>
          <Button className="w-full" disabled={saving} onClick={save}>
            {saving ? "Сохранение..." : "Создать сборку"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ItemRow({
  item,
  parts,
  onChange,
  onRemove,
}: {
  item: OrderItem;
  parts: ComponentPart[];
  onChange: (patch: Partial<OrderItem>) => void;
  onRemove: () => void;
}) {
  const rowClass = AVAILABILITY_ROW_CLASS[item.availability] || "";

  const handleSelectPart = (val: string) => {
    if (val === "__custom__") return;
    const part = parts.find((p) => String(p.id) === val);
    if (part) onChange({ component_name: part.name, price: part.price });
  };

  return (
    <tr className={rowClass}>
      <td className="p-1.5 min-w-[220px]">
        <div className="flex flex-col gap-1">
          <Select onValueChange={handleSelectPart}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Выбрать из базы..." />
            </SelectTrigger>
            <SelectContent>
              {parts.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name} — {fmt(p.price)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="h-8 text-xs"
            value={item.component_name}
            onChange={(e) => onChange({ component_name: e.target.value })}
            placeholder="Название комплектующего"
          />
        </div>
      </td>
      <td className="p-1.5 w-28">
        <Input
          type="number"
          className="h-8 text-xs"
          value={item.price}
          onChange={(e) => onChange({ price: Number(e.target.value) || 0 })}
        />
      </td>
      <td className="p-1.5 w-28">
        <Input
          type="number"
          className="h-8 text-xs"
          value={item.cost_price}
          onChange={(e) => onChange({ cost_price: Number(e.target.value) || 0 })}
        />
      </td>
      <td className="p-1.5 w-36">
        <Select value={item.availability} onValueChange={(v) => onChange({ availability: v as Availability })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(AVAILABILITY_LABELS) as Availability[]).map((k) => (
              <SelectItem key={k} value={k}>{AVAILABILITY_LABELS[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-1.5 w-36">
        <Input
          type="date"
          className="h-8 text-xs"
          value={item.delivery_date || ""}
          onChange={(e) => onChange({ delivery_date: e.target.value || null })}
        />
      </td>
      <td className="p-1.5 w-8">
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
          <Icon name="X" size={16} />
        </button>
      </td>
    </tr>
  );
}

function OrderCard({
  order,
  parts,
  onRefresh,
}: {
  order: Order;
  parts: ComponentPart[];
  onRefresh: () => void;
}) {
  const [local, setLocal] = useState(order);
  const [saving, setSaving] = useState(false);

  useEffect(() => setLocal(order), [order]);

  const saveOrderField = async (patch: Partial<Order>) => {
    setLocal((prev) => ({ ...prev, ...patch }));
    await fetch(`${ORDERS_URL}?resource=orders`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ id: order.id, ...patch }),
    });
  };

  const addItem = async () => {
    await fetch(`${ORDERS_URL}?resource=items`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ order_id: order.id, component_name: "", price: 0, cost_price: 0, availability: "in_stock" }),
    });
    onRefresh();
  };

  const updateItem = async (itemId: number, patch: Partial<OrderItem>) => {
    setLocal((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
    }));
    await fetch(`${ORDERS_URL}?resource=items`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ id: itemId, ...patch }),
    });
  };

  const removeItem = async (itemId: number) => {
    setLocal((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== itemId) }));
    await fetch(`${ORDERS_URL}?resource=items`, {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ id: itemId }),
    });
  };

  const issue = async () => {
    setSaving(true);
    try {
      await fetch(`${ORDERS_URL}?resource=orders`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ id: order.id, issue: true }),
      });
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const removeOrder = async () => {
    if (!confirm("Удалить эту сборку?")) return;
    await fetch(`${ORDERS_URL}?resource=orders`, {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ id: order.id }),
    });
    onRefresh();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Заказчик</label>
          <Input
            className="h-8 text-sm"
            value={local.customer_name}
            onChange={(e) => setLocal((p) => ({ ...p, customer_name: e.target.value }))}
            onBlur={() => saveOrderField({ customer_name: local.customer_name })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Телефон</label>
          <Input
            className="h-8 text-sm"
            value={local.customer_phone}
            onChange={(e) => setLocal((p) => ({ ...p, customer_phone: e.target.value }))}
            onBlur={() => saveOrderField({ customer_phone: local.customer_phone })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Финальная дата</label>
          <Input
            type="date"
            className="h-8 text-sm"
            value={local.final_date || ""}
            onChange={(e) => setLocal((p) => ({ ...p, final_date: e.target.value }))}
            onBlur={() => saveOrderField({ final_date: local.final_date })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Итоговая стоимость</label>
          <Input
            type="number"
            className="h-8 text-sm"
            value={local.total_price}
            onChange={(e) => setLocal((p) => ({ ...p, total_price: Number(e.target.value) || 0 }))}
            onBlur={() => saveOrderField({ total_price: local.total_price })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Стоимость сборки</label>
          <Input
            type="number"
            className="h-8 text-sm"
            value={local.assembly_cost}
            onChange={(e) => setLocal((p) => ({ ...p, assembly_cost: Number(e.target.value) || 0 }))}
            onBlur={() => saveOrderField({ assembly_cost: local.assembly_cost })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Себестоимость запчастей</label>
          <Input
            type="number"
            className="h-8 text-sm"
            value={local.parts_cost_price}
            onChange={(e) => setLocal((p) => ({ ...p, parts_cost_price: Number(e.target.value) || 0 }))}
            onBlur={() => saveOrderField({ parts_cost_price: local.parts_cost_price })}
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground text-left">
              <th className="p-1.5 font-medium">Комплектующее</th>
              <th className="p-1.5 font-medium">Цена</th>
              <th className="p-1.5 font-medium">Себест.</th>
              <th className="p-1.5 font-medium">Наличие</th>
              <th className="p-1.5 font-medium">Поставка</th>
              <th className="p-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {local.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                parts={parts}
                onChange={(patch) => updateItem(item.id, patch)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addItem}
        className="text-xs text-primary hover:underline flex items-center gap-1"
      >
        <Icon name="Plus" size={14} /> Добавить комплектующее
      </button>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <button onClick={removeOrder} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
          Удалить
        </button>
        <Button size="sm" disabled={saving} onClick={issue}>
          <Icon name="Check" size={14} className="mr-1" /> Выдать ПК
        </Button>
      </div>
    </div>
  );
}

function CityColumn({
  city,
  orders,
  parts,
  onRefresh,
}: {
  city: City;
  orders: Order[];
  parts: ComponentPart[];
  onRefresh: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const cityOrders = orders.filter((o) => o.city === city);

  return (
    <div className="flex-1 min-w-[340px] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold uppercase">{city}</h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Icon name="Plus" size={14} className="mr-1" /> Добавить сборку
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {cityOrders.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-10 border border-dashed border-border rounded-xl">
            Нет активных сборок
          </div>
        )}
        {cityOrders.map((order) => (
          <OrderCard key={order.id} order={order} parts={parts} onRefresh={onRefresh} />
        ))}
      </div>
      <NewOrderDialog city={city} open={dialogOpen} onOpenChange={setDialogOpen} onCreated={onRefresh} />
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (role: string) => void }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem(AUTH_KEY, "1");
        sessionStorage.setItem(PWD_KEY, password);
        sessionStorage.setItem(ROLE_KEY, data.role || "admin");
        onLogin(data.role || "admin");
      } else {
        setError("Неверный логин или пароль");
      }
    } catch {
      setError("Ошибка подключения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm space-y-4">
        <h1 className="font-bold text-xl text-center mb-2">Вход в CRM</h1>
        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          autoComplete="current-password"
        />
        {error && <div className="text-destructive text-sm text-center">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}

function CrmBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [components, setComponents] = useState<ComponentsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch(`${ORDERS_URL}?resource=orders&status=active`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOrders(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetch(COMPONENTS_URL)
      .then((r) => r.json())
      .then(setComponents)
      .catch(() => {});
  }, []);

  const parts = allParts(components);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold uppercase">CRM — Заказы на сборку</h1>
        <button
          onClick={() => { sessionStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(PWD_KEY); sessionStorage.removeItem(ROLE_KEY); window.location.reload(); }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Выйти
        </button>
      </div>
      {loading ? (
        <div className="text-muted-foreground text-sm py-10 text-center">Загрузка...</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {CITIES.map((city) => (
            <CityColumn key={city} city={city} orders={orders} parts={parts} onRefresh={load} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CrmOrders() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === "1");

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <CrmBoard />;
}