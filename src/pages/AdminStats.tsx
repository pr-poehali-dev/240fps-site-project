import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const STATS_URL = "https://functions.poehali.dev/e937ccf1-a114-4bab-9dce-6d7b7407b194";
const AUTH_URL = "https://functions.poehali.dev/e2bd2fe3-82aa-49a6-8f39-0bc794e6f497";
const AUTH_KEY = "admin_authed";
const PWD_KEY = "admin_pwd";
const PRODUCT_IMAGES_URL = "https://functions.poehali.dev/fa0b7713-c38c-4391-a003-db2e04b88fe3";

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

function LoginScreen({ onLogin }: { onLogin: () => void }) {
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
        onLogin();
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

interface ProductImage {
  product_id: number;
  name: string;
  img: string;
}

function ProductPhotos() {
  const [items, setItems] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [errorId, setErrorId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetch(PRODUCT_IMAGES_URL)
      .then(r => r.json())
      .then(d => { setItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const onFile = async (productId: number, file: File) => {
    setUploadingId(productId);
    setErrorId(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(PRODUCT_IMAGES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": sessionStorage.getItem(PWD_KEY) || "",
        },
        body: JSON.stringify({
          product_id: productId,
          file_base64: base64,
          content_type: file.type || "image/jpeg",
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setItems(prev => prev.map(i => i.product_id === productId ? { ...i, img: data.img } : i));
      } else {
        setErrorId(productId);
      }
    } catch {
      setErrorId(productId);
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div className="text-muted-foreground text-sm py-10 text-center">Загрузка...</div>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map(item => (
        <div key={item.product_id} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="aspect-square bg-muted relative">
            <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
            {uploadingId === item.product_id && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm">
                Загрузка...
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="font-semibold mb-3">{item.name}</div>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) onFile(item.product_id, file);
                  e.target.value = "";
                }}
              />
              <span className="block text-center bg-primary text-primary-foreground rounded-lg py-2 text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                Заменить фото
              </span>
            </label>
            {errorId === item.product_id && (
              <div className="text-destructive text-xs mt-2 text-center">Ошибка загрузки</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<"stats" | "photos">("stats");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(STATS_URL)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Не удалось загрузить статистику"); setLoading(false); });
  }, []);

  const deviceData = (data?.by_device || []).map(d => ({ ...d, name: DEVICE_LABELS[d.device] || d.device }));

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold uppercase">Админ-панель</h1>
        <button
          onClick={() => { sessionStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(PWD_KEY); window.location.reload(); }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Выйти
        </button>
      </div>

      <div className="flex gap-2 mb-8 border-b border-border">
        <button
          onClick={() => setTab("stats")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${tab === "stats" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Статистика
        </button>
        <button
          onClick={() => setTab("photos")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${tab === "photos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Фото каталога
        </button>
      </div>

      {tab === "photos" && <ProductPhotos />}

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

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <Dashboard />;
}