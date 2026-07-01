import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const HERO_IMG = 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/265342b7-5d59-4e3c-a39b-25895cd691d6.jpg';

const NAV = [
  { label: 'Главная', href: '#home' },
  { label: 'Каталог', href: '#catalog' },
  { label: 'О компании', href: '#about' },
  { label: 'Блог', href: '#blog' },
  { label: 'Контакты', href: '#contacts' },
];

type Product = {
  id: number;
  name: string;
  brand: string;
  cpuBrand: string;
  cpu: string;
  gpu: string;
  ram: number;
  price: number;
  fps: string;
  tag?: string;
  img: string;
};

const PRODUCTS: Product[] = [
  { id: 1,  name: 'GLADIATOR',    brand: 'NVIDIA', cpuBrand: 'AMD',   cpu: 'R5 5500',       gpu: 'RTX 5050',        ram: 16, price: 77500,  fps: '144+ FPS', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/5866b2d1-4443-4366-a8e3-8f604190c52f.jpg' },
  { id: 2,  name: 'GLADIATOR V2', brand: 'NVIDIA', cpuBrand: 'AMD',   cpu: 'R5 5500',       gpu: 'RTX 5060',        ram: 16, price: 81500,  fps: '165+ FPS', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/6bd8e47b-6f79-41c5-992f-c3dfc9465db5.jpg' },
  { id: 3,  name: 'GLADIATOR V3', brand: 'NVIDIA', cpuBrand: 'AMD',   cpu: 'R5 5600',       gpu: 'RTX 5060',        ram: 16, price: 84500,  fps: '165+ FPS', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/961c46e9-9d96-4813-834d-9a0c864e6a57.jpg' },
  { id: 4,  name: 'GLADIATOR V4', brand: 'NVIDIA', cpuBrand: 'AMD',   cpu: 'R5 5600',       gpu: 'RTX 5060 Ti 8Gb', ram: 32, price: 97500,  fps: '180+ FPS', tag: 'Хит', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/c4a58926-e305-4631-b900-7efc56f18c46.jpg' },
  { id: 5,  name: 'DOMINATOR',    brand: 'NVIDIA', cpuBrand: 'AMD',   cpu: 'R5 7500F',      gpu: 'RTX 5060',        ram: 32, price: 110000, fps: '180+ FPS', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/e93c092a-d299-49ed-97e2-34cfb28df332.jpg' },
  { id: 6,  name: 'DOMINATOR V2', brand: 'NVIDIA', cpuBrand: 'Intel', cpu: 'Intel 9600X',   gpu: 'RTX 5060',        ram: 32, price: 111000, fps: '180+ FPS', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/9883ca4b-2016-4faa-8123-c3cbf2989feb.jpg' },
  { id: 7,  name: 'DOMINATOR V3', brand: 'NVIDIA', cpuBrand: 'AMD',   cpu: 'R5 7500F',      gpu: 'RTX 5060 Ti 16Gb',ram: 32, price: 132500, fps: '200+ FPS', tag: 'Хит', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/5866b2d1-4443-4366-a8e3-8f604190c52f.jpg' },
  { id: 8,  name: 'DOMINATOR V4', brand: 'NVIDIA', cpuBrand: 'AMD',   cpu: 'R7 7800X3D',    gpu: 'RTX 5060 Ti 16Gb',ram: 32, price: 154500, fps: '240+ FPS', tag: 'Топ', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/6bd8e47b-6f79-41c5-992f-c3dfc9465db5.jpg' },
  { id: 9,  name: 'RAPTOR',       brand: 'NVIDIA', cpuBrand: 'Intel', cpu: 'Intel i5-12400F',gpu: 'RTX 5050',        ram: 16, price: 81000,  fps: '144+ FPS', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/961c46e9-9d96-4813-834d-9a0c864e6a57.jpg' },
  { id: 10, name: 'RAPTOR V2',    brand: 'NVIDIA', cpuBrand: 'Intel', cpu: 'Intel i5-12400F',gpu: 'RTX 5060',        ram: 16, price: 84000,  fps: '165+ FPS', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/c4a58926-e305-4631-b900-7efc56f18c46.jpg' },
  { id: 11, name: 'RAPTOR V3',    brand: 'NVIDIA', cpuBrand: 'Intel', cpu: 'Intel i5-12400F',gpu: 'RTX 5060',        ram: 32, price: 94000,  fps: '165+ FPS', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/e93c092a-d299-49ed-97e2-34cfb28df332.jpg' },
  { id: 12, name: 'RAPTOR V4',    brand: 'NVIDIA', cpuBrand: 'Intel', cpu: 'Intel i5-14600KF',gpu: 'RTX 5060',      ram: 32, price: 138000, fps: '200+ FPS', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/9883ca4b-2016-4faa-8123-c3cbf2989feb.jpg' },
  { id: 13, name: 'BERSERK',      brand: 'NVIDIA', cpuBrand: 'Intel', cpu: 'Ultra 5 245KF',  gpu: 'RTX 5060 Ti 16Gb',ram: 32, price: 147500, fps: '240+ FPS', tag: 'Выбор', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/5866b2d1-4443-4366-a8e3-8f604190c52f.jpg' },
  { id: 14, name: 'BERSERK V2',   brand: 'NVIDIA', cpuBrand: 'Intel', cpu: 'Ultra 9 285K',   gpu: 'RTX 5080',        ram: 64, price: 340500, fps: '360+ FPS', tag: 'Топ', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/6bd8e47b-6f79-41c5-992f-c3dfc9465db5.jpg' },
  { id: 15, name: 'BERSERK V3',   brand: 'NVIDIA', cpuBrand: 'AMD',   cpu: 'R7 7800X3D',     gpu: 'RTX 5070',        ram: 32, price: 160500, fps: '240+ FPS', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/961c46e9-9d96-4813-834d-9a0c864e6a57.jpg' },
  { id: 16, name: 'BERSERK V4',   brand: 'NVIDIA', cpuBrand: 'AMD',   cpu: 'R7 9800X3D',     gpu: 'RTX 5070',        ram: 32, price: 179500, fps: '300+ FPS', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/c4a58926-e305-4631-b900-7efc56f18c46.jpg' },
  { id: 17, name: 'BERSERK V5',   brand: 'NVIDIA', cpuBrand: 'AMD',   cpu: 'R7 9800X3D',     gpu: 'RTX 5070 Ti',     ram: 32, price: 196500, fps: '300+ FPS', tag: 'Топ', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/e93c092a-d299-49ed-97e2-34cfb28df332.jpg' },
  { id: 18, name: 'DOMINATOR2 V4', brand: 'AMD',   cpuBrand: 'AMD',   cpu: 'R7 7800X3D',     gpu: 'RX 9070 XT',      ram: 32, price: 175500, fps: '240+ FPS', tag: 'Хит', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/6bd8e47b-6f79-41c5-992f-c3dfc9465db5.jpg' },
];

const BRANDS = ['NVIDIA', 'AMD'];
const CPU_BRANDS = ['Intel', 'AMD'];
const RAM_OPTIONS = [16, 32, 64];

const BLOG = [
  { title: 'Как выбрать видеокарту в 2026 году', date: '28 июня', cat: 'Гайд', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/902c9617-e2d5-49c8-ada0-7452906c92f9.jpg' },
  { title: 'RTX 5090 vs RX 7900 XTX: тесты в играх', date: '20 июня', cat: 'Обзор', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/eb798448-830c-4662-b89a-3b039bad3ecf.jpg' },
  { title: 'Топ-5 сборок для киберспорта', date: '11 июня', cat: 'Подборка', img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/ce524460-851c-4de1-a71b-c63253f9d0bc.jpg' },
];

const fmt = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

const Index = () => {
  const [price, setPrice] = useState<number[]>([350000]);
  const [brands, setBrands] = useState<string[]>([]);
  const [cpuBrands, setCpuBrands] = useState<string[]>([]);
  const [rams, setRams] = useState<number[]>([]);
  const [cart, setCart] = useState<number[]>([]);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSent, setCallbackSent] = useState(false);

  const sendCallback = () => {
    const text = `📞 Заявка на звонок!\n\n👤 Имя: ${callbackName}\n📞 Телефон: ${callbackPhone}`;
    window.open(`https://t.me/MaxSokhin?text=${encodeURIComponent(text)}`, '_blank');
    setCallbackSent(true);
    setTimeout(() => {
      setCallbackSent(false);
      setCallbackOpen(false);
      setCallbackName('');
      setCallbackPhone('');
    }, 3000);
  };

  const sendOrder = () => {
    if (!orderProduct) return;
    const text = `Заявка на покупку!\n\n🖥 ${orderProduct.name}\nЦП: ${orderProduct.cpu}\nГП: ${orderProduct.gpu}\nОЗУ: ${orderProduct.ram} ГБ\nЦена: ${fmt(orderProduct.price)}\n\n👤 Имя: ${orderName}\n📞 Телефон: ${orderPhone}`;
    window.open(`https://t.me/MaxSokhin?text=${encodeURIComponent(text)}`, '_blank');
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setOrderProduct(null);
      setOrderName('');
      setOrderPhone('');
    }, 3000);
  };

  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const filtered = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          p.price <= price[0] &&
          (brands.length === 0 || brands.includes(p.brand)) &&
          (cpuBrands.length === 0 || cpuBrands.includes(p.cpuBrand)) &&
          (rams.length === 0 || rams.includes(p.ram))
      ),
    [price, brands, cpuBrands, rams]
  );

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container flex items-center justify-between h-18 py-3">
          <a href="#home" className="flex items-center gap-2">
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
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground" onClick={() => setCallbackOpen(true)}>
              <Icon name="Phone" size={16} /> Заказать звонок
            </Button>
            <button className="relative">
              <Icon name="ShoppingCart" size={24} className="text-foreground hover:text-primary transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center font-600">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-transparent to-background pointer-events-none" />
        <div className="container relative grid lg:grid-cols-2 gap-10 items-center py-20 md:py-28">
          <div className="animate-fade-in">
            <Badge className="bg-secondary/20 text-secondary border-secondary/40 mb-6 font-500">
              Сборка мечты за 24 часа
            </Badge>
            <h1 className="font-display font-700 text-5xl md:text-7xl leading-[0.95] uppercase mb-6">
              Больше <span className="text-gradient">кадров</span> —<br />больше <span className="text-primary">побед</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Игровые компьютеры 240FPS, собранные для максимальной производительности. Мощь без компромиссов.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-600 glow-yellow" asChild>
                <a href="#catalog"><Icon name="Cpu" size={18} /> Выбрать компьютер</a>
              </Button>
              <Button size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-600" asChild>
                <a href="#about">О компании</a>
              </Button>
            </div>
            <div className="flex gap-8 mt-12">
              {[['5000+', 'Сборок'], ['5.0', 'Рейтинг'], ['1 год', 'Гарантия']].map(([v, l]) => (
                <div key={l}>
                  <div className="font-display font-700 text-3xl text-primary">{v}</div>
                  <div className="text-sm text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-scale-in">
            <div className="absolute -inset-4 bg-secondary/30 blur-3xl rounded-full animate-glow" />
            <img src={HERO_IMG} alt="Игровой ПК 240FPS" className="relative rounded-2xl border border-border w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: 'Rocket', t: 'Максимальный FPS', d: 'Оптимизация под 240+ кадров' },
          { icon: 'ShieldCheck', t: 'Гарантия 1 год', d: 'Официальная поддержка' },
          { icon: 'Truck', t: 'Доставка по РФ', d: 'Бережная упаковка' },
          { icon: 'Wrench', t: 'Тест 24 часа', d: 'Каждая сборка под нагрузкой' },
        ].map((f) => (
          <div key={f.t} className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
            <Icon name={f.icon} className="text-primary mb-3" size={28} />
            <div className="font-600 mb-1">{f.t}</div>
            <div className="text-sm text-muted-foreground">{f.d}</div>
          </div>
        ))}
      </section>

      {/* Catalog */}
      <section id="catalog" className="container py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-700 text-4xl uppercase">Каталог</h2>
            <p className="text-muted-foreground mt-1">Найдено сборок: {filtered.length}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Filters */}
          <aside className="space-y-6 p-6 rounded-xl bg-card border border-border h-fit lg:sticky lg:top-24">
            <div>
              <h3 className="font-display font-600 text-lg uppercase mb-4 flex items-center gap-2">
                <Icon name="SlidersHorizontal" size={18} className="text-primary" /> Фильтры
              </h3>
              <div className="text-sm font-500 mb-3">Цена до {fmt(price[0])}</div>
              <Slider min={77000} max={350000} step={5000} value={price} onValueChange={setPrice} />
            </div>
            <div className="border-t border-border pt-5">
              <div className="text-sm font-500 mb-3">Производитель GPU</div>
              <div className="space-y-3">
                {BRANDS.map((b) => (
                  <label key={b} className="flex items-center gap-3 cursor-pointer text-sm">
                    <Checkbox checked={brands.includes(b)} onCheckedChange={() => toggle(brands, b, setBrands)} />
                    {b}
                  </label>
                ))}
              </div>
            </div>
            <div className="border-t border-border pt-5">
              <div className="text-sm font-500 mb-3">Производитель CPU</div>
              <div className="space-y-3">
                {CPU_BRANDS.map((b) => (
                  <label key={b} className="flex items-center gap-3 cursor-pointer text-sm">
                    <Checkbox checked={cpuBrands.includes(b)} onCheckedChange={() => toggle(cpuBrands, b, setCpuBrands)} />
                    {b}
                  </label>
                ))}
              </div>
            </div>
            <div className="border-t border-border pt-5">
              <div className="text-sm font-500 mb-3">Оперативная память</div>
              <div className="space-y-3">
                {RAM_OPTIONS.map((r) => (
                  <label key={r} className="flex items-center gap-3 cursor-pointer text-sm">
                    <Checkbox checked={rams.includes(r)} onCheckedChange={() => toggle(rams, r, setRams)} />
                    {r} ГБ
                  </label>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-primary"
              onClick={() => { setPrice([400000]); setBrands([]); setCpuBrands([]); setRams([]); }}
            >
              Сбросить фильтры
            </Button>
          </aside>

          {/* Products */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <div key={p.id} className="group rounded-xl bg-card border border-border overflow-hidden hover:border-primary/60 transition-all hover:-translate-y-1">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {p.tag && <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-600">{p.tag}</Badge>}
                  <Badge className="absolute top-3 right-3 bg-secondary/90 text-secondary-foreground font-500">{p.fps}</Badge>
                </div>
                <div className="p-5">
                  <div className="font-display font-600 text-lg mb-3">{p.name}</div>
                  <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2"><Icon name="Cpu" size={14} className="text-primary" /> {p.cpu}</div>
                    <div className="flex items-center gap-2"><Icon name="Gpu" size={14} className="text-primary" fallback="MonitorPlay" /> {p.gpu}</div>
                    <div className="flex items-center gap-2"><Icon name="MemoryStick" size={14} className="text-primary" /> {p.ram} ГБ RAM</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-700 text-xl">{fmt(p.price)}</span>
                    <Button
                      size="sm"
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-600"
                      onClick={() => setOrderProduct(p)}
                    >
                      <Icon name="Plus" size={16} />
                      Купить
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <Icon name="SearchX" size={40} className="mx-auto mb-3" />
                Ничего не найдено. Попробуйте изменить фильтры.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative grid-bg py-20 border-y border-border">
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="bg-primary/15 text-primary border-primary/30 mb-4 font-500">О компании</Badge>
            <h2 className="font-display font-700 text-4xl uppercase mb-5">Мы собираем компьютеры мечты</h2>
            <p className="text-muted-foreground mb-4">
              240FPS — команда энтузиастов, которая с 2018 года создаёт игровые ПК для геймеров, стримеров и киберспортсменов.
              Каждая сборка проходит стресс-тест 24 часа перед отправкой.
            </p>
            <p className="text-muted-foreground mb-6">
              Используем только оригинальные комплектующие с официальной гарантией и подбираем конфигурацию под ваши задачи и бюджет.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[['Cpu', 'Только оригинальные детали'], ['Headphones', 'Поддержка 24/7'], ['Award', 'Официальная гарантия'], ['Gauge', 'Тонкая оптимизация FPS']].map(([i, t]) => (
                <div key={t} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                    <Icon name={i} size={18} className="text-secondary" />
                  </div>
                  <span className="text-sm font-500">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <img src={HERO_IMG} alt="Сборка ПК" className="rounded-2xl border border-border w-full object-cover glow-purple" />
        </div>
      </section>

      {/* Blog */}
      <section id="blog" className="container py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display font-700 text-4xl uppercase">Блог</h2>
          <a href="#blog" className="text-sm text-primary font-500 hover:underline">Все статьи →</a>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {BLOG.map((b) => (
            <a key={b.title} href="#blog" className="group rounded-xl bg-card border border-border overflow-hidden hover:border-primary/60 transition-all">
              <div className="aspect-video overflow-hidden bg-muted">
                <img src={b.img} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <Badge variant="outline" className="border-primary/40 text-primary">{b.cat}</Badge>
                  {b.date}
                </div>
                <div className="font-600 group-hover:text-primary transition-colors">{b.title}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Contacts */}
      <section id="contacts" className="relative grid-bg py-20 border-t border-border">
        <div className="container grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display font-700 text-4xl uppercase mb-5">Контакты</h2>
            <p className="text-muted-foreground mb-8">Свяжитесь с нами любым удобным способом — поможем подобрать сборку.</p>
            <div className="space-y-5">
              {[
                { i: 'Phone', t: '+7-913-149-82-40', s: 'Ежедневно 9:00–21:00', href: 'tel:+79131498240' },
                { i: 'Send', t: 'Telegram: @Omsk_240FPS', s: 'Напишите нам в Telegram', href: 'https://t.me/Omsk_240FPS' },
                { i: 'Users', t: 'ВКонтакте: vk.com/fps240', s: 'Наша группа ВКонтакте', href: 'https://vk.com/fps240' },
                { i: 'MapPin', t: 'Омск, 70 Лет Октября 20', s: 'Магазин "240ФПС" · Самовывоз и доставка по РФ', href: 'https://yandex.ru/maps/?text=Омск+70+Лет+Октября+20' },
              ].map((c) => (
                <div key={c.t} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Icon name={c.i} size={22} className="text-primary" />
                  </div>
                  <div>
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noopener noreferrer" className="font-600 hover:text-primary transition-colors">{c.t}</a>
                    ) : (
                      <div className="font-600">{c.t}</div>
                    )}
                    <div className="text-sm text-muted-foreground">{c.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-card border border-border">
            <h3 className="font-display font-600 text-xl uppercase mb-5">Оставить заявку</h3>
            <div className="space-y-4">
              <input className="w-full h-12 px-4 rounded-lg bg-background border border-input focus:border-primary outline-none transition-colors" placeholder="Ваше имя" />
              <input className="w-full h-12 px-4 rounded-lg bg-background border border-input focus:border-primary outline-none transition-colors" placeholder="Телефон" />
              <textarea className="w-full px-4 py-3 rounded-lg bg-background border border-input focus:border-primary outline-none transition-colors min-h-28 resize-none" placeholder="Комментарий" />
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-600 h-12 glow-yellow"
                onClick={() => window.open('https://t.me/MaxSokhin', '_blank')}
              >
                <Icon name="Send" size={18} /> Отправить заявку в Telegram
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="Zap" className="text-primary-foreground" size={18} />
            </div>
            <span className="font-display font-700 text-xl">240<span className="text-primary">FPS</span></span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="hover:text-primary transition-colors">{n.label}</a>
            ))}
          </div>
          <div className="flex gap-3">
            {[
              { i: 'Send', href: 'https://t.me/Omsk_240FPS', label: 'Telegram' },
              { i: 'Users', href: 'https://vk.com/fps240', label: 'ВКонтакте' },
              { i: 'Phone', href: 'tel:+79131498240', label: 'Телефон' },
            ].map(({ i, href }) => (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-secondary transition-colors">
                <Icon name={i} size={18} />
              </a>
            ))}
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-sm text-muted-foreground">
          © 2026 240FPS. Все права защищены.
        </div>
      </footer>
      {/* Callback Modal */}
      {callbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setCallbackOpen(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-700 text-xl uppercase">Заказать звонок</h3>
              <button onClick={() => setCallbackOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>
            {callbackSent ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center glow-yellow">
                  <Icon name="CheckCircle" size={36} className="text-primary" />
                </div>
                <div className="font-display font-700 text-xl">Заявка отправлена!</div>
                <div className="text-muted-foreground text-sm">Мы перезвоним вам в ближайшее время.</div>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground text-sm mb-5">Оставьте имя и номер — мы перезвоним в течение 15 минут.</p>
                <div className="space-y-3 mb-5">
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-background border border-input focus:border-primary outline-none transition-colors"
                    placeholder="Ваше имя"
                    value={callbackName}
                    onChange={(e) => setCallbackName(e.target.value)}
                  />
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-background border border-input focus:border-primary outline-none transition-colors"
                    placeholder="Номер телефона"
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-600 h-12 glow-yellow"
                  disabled={!callbackName.trim() || !callbackPhone.trim()}
                  onClick={sendCallback}
                >
                  <Icon name="Phone" size={18} /> Перезвоните мне
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Modal */}
      {orderProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setOrderProduct(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-700 text-xl uppercase">Оформить заказ</h3>
              <button onClick={() => setOrderProduct(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center glow-yellow">
                  <Icon name="CheckCircle" size={36} className="text-primary" />
                </div>
                <div className="font-display font-700 text-xl">Заявка отправлена!</div>
                <div className="text-muted-foreground text-sm">Telegram открылся с вашей заявкой.<br />Мы свяжемся с вами в ближайшее время.</div>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-muted/50 border border-border mb-5 space-y-1 text-sm">
                  <div className="font-600 text-base mb-2">{orderProduct.name}</div>
                  <div className="text-muted-foreground flex gap-2"><Icon name="Cpu" size={13} className="text-primary mt-0.5 shrink-0" /> {orderProduct.cpu}</div>
                  <div className="text-muted-foreground flex gap-2"><Icon name="MonitorPlay" size={13} className="text-primary mt-0.5 shrink-0" /> {orderProduct.gpu}</div>
                  <div className="text-muted-foreground flex gap-2"><Icon name="MemoryStick" size={13} className="text-primary mt-0.5 shrink-0" /> {orderProduct.ram} ГБ RAM</div>
                  <div className="font-display font-700 text-lg text-primary mt-2">{fmt(orderProduct.price)}</div>
                </div>
                <div className="space-y-3 mb-5">
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-background border border-input focus:border-primary outline-none transition-colors"
                    placeholder="Ваше имя"
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                  />
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-background border border-input focus:border-primary outline-none transition-colors"
                    placeholder="Номер телефона"
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-600 h-12 glow-yellow"
                  disabled={!orderName.trim() || !orderPhone.trim()}
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
};

export default Index;