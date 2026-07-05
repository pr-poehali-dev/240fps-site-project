import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const HERO_IMG = 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/bucket/1ac8b245-73c4-4432-bd62-0af698d5fefa.png';

const NAV = [
  { label: 'Главная', href: '#home' },
  { label: 'Каталог', href: '#catalog' },
  { label: 'Калькулятор', href: '/calculator' },
  { label: 'О нас', href: '#about' },
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
  storage: number;
  price: number;
  fps: string;
  tag?: string;
  img: string;
  imgs?: string[];
};

const RAM_OPTIONS = [16, 32, 64];
const SSD_OPTIONS = [500, 1000, 2000];

type BlogPost = {
  title: string;
  date: string;
  cat: string;
  img: string;
  readTime: string;
  content: { heading: string; text: string }[];
};

const BLOG: BlogPost[] = [
  {
    title: 'Как выбрать видеокарту в 2026 году',
    date: '28 июня',
    cat: 'Гайд',
    readTime: '5 мин',
    img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/712e2f51-7255-4c98-a953-7b98d64e6433.jpg',
    content: [
      { heading: 'С чего начать?', text: 'Выбор видеокарты — одно из ключевых решений при сборке игрового ПК. В 2026 году рынок предлагает широкий выбор: от бюджетных RTX 5050 до флагманских RTX 5090. Главное — понять, под какие задачи и разрешение вы собираете компьютер.' },
      { heading: 'Разрешение и FPS', text: 'Для игр в Full HD (1080p) с частотой 144+ FPS отлично подойдут RTX 5060 и RTX 5060 Ti. Для 2K (1440p) с 165+ FPS — RTX 5070. Если цель — 4K или 240+ FPS в соревновательных играх, смотрите на RTX 5080 и RTX 5090.' },
      { heading: 'NVIDIA или AMD?', text: 'NVIDIA доминирует в трассировке лучей и DLSS 4.0 — технологии апскейлинга, которая позволяет получать больше FPS без потери качества. AMD предлагает отличное соотношение цена/производительность в чистой растеризации, особенно серия RX 9070.' },
      { heading: 'Объём памяти', text: 'Минимум для современных игр — 8 ГБ VRAM. Оптимально — 16 ГБ, особенно если планируете текстуры в высоком качестве или стриминг. RTX 5060 Ti 16Gb — один из лучших вариантов по соотношению цены и памяти в 2026 году.' },
      { heading: 'Итог', text: 'Не переплачивайте за топовые карты, если играете в 1080p. Подберите видеокарту под монитор и игры — и сборка от 240FPS поможет вам это сделать правильно.' },
    ],
  },
  {
    title: 'RTX 5090 vs RX 9070 XT: тесты в играх',
    date: '20 июня',
    cat: 'Обзор',
    readTime: '7 мин',
    img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/f8b1bf5e-4696-4533-b8be-8f102c7f62d1.jpg',
    content: [
      { heading: 'Противостояние флагманов', text: 'RTX 5090 — абсолютный топ от NVIDIA с 32 ГБ VRAM и поддержкой DLSS 4.0. RX 9070 XT — флагман AMD нового поколения, который предлагает впечатляющую производительность по значительно более доступной цене.' },
      { heading: 'Результаты в 4K', text: 'В Cyberpunk 2077 при максимальных настройках в 4K: RTX 5090 выдаёт 145 FPS со включённым ray tracing и DLSS Quality. RX 9070 XT показывает 98 FPS с FSR 4.0. Разница ощутимая, но и разница в цене — почти двукратная.' },
      { heading: 'Киберспортивные игры', text: 'В CS2 и Valorant при 1080p обе карты легко пробивают 400+ FPS — разница нивелируется. Для соревновательных игр переплачивать за 5090 нет смысла. Здесь решает связка с процессором: R7 9800X3D или Intel Ultra 9.' },
      { heading: 'Трассировка лучей', text: 'По ray tracing NVIDIA по-прежнему впереди — преимущество RTX 5090 достигает 60% в некоторых сценах Cyberpunk. Если для вас важна кинематографическая картинка, выбор очевиден. Если нет — AMD выгоднее.' },
      { heading: 'Наш вердикт', text: 'RTX 5090 — лучшая карта на рынке, но её цена оправдана только при 4K-гейминге с ray tracing. RX 9070 XT — феноменальный выбор за свои деньги. В 240FPS мы используем обе в разных конфигурациях под задачи клиента.' },
    ],
  },
  {
    title: 'Топ-5 сборок для киберспорта',
    date: '11 июня',
    cat: 'Подборка',
    readTime: '4 мин',
    img: 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/ce0c5cae-d52d-4177-9693-dd7a70fcfdc6.jpg',
    content: [
      { heading: 'Что важно для киберспорта?', text: 'В соревновательном гейминге главное — стабильно высокий FPS (200+), минимальный input lag и надёжность. Красивая графика уходит на второй план — важна скорость отклика и предсказуемость работы системы.' },
      { heading: '1. DOMINATOR V3 — лучший старт', text: 'R5 7500F + RTX 5060 Ti 16Gb + 32 ГБ RAM. Выдаёт 200+ FPS в CS2 и Valorant при средних настройках. Отличный выбор для начинающего киберспортсмена с бюджетом до 135 000 ₽.' },
      { heading: '2. DOMINATOR V4 — для серьёзных игроков', text: 'R7 7800X3D + RTX 5060 Ti 16Gb. Процессор с 3D V-Cache обеспечивает феноменальный прирост в играх. CS2: 350+ FPS. Valorant: 450+ FPS. Идеален для игр на мониторах 240 Гц и выше.' },
      { heading: '3. BERSERK V3 — баланс мощи', text: 'R7 7800X3D + RTX 5070. Универсальная машина — одинаково хороша и в киберспорте, и в ААА-играх с трассировкой. 300+ FPS в соревновательных тайтлах гарантировано.' },
      { heading: '4. BERSERK V4 — новый уровень', text: 'R7 9800X3D + RTX 5070. Новейший процессор AMD с ещё большим кешем. Прирост в CS2 относительно 7800X3D — около 15%. Для тех, кто хочет всё и сразу.' },
      { heading: '5. BERSERK V2 — абсолютный топ', text: 'Intel Ultra 9 285K + RTX 5080 + 64 ГБ RAM. Максимум производительности без компромиссов. 360+ FPS в любой дисциплине. Флагман линейки 240FPS для профессиональных игроков.' },
    ],
  },
];

