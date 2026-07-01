import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const API_URL = 'https://functions.poehali.dev/5cfc8ecc-4c82-4e93-b6a3-36c98ad09e79';

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

const LABELS: Record<keyof Components, { label: string; icon: string }> = {
  cpu:         { label: 'Процессор',       icon: 'Cpu' },
  motherboard: { label: 'Материнская плата', icon: 'CircuitBoard' },
  ram:         { label: 'Оперативная память', icon: 'MemoryStick' },
  gpu:         { label: 'Видеокарта',      icon: 'MonitorPlay' },
  ssd:         { label: 'SSD накопитель',  icon: 'HardDrive' },
  cooler:      { label: 'Охлаждение',      icon: 'Wind' },
  psu:         { label: 'Блок питания',    icon: 'Zap' },
  case:        { label: 'Корпус',          icon: 'Box' },
};

const fmt = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

const NAV = [
  { label: 'Главная', href: '/' },
  { label: 'Каталог', href: '/#catalog' },
  { label: 'Калькулятор', href: '/calculator' },
  { label: 'Блог', href: '/#blog' },
  { label: 'Контакты', href: '/#contacts' },
];

export default function Calculator() {
  const [components, setComponents] = useState<Components | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Partial<Record<keyof Components, Part>>>({});
  const [orderOpen, setOrderOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => { setComponents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const total = Object.values(selected).reduce((sum, p) => sum + (p?.price ?? 0), 0);
  const keys = Object.keys(LABELS) as (keyof Components)[];

  const select = (category: keyof Components, part: Part) => {
    setSelected((prev) => {
      if (prev[category]?.id === part.id) {
        const next = { ...prev };
        delete next[category];
        return next;
      }
      return { ...prev, [category]: part };
    });
  };

  const sendOrder = () => {
    const lines = keys
      .filter((k) => selected[k])
      .map((k) => `${LABELS[k].label}: ${selected[k]!.name} — ${fmt(selected[k]!.price)}`)
      .join('\n');
    const text = `🖥 Заявка на сборку!\n\n${lines}\n\n💰 Итого: ${fmt(total)}\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}`;
    window.open(`https://t.me/MaxSokhin?text=${encodeURIComponent(text)}`, '_blank');
    setSent(true);
    setTimeout(() => { setSent(false); setOrderOpen(false); setName(''); setPhone(''); }, 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container flex items-center justify-between h-18 py-3">
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center glow-yellow">
              <Icon name="Zap" className="text-primary-foreground" size={22} />
            </div>
            <span className="font-display font-700 text-2xl tracking-tight">
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
        </div>
      </header>

      <div className="container py-12">
        <div className="mb-10">
          <Badge className="bg-primary/15 text-primary border-primary/30 mb-4 font-500">Конфигуратор</Badge>
          <h1 className="font-display font-700 text-4xl md:text-5xl uppercase mb-3">Собери свой ПК</h1>
          <p className="text-muted-foreground">Выбери комплектующие — и мы соберём компьютер мечты за 24 часа.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Parts selector */}
          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
                <Icon name="Loader" size={22} className="animate-spin" /> Загружаем комплектующие…
              </div>
            )}
            {!loading && components && keys.map((key) => {
              const { label, icon } = LABELS[key];
              const parts = components[key];
              const picked = selected[key];
              return (
                <div key={key} className="rounded-xl bg-card border border-border overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                    <Icon name={icon} size={18} className="text-primary" />
                    <span className="font-600">{label}</span>
                    {picked && (
                      <Badge className="ml-auto bg-primary/15 text-primary border-primary/30 font-500">
                        {picked.name} — {fmt(picked.price)}
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 flex flex-wrap gap-2">
                    {parts.map((part) => {
                      const active = picked?.id === part.id;
                      return (
                        <button
                          key={part.id}
                          onClick={() => select(key, part)}
                          className={`px-3 py-2 rounded-lg text-sm font-500 border transition-all ${
                            active
                              ? 'bg-primary text-primary-foreground border-primary glow-yellow'
                              : 'bg-background border-border hover:border-primary/60 text-foreground'
                          }`}
                        >
                          {part.name}
                          <span className={`ml-2 text-xs ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {fmt(part.price)}
                          </span>
                        </button>
                      );
                    })}
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
              {keys.filter((k) => selected[k]).length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">Выберите комплектующие слева</p>
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
                <div className="flex items-center justify-between mb-5">
                  <span className="text-muted-foreground text-sm">Итого:</span>
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
                  <button
                    onClick={() => setSelected({})}
                    className="w-full mt-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
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
                <div className="text-muted-foreground text-sm">Telegram открылся с вашей сборкой.<br />Мы свяжемся в ближайшее время.</div>
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
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-600 h-12 glow-yellow"
                  disabled={!name.trim() || !phone.trim()}
                  onClick={sendOrder}
                >
                  <Icon name="Send" size={18} /> Отправить заявку в Telegram
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
