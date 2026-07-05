import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const STATS_URL = "https://functions.poehali.dev/e937ccf1-a114-4bab-9dce-6d7b7407b194";
const AUTH_URL = "https://functions.poehali.dev/e2bd2fe3-82aa-49a6-8f39-0bc794e6f497";
const AUTH_KEY = "admin_authed";
const PWD_KEY = "admin_pwd";
const ROLE_KEY = "admin_role";
const PRODUCTS_URL = "https://functions.poehali.dev/c48cecd4-2c62-4a36-a7c7-f88df7d5ea05";

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e", "#a78bfa"];

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Компьютер",
  mobile: "Телефон",
  tablet: "Планшет",
  unknown: "Неизвестно",
};

interface StatsData {
  totals: { visits: number; unique: number };
  by_day: { date: string; visits: number; unique: number }[];
  by_device: { device: string; count: number }[];
  by_os: { os: string; count: number }[];
  by_browser: { browser: string; count: number }[];
  by_page: { page: string; count: number }[];
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
        <h1 className="font-bold text-xl text-center mb-2">Вход</h1>
        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={e => setLogin(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
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

interface ProductItem {
  id: number;
  name: string;
  brand: string;
  cpu_brand: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  price: number;
  fps: string;
  tag: string | null;
  img: string;
  imgs: string[] | null;
  active: boolean;
  sort_order: number;
}

const EMPTY_PRODUCT: Omit<ProductItem, "id" | "img" | "imgs"> = {
  name: "",
  brand: "NVIDIA",
  cpu_brand: "Intel",
  cpu: "",
  gpu: "",
  ram: 16,
  storage: 500,
  price: 0,
  fps: "144+ FPS",
  tag: null,
  active: true,
  sort_order: 0,
};

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Admin-Password": sessionStorage.getItem(PWD_KEY) || "",
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ProductForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: ProductItem | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? EMPTY_PRODUCT.name,
    brand: initial?.brand ?? EMPTY_PRODUCT.brand,
    cpu_brand: initial?.cpu_brand ?? EMPTY_PRODUCT.cpu_brand,
    cpu: initial?.cpu ?? EMPTY_PRODUCT.cpu,
    gpu: initial?.gpu ?? EMPTY_PRODUCT.gpu,
    ram: initial?.ram ?? EMPTY_PRODUCT.ram,
    storage: initial?.storage ?? EMPTY_PRODUCT.storage,
    price: initial?.price ?? EMPTY_PRODUCT.price,
    fps: initial?.fps ?? EMPTY_PRODUCT.fps,
    tag: initial?.tag ?? "",
  });
  const [existingImgs, setExistingImgs] = useState<string[]>(initial?.imgs?.length ? initial.imgs : (initial?.img ? [initial.img] : []));
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalPhotos = existingImgs.length + newFiles.length;

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 5 - totalPhotos);
    setNewFiles(prev => [...prev, ...arr]);
  };

  const removeExisting = (idx: number) => setExistingImgs(prev => prev.filter((_, i) => i !== idx));
  const removeNew = (idx: number) => setNewFiles(prev => prev.filter((_, i) => i !== idx));

  const makeMainExisting = (idx: number) =>
    setExistingImgs(prev => {
      const next = [...prev];
      const [picked] = next.splice(idx, 1);
      return [picked, ...next];
    });

  const save = async () => {
    if (totalPhotos === 0) {
      setError("Добавьте хотя бы одно фото");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const newPhotos = await Promise.all(
        newFiles.map(async f => ({ file_base64: await fileToBase64(f), content_type: f.type || "image/jpeg" }))
      );

      const payload: Record<string, unknown> = {
        ...form,
        tag: form.tag || null,
      };

      if (initial) {
        payload.id = initial.id;
        payload.imgs = existingImgs;
        payload.new_photos = newPhotos;
      } else {
        payload.photos = newPhotos;
      }

      const res = await fetch(PRODUCTS_URL, {
        method: initial ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onSaved();
      } else {
        setError(data.error || "Ошибка сохранения");
      }
    } catch {
      setError("Ошибка подключения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
      <div className="font-semibold text-lg">{initial ? `Редактирование: ${initial.name}` : "Новая сборка"}</div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Название</label>
          <input value={form.name} onChange={e => set("name", e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Тег (Хит / Топ / Выбор)</label>
          <input value={form.tag} onChange={e => set("tag", e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Процессор</label>
          <input value={form.cpu} onChange={e => set("cpu", e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Бренд процессора</label>
          <select value={form.cpu_brand} onChange={e => set("cpu_brand", e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="Intel">Intel</option>
            <option value="AMD">AMD</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Видеокарта</label>
          <input value={form.gpu} onChange={e => set("gpu", e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Бренд видеокарты</label>
          <select value={form.brand} onChange={e => set("brand", e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="NVIDIA">NVIDIA</option>
            <option value="AMD">AMD</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Оперативная память (ГБ)</label>
          <input type="number" value={form.ram} onChange={e => set("ram", Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">SSD (ГБ)</label>
          <input type="number" value={form.storage} onChange={e => set("storage", Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Цена (₽)</label>
          <input type="number" value={form.price} onChange={e => set("price", Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">FPS (например 240+ FPS)</label>
          <input value={form.fps} onChange={e => set("fps", e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Фото сборки (главное + до 4 дополнительных)</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
          {existingImgs.map((img, i) => (
            <div key={img} className="relative aspect-square rounded-lg overflow-hidden border-2 group" style={{ borderColor: i === 0 ? "var(--primary)" : "var(--border)" }}>
              <img src={img} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-semibold rounded px-1.5 py-0.5">Главное</div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {i !== 0 && (
                  <button type="button" onClick={() => makeMainExisting(i)} className="text-white text-[10px] bg-secondary rounded px-1.5 py-1">
                    Сделать главным
                  </button>
                )}
                <button type="button" onClick={() => removeExisting(i)} className="text-white bg-destructive rounded p-1">
                  <span className="text-xs">✕</span>
                </button>
              </div>
            </div>
          ))}
          {newFiles.map((f, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border-2 border-border group">
              <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-1 left-1 bg-muted text-foreground text-[10px] font-semibold rounded px-1.5 py-0.5">Новое</div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button type="button" onClick={() => removeNew(i)} className="text-white bg-destructive rounded p-1">
                  <span className="text-xs">✕</span>
                </button>
              </div>
            </div>
          ))}
          {totalPhotos < 5 && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center cursor-pointer text-muted-foreground text-2xl">
              +
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => { addFiles(e.target.files); e.target.value = ""; }}
              />
            </label>
          )}
        </div>
        <div className="text-xs text-muted-foreground">Первое фото — главное, остальные откроются в галерее при клике на карточку товара.</div>
      </div>

      {error && <div className="text-destructive text-sm">{error}</div>}

      <div className="flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="bg-primary text-primary-foreground rounded-lg px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

function ProductsManager() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProductItem | null | "new">(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`${PRODUCTS_URL}?all=1`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (item: ProductItem) => {
    await fetch(PRODUCTS_URL, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ id: item.id, active: !item.active }),
    });
    load();
  };

  const remove = async (id: number) => {
    setDeletingId(id);
    try {
      await fetch(PRODUCTS_URL, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      load();
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="text-muted-foreground text-sm py-10 text-center">Загрузка...</div>;

  if (editing) {
    return (
      <ProductForm
        initial={editing === "new" ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={() => { setEditing(null); load(); }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-5">
        <button
          onClick={() => setEditing("new")}
          className="bg-primary text-primary-foreground rounded-lg px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + Добавить сборку
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(item => (
          <div key={item.id} className={`bg-card border rounded-xl overflow-hidden ${item.active ? "border-border" : "border-border opacity-50"}`}>
            <div className="aspect-square bg-muted relative">
              <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
              {!item.active && (
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs rounded px-2 py-1">Скрыто</div>
              )}
            </div>
            <div className="p-4 space-y-1">
              <div className="font-semibold">{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.cpu} · {item.gpu}</div>
              <div className="text-sm font-semibold text-primary">{item.price.toLocaleString("ru-RU")} ₽</div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditing(item)}
                  className="flex-1 bg-secondary text-secondary-foreground rounded-lg py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Изменить
                </button>
                <button
                  onClick={() => toggleActive(item)}
                  className="flex-1 border border-border rounded-lg py-2 text-xs font-semibold hover:bg-muted transition-colors"
                >
                  {item.active ? "Скрыть" : "Показать"}
                </button>
                <button
                  onClick={() => remove(item.id)}
                  disabled={deletingId === item.id}
                  className="border border-destructive text-destructive rounded-lg px-3 py-2 text-xs font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                >
                  {deletingId === item.id ? "..." : "Удалить"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ role }: { role: string }) {
  const isAdmin = role === "admin";
  const [tab, setTab] = useState<"stats" | "products">(isAdmin ? "stats" : "products");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    fetch(STATS_URL)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Не удалось загрузить статистику"); setLoading(false); });
  }, [isAdmin]);

  const deviceData = (data?.by_device || []).map(d => ({ ...d, name: DEVICE_LABELS[d.device] || d.device }));

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold uppercase">Админ-панель</h1>
        <button
          onClick={() => { sessionStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(PWD_KEY); sessionStorage.removeItem(ROLE_KEY); window.location.reload(); }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Выйти
        </button>
      </div>

      {isAdmin && (
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setTab("stats")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${tab === "stats" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Статистика
          </button>
          <button
            onClick={() => setTab("products")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${tab === "products" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Каталог сборок
          </button>
        </div>
      )}

      {tab === "products" && <ProductsManager />}

      {tab === "stats" && loading && <div className="text-muted-foreground text-sm py-10 text-center">Загрузка...</div>}
      {tab === "stats" && error && <div className="text-destructive text-sm py-10 text-center">{error}</div>}
      {tab === "stats" && data && (
        <>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Визитов за 30 дней", value: data!.totals.visits },
          { label: "Уникальных за 30 дней", value: data!.totals.unique },
          { label: "Дней с данными", value: data!.by_day.length },
          { label: "Страниц отслежено", value: data!.by_page.length },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <div className="text-3xl font-bold text-primary">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Посещения по дням</h2>
        {data!.by_day.length === 0 ? (
          <div className="text-muted-foreground text-sm">Данных пока нет</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data!.by_day}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="visits" name="Визиты" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="unique" name="Уникальные" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Устройства</h2>
          {deviceData.length === 0 ? <div className="text-muted-foreground text-sm">Нет данных</div> : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={deviceData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Операционные системы</h2>
          {data!.by_os.length === 0 ? <div className="text-muted-foreground text-sm">Нет данных</div> : (
            <div className="space-y-3">
              {data!.by_os.map((item, i) => {
                const max = data!.by_os[0].count;
                return (
                  <div key={item.os}>
                    <div className="flex justify-between text-sm mb-1"><span>{item.os}</span><span className="text-muted-foreground">{item.count}</span></div>
                    <div className="h-2 bg-border rounded-full">
                      <div className="h-2 rounded-full" style={{ width: `${(item.count / max) * 100}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Браузеры</h2>
          {data!.by_browser.length === 0 ? <div className="text-muted-foreground text-sm">Нет данных</div> : (
            <div className="space-y-3">
              {data!.by_browser.map((item, i) => {
                const max = data!.by_browser[0].count;
                return (
                  <div key={item.browser}>
                    <div className="flex justify-between text-sm mb-1"><span>{item.browser}</span><span className="text-muted-foreground">{item.count}</span></div>
                    <div className="h-2 bg-border rounded-full">
                      <div className="h-2 rounded-full" style={{ width: `${(item.count / max) * 100}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Популярные страницы</h2>
        {data!.by_page.length === 0 ? <div className="text-muted-foreground text-sm">Нет данных</div> : (
          <div className="space-y-3">
            {data!.by_page.map((item, i) => {
              const max = data!.by_page[0].count;
              const labels: Record<string, string> = { "/": "Главная", "/calculator": "Конфигуратор" };
              return (
                <div key={item.page} className="flex items-center gap-4">
                  <div className="text-sm w-36 shrink-0">{labels[item.page] || item.page}</div>
                  <div className="flex-1 h-2 bg-border rounded-full">
                    <div className="h-2 rounded-full" style={{ width: `${(item.count / max) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <div className="text-sm text-muted-foreground w-8 text-right">{item.count}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-muted-foreground">Данные за последние 30 дней</div>
        </>
      )}
    </div>
  );
}

export default function AdminStats() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === "1");
  const [role, setRole] = useState(() => sessionStorage.getItem(ROLE_KEY) || "admin");

  if (!authed) return <LoginScreen onLogin={(r) => { setRole(r); setAuthed(true); }} />;
  return <Dashboard role={role} />;
}