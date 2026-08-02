import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
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
const AUTH_KEY = "admin_authed";
const PWD_KEY = "admin_pwd";
const ROLE_KEY = "admin_role";

const CITIES = ["Омск", "Краснодар", "Тюмень"] as const;

const ROLE_CITY: Record<string, string> = {
  tyumen: "Тюмень",
};

const MONTH_LABELS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const CATEGORY_LABELS: Record<string, string> = {
  cpu: "Процессор",
  motherboard: "Материнская плата",
  ram: "Память",
  gpu: "Видеокарта",
  ssd: "SSD",
  cooler: "Охлаждение",
  psu: "Блок питания",
  case: "Корпус",
};

type OrderItem = {
  id: number;
  component_name: string;
  price: number;
  cost_price: number;
  category: string | null;
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
  comment: string;
  warranty_number: string | null;
  warranty_url: string | null;
  final_date: string | null;
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

function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
}: {
  order: IssuedOrder | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!order) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Заказ {order.order_number || `№${order.id}`} — {order.city}</DialogTitle>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Заказчик</div>
            <div className="font-medium">{order.customer_name || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Телефон</div>
            <div className="font-medium">{order.customer_phone || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Дата выдачи</div>
            <div className="font-medium">{order.issued_at ? formatDate(order.issued_at) : "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Гарантийный талон</div>
            <div className="font-medium">
              {order.warranty_url ? (
                <a href={order.warranty_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  №{order.warranty_number}
                </a>
              ) : "—"}
            </div>
          </div>
        </div>

        {order.comment && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Комментарий</div>
            <div className="text-sm bg-muted/50 rounded-lg p-2">{order.comment}</div>
          </div>
        )}

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground text-left">
                <th className="p-1.5 font-medium">Комплектующее</th>
                <th className="p-1.5 font-medium text-right">Цена</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} className="border-t border-border/50">
                  <td className="p-1.5">
                    {it.category && <span className="text-muted-foreground">{CATEGORY_LABELS[it.category] || it.category}: </span>}
                    {it.component_name}
                  </td>
                  <td className="p-1.5 text-right">{fmt(it.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-6 pt-2 border-t border-border text-sm">
          <div>Сборка: <span className="font-medium">{fmt(order.assembly_cost)}</span></div>
          <div>Итого: <span className="font-semibold">{fmt(order.total_price)}</span></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CrmIssuedOrders() {
  const authed = sessionStorage.getItem(AUTH_KEY) === "1";
  const role = sessionStorage.getItem(ROLE_KEY) || "admin";
  const visibleCities = ROLE_CITY[role] ? [ROLE_CITY[role]] : CITIES;
  const [orders, setOrders] = useState<IssuedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [detailsOrder, setDetailsOrder] = useState<IssuedOrder | null>(null);

  const load = () => {
    fetch(`${ORDERS_URL}?resource=orders&status=issued`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOrders(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authed) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  if (!authed) return <Navigate to="/admin/crm" replace />;

  const months = Array.from(new Set(orders.filter((o) => o.issued_at).map((o) => monthKey(o.issued_at!)))).sort().reverse();

  const filtered = orders.filter((o) => {
    if (cityFilter !== "all" && o.city !== cityFilter) return false;
    if (monthFilter !== "all" && (!o.issued_at || monthKey(o.issued_at) !== monthFilter)) return false;
    return true;
  });

  const totals = {
    count: filtered.length,
    revenue: filtered.reduce((sum, o) => sum + (o.total_price || 0), 0),
    profit: filtered.reduce((sum, o) => sum + (o.total_price || 0) - (o.parts_cost_price || 0) - (o.assembly_cost || 0), 0),
  };

  const removeOrder = async (order: IssuedOrder) => {
    if (!confirm(`Удалить заказ ${order.order_number || order.id}? Это действие необратимо.`)) return;
    await fetch(`${ORDERS_URL}?resource=orders`, {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ id: order.id }),
    });
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
  };

  const exportToExcel = () => {
    const rows = filtered.map((o) => ({
      "№ заказа": o.order_number || "",
      "Город": o.city,
      "Заказчик": o.customer_name,
      "Телефон": o.customer_phone,
      "Дата выдачи": o.issued_at ? formatDate(o.issued_at) : "",
      "Комплектующие": o.parts_cost_price,
      "Сборка": o.assembly_cost,
      "Итого": o.total_price,
      "Гарантийный номер": o.warranty_number || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Выданные заказы");
    const suffix = monthFilter !== "all" ? monthLabel(monthFilter).replace(" ", "_") : "все";
    XLSX.writeFile(wb, `Выданные_заказы_${suffix}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/crm" className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </Link>
          <h1 className="font-display text-3xl font-bold uppercase">Выданные заказы</h1>
        </div>
        <Button size="sm" variant="outline" onClick={exportToExcel} disabled={filtered.length === 0}>
          <Icon name="FileSpreadsheet" size={14} className="mr-1" /> Экспорт в Excel
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {visibleCities.length > 1 && (
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="Город" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все города</SelectItem>
              {visibleCities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

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
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-2 font-medium">{o.order_number || "—"}</td>
                  <td className="p-2">{o.city}</td>
                  <td className="p-2">{o.customer_name}</td>
                  <td className="p-2">{o.customer_phone}</td>
                  <td className="p-2">{o.issued_at ? formatDate(o.issued_at) : "—"}</td>
                  <td className="p-2 text-right font-medium">{fmt(o.total_price)}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setDetailsOrder(o)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Просмотреть детально"
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                      <button
                        onClick={() => removeOrder(o)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Удалить"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OrderDetailsDialog order={detailsOrder} open={!!detailsOrder} onOpenChange={(v) => !v && setDetailsOrder(null)} />
    </div>
  );
}