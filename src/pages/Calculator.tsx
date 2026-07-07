import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const API_URL = 'https://functions.poehali.dev/5cfc8ecc-4c82-4e93-b6a3-36c98ad09e79';
const SEND_LEAD_URL = 'https://functions.poehali.dev/0417654c-b782-4720-851a-0c4f89751599';

type Part = { id: number; name: string; price: number };
type Components = {
  cpu: Part[];
  motherboard: Part[];
  ram: Part[];
  gpu: Part[];
  ssd: Part[];
  cooler: Part[];
  psu: Part[];
  case: Part[];
};
type Brand = 'intel' | 'amd';
type Platform = 'lga1700' | 'lga1851' | 'am4' | 'am5';

const fmt = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

const NAV = [
  { label: 'Главная', href: '/' },
  { label: 'Каталог', href: '/#catalog' },
  { label: 'Калькулятор', href: '/calculator' },
  { label: 'Блог', href: '/#blog' },
  { label: 'Контакты', href: '/#contacts' },
];

const LABELS: Record<keyof Components, { label: string; icon: string }> = {
  cpu:         { label: 'Процессор',         icon: 'Cpu' },
  motherboard: { label: 'Материнская плата',  icon: 'CircuitBoard' },
  ram:         { label: 'Оперативная память', icon: 'MemoryStick' },
  gpu:         { label: 'Видеокарта',         icon: 'MonitorPlay' },
  ssd:         { label: 'SSD накопитель',     icon: 'HardDrive' },
  cooler:      { label: 'Охлаждение',         icon: 'Wind' },
  psu:         { label: 'Блок питания',       icon: 'Zap' },
  case:        { label: 'Корпус',             icon: 'Box' },
};

// Фильтры совместимости по имени компонента
const CPU_LGA1700 = ['i5 12400F', 'i5 14400F', 'i5 14600KF', 'i7 14700KF', 'i5 12400'];
const CPU_LGA1851 = ['Ultra 5 245KF', 'Ultra 7 265KF', 'Ultra 9 285K'];
const CPU_AM4     = ['Ryzen 5 5500', 'Ryzen 5 5600', 'Ryzen 7 5700', 'Ryzen 7 5700X'];
const CPU_AM5     = ['Ryzen 5 7500F', 'Ryzen 7 7700', 'Ryzen 7 7800X3D', 'Ryzen 7 9800X3D', 'Ryzen 9 9950X', 'Ryzen 5 9600X'];

const MB_LGA1700  = ['H610M', 'B660m D4'];
const MB_LGA1851  = ['B860M', 'MAG B860 TOMAHAWK WIFI', 'Z890M GAMING X', 'Z790 GAMING PLUS WIFI', 'B760m D4'];
const MB_AM4      = ['A520M', 'B550M'];
const MB_AM5      = ['A620M', 'B650M WiFi', 'B850M WiFi', 'B850M FORCE WIFI6E', 'B850M Gaming X AX', 'MSI B850 Gaming Plus WiFi6e'];

const RAM_DDR4     = ['DDR4 16GB', 'DDR4 32GB'];
const RAM_DDR5     = ['DDR5 16GB 5600CH', 'DDR5 16GB 6000', 'DDR5 32GB 5600CH', 'DDR5 32GB 6000', 'DDR5 32GB 6000 CL30', 'DDR5 64GB 5600', 'DDR5 64GB 6000'];
const RAM_DDR4_DDR5 = [...RAM_DDR4, ...RAM_DDR5];

function filterByNames(parts: Part[], names: string[]): Part[] {
  return parts.filter((p) => names.includes(p.name));
}