const fmt = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

const PRODUCTS_URL = 'https://functions.poehali.dev/c48cecd4-2c62-4a36-a7c7-f88df7d5ea05';

type ApiProduct = {
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
  tag?: string;
  img: string;
  imgs?: string[];
};

const mapProduct = (p: ApiProduct): Product => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  cpuBrand: p.cpu_brand,
  cpu: p.cpu,
  gpu: p.gpu,
  ram: p.ram,
  storage: p.storage,
  price: p.price,
  fps: p.fps,
  tag: p.tag,
  img: p.img,
  imgs: p.imgs,
});

const PRICE_MIN = 77000;
const PRICE_MAX = 350000;

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [price, setPrice] = useState<number[]>([PRICE_MIN, PRICE_MAX]);
  const [gpuModels, setGpuModels] = useState<string[]>([]);
  const [cpuModels, setCpuModels] = useState<string[]>([]);
  const [rams, setRams] = useState<number[]>([]);
  const [ssds, setSsds] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState({ price: false, gpu: false, cpu: false, ram: false, ssd: false });
  const [cart, setCart] = useState<number[]>([]);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [orderName, setOrderName] = useState('');
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [productModal, setProductModal] = useState<Product | null>(null);
  const [productImgIdx, setProductImgIdx] = useState(0);
  const [orderPhone, setOrderPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSent, setCallbackSent] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch(PRODUCTS_URL)
      .then((r) => r.json())
      .then((rows: ApiProduct[]) => setProducts(rows.map(mapProduct)))
      .catch(() => {});
  }, []);

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

  const gpuOptions = useMemo(() => [...new Set(products.map((p) => p.gpu))].sort(), [products]);
  const cpuOptions = useMemo(() => [...new Set(products.map((p) => p.cpu))].sort(), [products]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.price >= price[0] && p.price <= price[1] &&
          (gpuModels.length === 0 || gpuModels.includes(p.gpu)) &&
          (cpuModels.length === 0 || cpuModels.includes(p.cpu)) &&
          (rams.length === 0 || rams.includes(p.ram)) &&
          (ssds.length === 0 || ssds.includes(p.storage))
      ),
    [products, price, gpuModels, cpuModels, rams, ssds]
  );

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container flex items-center justify-between h-16 md:h-18 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <a href="/admin/stats" className="w-4 h-8 opacity-0 cursor-default" aria-hidden="true" tabIndex={-1} />
            <a href="#home" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-primary flex items-center justify-center glow-yellow shrink-0">
                <Icon name="Zap" className="text-primary-foreground" size={20} />
              </div>
              <span className="font-display font-700 text-xl md:text-2xl tracking-tight">
                240<span className="text-primary">FPS</span>
              </span>
            </a>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="text-sm font-500 text-muted-foreground hover:text-primary transition-colors">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <Button variant="outline" size="sm" className="hidden lg:flex border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground" onClick={() => setCallbackOpen(true)}>
              <Icon name="Phone" size={16} /> Заказать звонок
            </Button>
            <button className="relative shrink-0">
              <Icon name="ShoppingCart" size={22} className="text-foreground hover:text-primary transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center font-600">
                  {cart.length}
                </span>
              )}
            </button>
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
                <Button
                  className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-600 glow-yellow"
                  onClick={() => { setMobileMenuOpen(false); setCallbackOpen(true); }}
                >
                  <Icon name="Phone" size={16} /> Заказать звонок
                </Button>
              </SheetContent>
            </Sheet>
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
                <a href="/calculator"><Icon name="Calculator" size={18} /> Собрать свой ПК</a>
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
          <aside className="space-y-1 p-6 rounded-xl bg-card border border-border h-fit lg:sticky lg:top-24">
            <h3 className="font-display font-600 text-lg uppercase mb-4 flex items-center gap-2">
              <Icon name="SlidersHorizontal" size={18} className="text-primary" /> Фильтры
            </h3>

            <Collapsible open={filterOpen.price} onOpenChange={(o) => setFilterOpen((f) => ({ ...f, price: o }))} className="border-t border-border pt-4 pb-1">
              <CollapsibleTrigger className="w-full flex items-center justify-between text-sm font-500 mb-1">
                <span>Цена</span>
                <Icon name="ChevronDown" size={16} className={`text-muted-foreground transition-transform ${filterOpen.price ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="text-sm text-muted-foreground mb-3">{fmt(price[0])} — {fmt(price[1])}</div>
                <Slider min={PRICE_MIN} max={PRICE_MAX} step={1000} value={price} onValueChange={setPrice} minStepsBetweenThumbs={1} />
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="number"
                    min={PRICE_MIN}
                    max={price[1]}
                    step={1000}
                    value={price[0]}
                    onChange={(e) => {
                      const v = Math.min(Number(e.target.value) || PRICE_MIN, price[1]);
                      setPrice([Math.max(v, PRICE_MIN), price[1]]);
                    }}
                    className="w-full min-w-0 h-9 px-2 rounded-md bg-background border border-input text-sm outline-none focus:border-primary transition-colors"
                  />
                  <span className="text-muted-foreground shrink-0">—</span>
                  <input
                    type="number"
                    min={price[0]}
                    max={PRICE_MAX}
                    step={1000}
                    value={price[1]}
                    onChange={(e) => {
                      const v = Math.max(Number(e.target.value) || PRICE_MAX, price[0]);
                      setPrice([price[0], Math.min(v, PRICE_MAX)]);
                    }}
                    className="w-full min-w-0 h-9 px-2 rounded-md bg-background border border-input text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={filterOpen.gpu} onOpenChange={(o) => setFilterOpen((f) => ({ ...f, gpu: o }))} className="border-t border-border pt-4 pb-1">
              <CollapsibleTrigger className="w-full flex items-center justify-between text-sm font-500 mb-1">
                <span>Видеокарта{gpuModels.length > 0 ? ` (${gpuModels.length})` : ''}</span>
                <Icon name="ChevronDown" size={16} className={`text-muted-foreground transition-transform ${filterOpen.gpu ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                {gpuModels.length > 0 && (
                  <button onClick={() => setGpuModels([])} className="text-xs text-muted-foreground hover:text-primary transition-colors mb-2 block">сбросить</button>
                )}
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {gpuOptions.map((g) => (
                    <label key={g} className="flex items-center gap-3 cursor-pointer text-sm">
                      <Checkbox checked={gpuModels.includes(g)} onCheckedChange={() => toggle(gpuModels, g, setGpuModels)} />
                      {g}
                    </label>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={filterOpen.cpu} onOpenChange={(o) => setFilterOpen((f) => ({ ...f, cpu: o }))} className="border-t border-border pt-4 pb-1">
              <CollapsibleTrigger className="w-full flex items-center justify-between text-sm font-500 mb-1">
                <span>Процессор{cpuModels.length > 0 ? ` (${cpuModels.length})` : ''}</span>
                <Icon name="ChevronDown" size={16} className={`text-muted-foreground transition-transform ${filterOpen.cpu ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                {cpuModels.length > 0 && (
                  <button onClick={() => setCpuModels([])} className="text-xs text-muted-foreground hover:text-primary transition-colors mb-2 block">сбросить</button>
                )}
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {cpuOptions.map((c) => (
                    <label key={c} className="flex items-center gap-3 cursor-pointer text-sm">
                      <Checkbox checked={cpuModels.includes(c)} onCheckedChange={() => toggle(cpuModels, c, setCpuModels)} />
                      {c}
                    </label>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={filterOpen.ram} onOpenChange={(o) => setFilterOpen((f) => ({ ...f, ram: o }))} className="border-t border-border pt-4 pb-1">
              <CollapsibleTrigger className="w-full flex items-center justify-between text-sm font-500 mb-1">
                <span>Оперативная память{rams.length > 0 ? ` (${rams.length})` : ''}</span>
                <Icon name="ChevronDown" size={16} className={`text-muted-foreground transition-transform ${filterOpen.ram ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                {RAM_OPTIONS.map((r) => (
                  <label key={r} className="flex items-center gap-3 cursor-pointer text-sm">
                    <Checkbox checked={rams.includes(r)} onCheckedChange={() => toggle(rams, r, setRams)} />
                    {r} ГБ
                  </label>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={filterOpen.ssd} onOpenChange={(o) => setFilterOpen((f) => ({ ...f, ssd: o }))} className="border-t border-border pt-4 pb-1">
              <CollapsibleTrigger className="w-full flex items-center justify-between text-sm font-500 mb-1">
                <span>SSD накопитель{ssds.length > 0 ? ` (${ssds.length})` : ''}</span>
                <Icon name="ChevronDown" size={16} className={`text-muted-foreground transition-transform ${filterOpen.ssd ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                {SSD_OPTIONS.map((s) => (
                  <label key={s} className="flex items-center gap-3 cursor-pointer text-sm">
                    <Checkbox checked={ssds.includes(s)} onCheckedChange={() => toggle(ssds, s, setSsds)} />
                    {s >= 1000 ? `${s / 1000} ТБ` : `${s} ГБ`}
                  </label>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-primary mt-4"
              onClick={() => { setPrice([PRICE_MIN, PRICE_MAX]); setGpuModels([]); setCpuModels([]); setRams([]); setSsds([]); }}
            >
              Сбросить фильтры
            </Button>
          </aside>

          {/* Products */}
          <div className="grid gap-5 items-start" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {filtered.map((p) => (
              <div key={p.id} className="group rounded-xl bg-card border border-border overflow-hidden hover:border-primary/60 transition-all hover:-translate-y-1">
                <div
                  className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
                  onClick={() => { setProductModal(p); setProductImgIdx(0); }}
                >
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {p.tag && <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-600">{p.tag}</Badge>}
                  <Badge className="absolute top-3 right-3 bg-secondary/90 text-secondary-foreground font-500">{p.fps}</Badge>
                  {p.imgs && p.imgs.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 rounded-md px-2 py-1 text-xs text-white flex items-center gap-1">
                      <Icon name="Images" size={12} /> {p.imgs.length}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="font-display font-600 text-lg mb-3">{p.name}</div>
                  <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2"><Icon name="Cpu" size={14} className="text-primary" /> {p.cpu}</div>
                    <div className="flex items-center gap-2"><Icon name="Gpu" size={14} className="text-primary" fallback="MonitorPlay" /> {p.gpu}</div>
                    <div className="flex items-center gap-2"><Icon name="MemoryStick" size={14} className="text-primary" /> {p.ram} ГБ RAM</div>
                    <div className="flex items-center gap-2"><Icon name="HardDrive" size={14} className="text-primary" /> SSD {p.storage >= 1000 ? `${p.storage / 1000} ТБ` : `${p.storage} ГБ`}</div>
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
            <Badge className="bg-primary/15 text-primary border-primary/30 mb-4 font-500">О нас</Badge>
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
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {BLOG.map((b) => (
            <button key={b.title} onClick={() => setBlogPost(b)} className="group text-left rounded-xl bg-card border border-border overflow-hidden hover:border-primary/60 transition-all hover:-translate-y-1">
              <div className="aspect-video overflow-hidden bg-muted">
                <img src={b.img} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <Badge variant="outline" className="border-primary/40 text-primary">{b.cat}</Badge>
                  {b.date}
                  <span className="ml-auto flex items-center gap-1"><Icon name="Clock" size={11} /> {b.readTime}</span>
                </div>
                <div className="font-600 group-hover:text-primary transition-colors">{b.title}</div>
              </div>
            </button>
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
                { i: 'Phone', t: '+7-999-456-09-06', s: 'Ежедневно 9:00–21:00', href: 'tel:+79994560906' },
                { i: 'Send', t: 'Telegram: @Omsk_240FPS', s: 'Напишите нам в Telegram', href: 'https://t.me/Omsk_240FPS' },
                { i: 'Users', t: 'ВКонтакте: vk.com/fps240', s: 'Наша группа ВКонтакте', href: 'https://vk.com/fps240' },
                { i: 'MapPin', t: 'Омск, 70 Лет Октября 20', s: 'Магазин "240ФПС" · Самовывоз и доставка по РФ', href: 'https://yandex.ru/maps/?text=Омск+70+Лет+Октября+20' },
                { i: 'MapPin', t: 'Тюмень, Казачьи Луга 9', s: 'Магазин "240ФПС" · Самовывоз и доставка по РФ', href: 'https://yandex.ru/maps/?text=Тюмень+Казачьи+Луга+9' },
                { i: 'MapPin', t: 'Краснодар, Восточно-Кругликовская 30/2', s: 'Магазин "240ФПС" · Самовывоз и доставка по РФ', href: 'https://yandex.ru/maps/?text=Краснодар+Восточно-Кругликовская+30/2' },
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
        <div className="container py-10 flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="Zap" className="text-primary-foreground" size={18} />
            </div>
            <span className="font-display font-700 text-xl">240<span className="text-primary">FPS</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground max-w-full px-2">
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
              <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-secondary transition-colors shrink-0">
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
                  <div className="text-muted-foreground flex gap-2"><Icon name="HardDrive" size={13} className="text-primary mt-0.5 shrink-0" /> SSD {orderProduct.storage >= 1000 ? `${orderProduct.storage / 1000} ТБ` : `${orderProduct.storage} ГБ`}</div>
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

      {/* Blog Article Modal */}
      {blogPost && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={() => setBlogPost(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video overflow-hidden rounded-t-2xl">
              <img src={blogPost.img} alt={blogPost.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <Badge variant="outline" className="border-primary/40 text-primary">{blogPost.cat}</Badge>
                {blogPost.date}
                <span className="flex items-center gap-1"><Icon name="Clock" size={11} /> {blogPost.readTime}</span>
                <button onClick={() => setBlogPost(null)} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="X" size={18} />
                </button>
              </div>
              <h2 className="font-display font-700 text-2xl md:text-3xl uppercase mb-6">{blogPost.title}</h2>
              <div className="space-y-5">
                {blogPost.content.map((section) => (
                  <div key={section.heading}>
                    <h3 className="font-600 text-primary mb-2">{section.heading}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{section.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-border">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-600 glow-yellow" asChild>
                  <a href="#catalog"><Icon name="Cpu" size={16} /> Выбрать сборку</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Photo Gallery Modal */}
      {productModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setProductModal(null)}>
          <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setProductModal(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors z-10">
              <Icon name="X" size={24} />
            </button>
            <div className="rounded-2xl overflow-hidden border border-border">
              <img
                src={productModal.imgs?.[productImgIdx] ?? productModal.img}
                alt={productModal.name}
                className="w-full object-cover max-h-[70vh]"
              />
            </div>
            {productModal.imgs && productModal.imgs.length > 1 && (
              <div className="flex gap-3 mt-4 justify-center">
                {productModal.imgs.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setProductImgIdx(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === productImgIdx ? 'border-primary' : 'border-border opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="text-center mt-3 text-white/70 text-sm font-500">{productModal.name}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;