import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ORDERS_URL = "https://functions.poehali.dev/f37754c2-ef7c-40dc-991d-898c9d3732b4";
const AUTH_KEY = "admin_authed";
const PWD_KEY = "admin_pwd";

const CITIES = ["Омск", "Краснодар", "Тюмень"] as const;

const MONTH_LABELS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

type OrderItem = {
  id: number;
  component_name: string;
  price: number;
  cost_price: number;
};

type IssuedOrder = {
  id: number;
  city: string;
  customer_name: string;
  customer_phone: string;
  total_price: number;
  assembly_cost: number;
  parts_cost_price: number;
  order_number: string | null;
  issued_at: string | null;
  items: OrderItem[];
};

const fmt = (n: number) => n.toLocaleString("ru-RU") + " \u20bd";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Admin-Password": sessionStorage.getItem(PWD_KEY) || "",
  };
}

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return `${MONTH_LABELS[Number(m) - 1]} ${y}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function CrmIssuedOrders() {
  const authed = sessionStorage.getItem(AUTH_KEY) === "1";
  const [orders, setOrders] = useState<IssuedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  useEffect(() => {
    if (!authed) return;
    fetch(`${ORDERS_URL}?resource=orders&status=issued`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOrders(data); })
      .finally(() => setLoading(false));
  }, [authed]);

  if (!authed) return <Navigate to="/admin/crm" replace />;

  const months = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => { if (o.issued_at) set.add(monthKey(o.issued_at)); });
    return Array.from(set).sort().reverse();
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (cityFilter !== "all" && o.city !== cityFilter) return false;
      if (monthFilter !== "all" && (!o.issued_at || monthKey(o.issued_at) !== monthFilter)) return false;
      return true;
    });
  }, [orders, cityFilter, monthFilter]);

  const totals = useMemo(() => {
    const revenue = filtered.reduce((sum, o) => sum + (o.total_price || 0), 0);
    const cost = filtered.reduce((sum, o) => sum + (o.parts_cost_price || 0) + (o.assembly_cost || 0), 0);
    return { count: filtered.length, revenue, profit: revenue - cost };
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/crm" className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </Link>
          <h1 className="font-display text-3xl font-bold uppercase">Выданные заказы</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue placeholder="Город" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все города</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-48 h-9 text-sm">
            <SelectValue placeholder="Месяц" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все месяцы</SelectItem>
            {months.map((m) => (
              <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Выдано заказов</div>
          <div className="text-2xl font-bold">{totals.count}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Выручка</div>
          <div className="text-2xl font-bold">{fmt(totals.revenue)}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Прибыль (оценочно)</div>
          <div className="text-2xl font-bold">{fmt(totals.profit)}</div>
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm py-10 text-center">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border rounded-xl">
          Нет выданных заказов за выбранный период
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-left border-b border-border">
                <th className="p-2 font-medium">№ заказа</th>
                <th className="p-2 font-medium">Город</th>
                <th className="p-2 font-medium">Заказчик</th>
                <th className="p-2 font-medium">Телефон</th>
                <th className="p-2 font-medium">Дата выдачи</th>
                <th className="p-2 font-medium text-right">Итог</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border/50">
                  <td className="p-2 font-medium">{o.order_number || "—"}</td>
                  <td className="p-2">{o.city}</td>
                  <td className="p-2">{o.customer_name}</td>
                  <td className="p-2">{o.customer_phone}</td>
                  <td className="p-2">{o.issued_at ? formatDate(o.issued_at) : "—"}</td>
                  <td className="p-2 text-right font-medium">{fmt(o.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}