const PLATFORM_INFO: Record<Platform, { label: string; moboNames: string[]; ramNames: string[]; cpuNames: string[] }> = {
  lga1700: { label: 'Intel LGA1700 (DDR4/DDR5)', moboNames: MB_LGA1700, ramNames: RAM_DDR4_DDR5, cpuNames: CPU_LGA1700 },
  lga1851: { label: 'Intel LGA1851 (DDR5)',       moboNames: MB_LGA1851, ramNames: RAM_DDR5,      cpuNames: CPU_LGA1851 },
  am4:     { label: 'AMD AM4 (DDR4)',             moboNames: MB_AM4,     ramNames: RAM_DDR4,      cpuNames: CPU_AM4     },
  am5:     { label: 'AMD AM5 (DDR5)',             moboNames: MB_AM5,     ramNames: RAM_DDR5,      cpuNames: CPU_AM5     },
};

type SelectKey = keyof Components;

export default function Calculator() {
  const [components, setComponents] = useState<Components | null>(null);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [selected, setSelected] = useState<Partial<Record<SelectKey, Part>>>({});
  const [orderOpen, setOrderOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => { setComponents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const partsTotal = Object.values(selected).reduce((sum, p) => sum + (p?.price ?? 0), 0);
  const assemblyFee = partsTotal === 0 ? 0 : partsTotal > 150000 ? 6000 : 5000;
  const total = partsTotal + assemblyFee;
  const keys = Object.keys(LABELS) as SelectKey[];

  const selectPart = (category: SelectKey, part: Part) => {
    setSelected((prev) => {
      if (prev[category]?.id === part.id) {
        const next = { ...prev };
        delete next[category];
        return next;
      }
      return { ...prev, [category]: part };
    });
  };

  const chooseBrand = (b: Brand) => {
    setBrand(b);
    setPlatform(null);
    setSelected({});
  };

  const choosePlatform = (p: Platform) => {
    setPlatform(p);
    setSelected({});
  };

  const reset = () => { setBrand(null); setPlatform(null); setSelected({}); };

  const sendOrder = async () => {
    setSending(true);
    setOrderError('');
    const platformLabel = platform ? PLATFORM_INFO[platform].label : '';
    const lines = keys
      .filter((k) => selected[k])
      .map((k) => `${LABELS[k].label}: ${selected[k]!.name} — ${fmt(selected[k]!.price)}`)
      .join('\n');
    const text = `🖥 Заявка на сборку!\n🔌 Платформа: ${platformLabel}\n\n${lines}\n\n🔧 Услуга сборки: ${fmt(assemblyFee)}\n💰 Итого: ${fmt(total)}\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}`;
    try {
      const res = await fetch(SEND_LEAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error();
    } catch {
      setSending(false);
      setOrderError('Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.');
      return;
    }
    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); setOrderOpen(false); setName(''); setPhone(''); }, 3000);
  };

  const pInfo = platform ? PLATFORM_INFO[platform] : null;

  const filteredParts = (key: SelectKey): Part[] => {
    if (!components || !pInfo) return [];
    const all = components[key];
    if (key === 'cpu')         return filterByNames(all, pInfo.cpuNames);
    if (key === 'motherboard') return filterByNames(all, pInfo.moboNames);
    if (key === 'ram')         return filterByNames(all, pInfo.ramNames);
    return all;
  };

  const STEPS: SelectKey[] = ['cpu', 'motherboard', 'ram', 'gpu', 'ssd', 'cooler', 'psu', 'case'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container flex items-center justify-between h-16 md:h-18 py-3">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-primary flex items-center justify-center glow-yellow shrink-0">
              <Icon name="Zap" className="text-primary-foreground" size={20} />
            </div>
            <span className="font-display font-700 text-xl md:text-2xl tracking-tight">
              240<span className="text-primary">FPS</span>
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="text-sm font-500 text-muted-foreground hover:text-primary transition-colors">
                {n.label}
              </a>
            ))}
          </nav>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden shrink-0 text-foreground hover:text-primary transition-colors">
                <Icon name="Menu" size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-4/5 max-w-xs flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-yellow">
                  <Icon name="Zap" className="text-primary-foreground" size={18} />
                </div>
                <span className="font-display font-700 text-xl tracking-tight">
                  240<span className="text-primary">FPS</span>
                </span>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV.map((n) => (
                  <a
                    key={n.label}
                    href={n.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 px-2 rounded-lg text-base font-500 text-foreground hover:bg-muted hover:text-primary transition-colors"
                  >
                    {n.label}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="container py-12">
        <div className="mb-10">
          <Badge className="bg-primary/15 text-primary border-primary/30 mb-4 font-500">Конфигуратор</Badge>
          <h1 className="font-display font-700 text-4xl md:text-5xl uppercase mb-3">Собери свой ПК</h1>
          <p className="text-muted-foreground">Выбери платформу — калькулятор покажет только совместимые детали.</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
            <Icon name="Loader" size={22} className="animate-spin" /> Загружаем комплектующие…
          </div>
        )}

        {!loading && components && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
            <div className="space-y-5">

              {/* Шаг 1: выбор бренда */}
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                  <Icon name="Cpu" size={18} className="text-primary" />
                  <span className="font-600">Шаг 1 — Производитель процессора</span>
                  {brand && (
                    <button onClick={reset} className="ml-auto text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                      <Icon name="RotateCcw" size={12} /> Сбросить
                    </button>
                  )}
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {(['intel', 'amd'] as Brand[]).map((b) => (
                    <button
                      key={b}
                      onClick={() => chooseBrand(b)}
                      className={`flex items-center justify-center gap-3 h-16 rounded-xl border-2 font-600 text-lg transition-all ${
                        brand === b
                          ? 'border-primary bg-primary/10 text-primary glow-yellow'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      <Icon name={b === 'intel' ? 'Cpu' : 'Zap'} size={20} className={brand === b ? 'text-primary' : 'text-muted-foreground'} />
                      {b === 'intel' ? 'Intel' : 'AMD'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Шаг 2: выбор платформы */}
              {brand && (
                <div className="rounded-xl bg-card border border-border overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                    <Icon name="CircuitBoard" size={18} className="text-primary" />
                    <span className="font-600">Шаг 2 — Платформа {brand === 'intel' ? 'Intel' : 'AMD'}</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {(brand === 'intel'
                      ? [
                          { key: 'lga1700' as Platform, title: 'LGA1700', sub: 'DDR4/DDR5 · Core 12–14' },
                          { key: 'lga1851' as Platform, title: 'LGA1851', sub: 'DDR5 · Core Ultra' },
                        ]
                      : [
                          { key: 'am4' as Platform, title: 'AM4', sub: 'DDR4 · Ryzen 5000' },
                          { key: 'am5' as Platform, title: 'AM5', sub: 'DDR5 · Ryzen 7000/9000' },
                        ]
                    ).map(({ key, title, sub }) => (
                      <button
                        key={key}
                        onClick={() => choosePlatform(key)}
                        className={`flex flex-col items-center justify-center gap-1 h-20 rounded-xl border-2 font-600 transition-all ${
                          platform === key
                            ? 'border-primary bg-primary/10 text-primary glow-yellow'
                            : 'border-border bg-background hover:border-primary/50'
                        }`}
                      >
                        <span className="text-xl">{title}</span>
                        <span className={`text-xs font-400 ${platform === key ? 'text-primary/80' : 'text-muted-foreground'}`}>{sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Шаги 3+: выбор комплектующих через дропдауны */}
              {platform && STEPS.map((key) => {
                const { label, icon } = LABELS[key];
                const parts = filteredParts(key);
                const picked = selected[key];
                return (
                  <div key={key} className="rounded-xl bg-card border border-border overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                      <Icon name={icon} size={18} className="text-primary" />
                      <span className="font-600">{label}</span>
                      {picked && (
                        <Badge className="ml-auto bg-primary/15 text-primary border-primary/30 font-500 text-xs">
                          {picked.name} — {fmt(picked.price)}
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="relative">
                        <select
                          value={picked ? String(picked.id) : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                              setSelected((prev) => { const n = { ...prev }; delete n[key]; return n; });
                            } else {
                              const part = parts.find((p) => p.id === Number(val));
                              if (part) selectPart(key, part);
                            }
                          }}
                          className="w-full h-11 pl-4 pr-10 rounded-lg bg-background border border-input focus:border-primary outline-none transition-colors text-sm appearance-none cursor-pointer"
                        >
                          <option value="">— Выберите {label.toLowerCase()} —</option>
                          {parts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {fmt(p.price)}
                            </option>
                          ))}
                        </select>
                        <Icon name="ChevronDown" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-xl bg-card border border-border p-6">
                <h2 className="font-display font-700 text-xl uppercase mb-5 flex items-center gap-2">
                  <Icon name="ShoppingCart" size={20} className="text-primary" /> Ваша сборка
                </h2>

                {platform && (
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground">
                    <Icon name="CircuitBoard" size={13} className="text-primary shrink-0" />
                    <span>{pInfo?.label}</span>
                  </div>
                )}

                {keys.filter((k) => selected[k]).length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">
                    {platform ? 'Выберите комплектующие' : 'Выберите платформу слева'}
                  </p>
                ) : (
                  <div className="space-y-3 mb-5">
                    {keys.filter((k) => selected[k]).map((k) => (
                      <div key={k} className="flex items-start justify-between gap-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">{LABELS[k].label}</div>
                          <div className="font-500">{selected[k]!.name}</div>
                        </div>
                        <div className="font-600 text-primary shrink-0">{fmt(selected[k]!.price)}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-border pt-4 mt-4">
                  {assemblyFee > 0 && (
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Комплектующие:</span>
                        <span>{fmt(partsTotal)}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Icon name="Wrench" size={13} className="text-secondary" /> Услуга сборки:
                        </span>
                        <span className="text-secondary font-500">+ {fmt(assemblyFee)}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-muted-foreground text-sm font-600">Итого:</span>
                    <span className="font-display font-700 text-2xl text-primary">{fmt(total)}</span>
                  </div>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-600 h-12 glow-yellow"
                    disabled={total === 0}
                    onClick={() => setOrderOpen(true)}
                  >
                    <Icon name="Send" size={18} /> Заказать сборку
                  </Button>
                  {total > 0 && (
                    <button onClick={reset} className="w-full mt-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                      Сбросить всё
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-secondary/10 border border-secondary/30 p-4 text-sm text-secondary">
                <div className="flex items-center gap-2 font-600 mb-1">
                  <Icon name="Info" size={15} /> Сборка за 24 часа
                </div>
                Цены актуальны на сегодня. После заявки менеджер свяжется с вами для уточнения деталей.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order modal */}
      {orderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setOrderOpen(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-700 text-xl uppercase">Заказать сборку</h3>
              <button onClick={() => setOrderOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center glow-yellow">
                  <Icon name="CheckCircle" size={36} className="text-primary" />
                </div>
                <div className="font-display font-700 text-xl">Заявка отправлена!</div>
                <div className="text-muted-foreground text-sm">Мы свяжемся с вами в ближайшее время.</div>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-muted/50 border border-border mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Стоимость сборки:</span>
                    <span className="font-display font-700 text-xl text-primary">{fmt(total)}</span>
                  </div>
                </div>
                <div className="space-y-3 mb-5">
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-background border border-input focus:border-primary outline-none transition-colors"
                    placeholder="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-background border border-input focus:border-primary outline-none transition-colors"
                    placeholder="Номер телефона"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                {orderError && <div className="text-destructive text-sm mb-3">{orderError}</div>}
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-600 h-12 glow-yellow"
                  disabled={!name.trim() || !phone.trim() || sending}
                  onClick={sendOrder}
                >
                  {sending ? (
                    <><Icon name="Loader2" size={18} className="animate-spin" /> Отправляем…</>
                  ) : (
                    <><Icon name="Send" size={18} /> Отправить заявку</>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}