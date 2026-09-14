import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { buildSlug } from '@/lib/buildSlug';

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
const SEND_LEAD_URL = 'https://functions.poehali.dev/0417654c-b782-4720-851a-0c4f89751599';

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
  const [callbackSending, setCallbackSending] = useState(false);
  const [callbackError, setCallbackError] = useState('');
  const [orderSending, setOrderSending] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactComment, setContactComment] = useState('');
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    fetch(PRODUCTS_URL)
      .then((r) => r.json())
      .then((rows: ApiProduct[]) => setProducts(rows.map(mapProduct)))
      .catch(() => {});
  }, []);

  const sendLead = async (text: string): Promise<boolean> => {
    try {
      const res = await fetch(SEND_LEAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      return Boolean(data.ok);
    } catch {
      return false;
    }
  };

  const sendCallback = async () => {
    setCallbackSending(true);
    setCallbackError('');
    const text = `📞 Заявка на звонок!\n\n👤 Имя: ${callbackName}\n📞 Телефон: ${callbackPhone}`;
    const ok = await sendLead(text);
    setCallbackSending(false);
    if (!ok) {
      setCallbackError('Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.');
      return;
    }
    setCallbackSent(true);
    setTimeout(() => {
      setCallbackSent(false);
      setCallbackOpen(false);
      setCallbackName('');
      setCallbackPhone('');
    }, 3000);
  };

  const sendOrder = async () => {
    if (!orderProduct) return;
    setOrderSending(true);
    setOrderError('');
    const text = `Заявка на покупку!\n\n🖥 ${orderProduct.name}\nЦП: ${orderProduct.cpu}\nГП: ${orderProduct.gpu}\nОЗУ: ${orderProduct.ram} ГБ\nЦена: ${fmt(orderProduct.price)}\n\n👤 Имя: ${orderName}\n📞 Телефон: ${orderPhone}`;
    const ok = await sendLead(text);
    setOrderSending(false);
    if (!ok) {
      setOrderError('Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.');
      return;
    }
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setOrderProduct(null);
      setOrderName('');
      setOrderPhone('');
    }, 3000);
  };

  const sendContact = async () => {
    setContactSending(true);
    setContactError('');
    const text = `📝 Заявка с сайта!\n\n👤 Имя: ${contactName}\n📞 Телефон: ${contactPhone}${contactComment ? `\n💬 Комментарий: ${contactComment}` : ''}`;
    const ok = await sendLead(text);
    setContactSending(false);
    if (!ok) {
      setContactError('Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.');
      return;
    }
    setContactSent(true);
    setContactName('');
    setContactPhone('');
    setContactComment('');
    setTimeout(() => setContactSent(false), 4000);
  };

  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const gpuOptions = useMemo(() => [...new Set(products.map((p) => p.gpu))].sort(), [products]);
  const cpuOptions = useMemo(() => [...new Set(products.map((p) => p.cpu))].sort(), [products]);

  const filtered = useMemo(
    () =>
      products
        .filter(
          (p) =>
            p.price >= price[0] && p.price <= price[1] &&
            (gpuModels.length === 0 || gpuModels.includes(p.gpu)) &&
            (cpuModels.length === 0 || cpuModels.includes(p.cpu)) &&
            (rams.length === 0 || rams.includes(p.ram)) &&
            (ssds.length === 0 || ssds.includes(p.storage))
        )
        .sort((a, b) => a.price - b.price),
    [products, price, gpuModels, cpuModels, rams, ssds]
  );

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/75 border-b border-border/80 shadow-lg shadow-black/20">
        <div className="container flex items-center justify-between h-16 md:h-18 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <a href="/admin/stats" className="w-4 h-8 opacity-0 cursor-default" aria-hidden="true" tabIndex={-1} />
            <a href="#home" className="group flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-primary flex items-center justify-center glow-yellow shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-8deg]">
                <Icon name="Zap" className="text-primary-foreground" size={20} />
              </div>
              <span className="font-display font-700 text-xl md:text-2xl tracking-[-0.02em]">
                240<span className="text-primary">FPS</span>
              </span>
            </a>
          </div>
          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="relative text-sm font-600 text-muted-foreground hover:text-foreground transition-colors duration-300 py-1 after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <Button variant="outline" size="sm" className="hidden lg:flex border-secondary/60 text-secondary font-600 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all duration-300 hover:glow-purple-strong" onClick={() => setCallbackOpen(true)}>
              <Icon name="Phone" size={16} /> Заказать звонок
            </Button>
            <button className="relative shrink-0 transition-transform duration-300 hover:scale-110 active:scale-95">
              <Icon name="ShoppingCart" size={22} className="text-foreground hover:text-primary transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center font-700 animate-pulse-ring">
                  {cart.length}
                </span>
              )}
            </button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden shrink-0 -mr-1 p-2 text-foreground hover:text-primary transition-colors active:scale-90" aria-label="Меню">
                  <Icon name="Menu" size={24} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-4/5 max-w-xs flex flex-col bg-card/95 backdrop-blur-xl">
                <div className="flex items-center gap-2.5 mb-8">
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center glow-yellow">
                    <Icon name="Zap" className="text-primary-foreground" size={18} />
                  </div>
                  <span className="font-display font-700 text-xl tracking-tight">
                    240<span className="text-primary">FPS</span>
                  </span>
                </div>
                <nav className="flex flex-col gap-1.5">
                  {NAV.map((n) => (
                    <a
                      key={n.label}
                      href={n.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center justify-between py-3.5 px-3 rounded-xl text-base font-600 text-foreground border border-transparent hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-all duration-300 active:scale-[0.98]"
                    >
                      {n.label}
                      <Icon name="ChevronRight" size={16} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </a>
                  ))}
                </nav>
                <Button
                  className="btn-sheen mt-7 h-12 bg-primary text-primary-foreground hover:bg-primary font-700 uppercase tracking-wide glow-yellow active:scale-[0.98] transition-transform"
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
            <Badge className="bg-secondary/15 text-secondary border-secondary/40 mb-7 font-600 uppercase text-[11px] tracking-[0.18em] px-3 py-1.5 backdrop-blur-sm">
              Сборка мечты за 24 часа
            </Badge>
            <h1 className="font-display font-700 text-[3.25rem] leading-[0.88] md:text-[5.5rem] uppercase mb-7 tracking-[-0.03em]">
              Больше <span className="text-gradient">кадров</span> —<br />больше <span className="text-primary">побед</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mb-10 leading-relaxed">
              Игровые компьютеры на RTX 5060–5090 от 240FPS — готовые сборки и ПК на заказ с максимальной производительностью. Мощь без компромиссов.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3.5">
              <Button size="lg" className="btn-sheen w-full sm:w-auto h-13 py-3.5 bg-primary text-primary-foreground hover:bg-primary font-700 uppercase tracking-wide glow-yellow transition-all duration-300 hover:glow-yellow-strong sm:hover:scale-[1.04] active:scale-95" asChild>
                <a href="#catalog"><Icon name="Cpu" size={18} /> Выбрать компьютер</a>
              </Button>
              <Button size="lg" className="btn-sheen w-full sm:w-auto h-13 py-3.5 bg-secondary text-secondary-foreground hover:bg-secondary font-700 uppercase tracking-wide glow-purple transition-all duration-300 hover:glow-purple-strong sm:hover:scale-[1.04] active:scale-95" asChild>
                <a href="/calculator"><Icon name="Calculator" size={18} /> Собрать свой ПК</a>
              </Button>
            </div>
            <div className="flex gap-6 sm:gap-10 mt-14">
              {[['5000+', 'Сборок'], ['5.0', 'Рейтинг'], ['1 год', 'Гарантия']].map(([v, l], i) => (
                <div key={l} className={`relative ${i > 0 ? 'pl-6 sm:pl-10 border-l border-border/70' : ''}`}>
                  <div className="font-display font-700 text-3xl sm:text-4xl text-primary tracking-tight leading-none mb-1.5">{v}</div>
                  <div className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-scale-in">
            <div className="absolute -inset-4 bg-secondary/30 blur-3xl rounded-full animate-glow" />
            <div className="absolute -inset-2 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/30 blur-2xl rounded-full" />
            <img src={HERO_IMG} alt="Игровой ПК 240FPS" className="relative rounded-2xl border border-border/80 w-full object-cover shadow-2xl shadow-black/60 animate-float" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16 md:py-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: 'Rocket', t: 'Максимальный FPS', d: 'Оптимизация под 240+ кадров' },
          { icon: 'ShieldCheck', t: 'Гарантия 1 год', d: 'Официальная поддержка' },
          { icon: 'Truck', t: 'Доставка по РФ', d: 'Бережная упаковка' },
          { icon: 'Wrench', t: 'Тест 24 часа', d: 'Каждая сборка под нагрузкой' },
        ].map((f) => (
          <div key={f.t} className="group card-premium edge-light p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:scale-110">
              <Icon name={f.icon} className="text-primary" size={24} />
            </div>
            <div className="font-display font-700 uppercase tracking-tight text-lg mb-1.5">{f.t}</div>
            <div className="text-sm text-muted-foreground leading-relaxed">{f.d}</div>
          </div>
        ))}
      </section>

      {/* Catalog */}
      <section id="catalog" className="container py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="section-eyebrow">Готовые сборки</div>
            <h2 className="section-title text-4xl md:text-5xl">Каталог</h2>
          </div>
          <p className="text-sm text-muted-foreground pb-1">
            Найдено сборок: <span className="text-primary font-700 font-display text-lg">{filtered.length}</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Filters */}
          <aside className="space-y-1 p-6 rounded-2xl bg-card border border-border h-fit lg:sticky lg:top-24 shadow-xl shadow-black/30">
            <h3 className="font-display font-700 text-lg uppercase tracking-tight mb-4 flex items-center gap-2">
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
              <div key={p.id} className="group card-premium edge-light">
                <div
                  className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
                  onClick={() => { setProductModal(p); setProductImgIdx(0); }}
                >
                  <img src={p.img} alt={`Игровой компьютер ${p.name} — ${p.cpu}, ${p.gpu}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.09]" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-secondary/25 via-transparent to-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  {p.tag && <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-700 uppercase text-[10px] tracking-wider shadow-lg shadow-primary/30">{p.tag}</Badge>}
                  <Badge className="absolute top-3 right-3 bg-background/70 backdrop-blur-md text-primary border border-primary/40 font-700 text-[10px] tracking-wider">{p.fps}</Badge>
                  {p.imgs && p.imgs.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-background/70 backdrop-blur-md border border-border/60 rounded-lg px-2 py-1 text-xs text-foreground flex items-center gap-1">
                      <Icon name="Images" size={12} /> {p.imgs.length}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <a
                    href={`/build/${buildSlug(p.name)}`}
                    className="block font-display font-700 text-xl uppercase tracking-tight mb-3 group-hover:text-primary transition-colors duration-300"
                  >
                    {p.name}
                  </a>
                  <div className="space-y-2 text-sm text-muted-foreground mb-5">
                    <div className="flex items-center gap-2.5"><Icon name="Cpu" size={14} className="text-primary shrink-0" /> {p.cpu}</div>
                    <div className="flex items-center gap-2.5"><Icon name="Gpu" size={14} className="text-primary shrink-0" fallback="MonitorPlay" /> {p.gpu}</div>
                    <div className="flex items-center gap-2.5"><Icon name="MemoryStick" size={14} className="text-primary shrink-0" /> {p.ram} ГБ RAM</div>
                    <div className="flex items-center gap-2.5"><Icon name="HardDrive" size={14} className="text-primary shrink-0" /> SSD {p.storage >= 1000 ? `${p.storage / 1000} ТБ` : `${p.storage} ГБ`}</div>
                  </div>
                  <div className="flex items-end justify-between gap-3 pt-4 border-t border-border/70">
                    <div className="leading-none">
                      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Цена</div>
                      <span className="font-display font-700 text-2xl text-primary">{fmt(p.price)}</span>
                    </div>
                    <Button
                      size="sm"
                      className="btn-sheen bg-secondary text-secondary-foreground hover:bg-secondary font-700 uppercase tracking-wide transition-all duration-300 hover:glow-purple-strong hover:scale-[1.04] active:scale-95"
                      onClick={() => setOrderProduct(p)}
                    >
                      <Icon name="Plus" size={16} />
                      Купить
                    </Button>
                  </div>
                  <a
                    href={`/build/${buildSlug(p.name)}`}
                    className="mt-3 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-border/70 text-xs font-600 uppercase tracking-wider text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300"
                  >
                    Подробнее <Icon name="ArrowRight" size={13} />
                  </a>
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
      <section id="about" className="relative grid-bg noise-overlay py-20 md:py-28 border-y border-border">
        <div className="container grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="section-eyebrow">О нас</div>
            <h2 className="section-title text-4xl md:text-5xl mb-6 leading-[1.05]">Мы собираем компьютеры мечты</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              240FPS — команда энтузиастов, которая с 2018 года создаёт игровые ПК для геймеров, стримеров и киберспортсменов.
              Каждая сборка проходит стресс-тест 24 часа перед отправкой.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Используем только оригинальные комплектующие с официальной гарантией и подбираем конфигурацию под ваши задачи и бюджет.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['Cpu', 'Только оригинальные детали'], ['Headphones', 'Поддержка 24/7'], ['Award', 'Официальная гарантия'], ['Gauge', 'Тонкая оптимизация FPS']].map(([i, t]) => (
                <div key={t} className="group flex items-center gap-3.5 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-3 transition-all duration-300 hover:border-secondary/50 hover:bg-card/70">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 border border-secondary/30 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <Icon name={i} size={18} className="text-secondary" />
                  </div>
                  <span className="text-sm font-600 leading-snug">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 bg-secondary/20 blur-3xl rounded-full" />
            <img src={HERO_IMG} alt="Сборка ПК" loading="lazy" className="relative rounded-2xl border border-border/80 w-full object-cover glow-purple" />
          </div>
        </div>
      </section>

      {/* Blog */}
      <section id="blog" className="container py-16 md:py-20">
        <div className="mb-10">
          <div className="section-eyebrow">Полезное</div>
          <h2 className="section-title text-4xl md:text-5xl">Блог</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {BLOG.map((b) => (
            <button key={b.title} onClick={() => setBlogPost(b)} className="group card-premium edge-light text-left">
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img src={b.img} alt={b.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.09]" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-70" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <Badge variant="outline" className="border-primary/40 text-primary uppercase text-[10px] tracking-wider font-700">{b.cat}</Badge>
                  {b.date}
                  <span className="ml-auto flex items-center gap-1"><Icon name="Clock" size={11} /> {b.readTime}</span>
                </div>
                <div className="font-display font-700 text-lg leading-snug uppercase tracking-tight group-hover:text-primary transition-colors duration-300">{b.title}</div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-600 uppercase tracking-wider text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Читать <Icon name="ArrowRight" size={13} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Contacts */}
      <section id="contacts" className="relative grid-bg py-20 border-t border-border">
        <div className="container grid lg:grid-cols-2 gap-12">
          <div>
            <div className="section-eyebrow">Связаться</div>
            <h2 className="section-title text-4xl md:text-5xl mb-5">Контакты</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">Свяжитесь с нами любым удобным способом — поможем подобрать сборку.</p>
            <div className="space-y-5">
              {[
                { i: 'Phone', t: '+7-913-149-82-40', s: 'Ежедневно 10:00–19:00', href: 'tel:+79131498240' },
                { i: 'Phone', t: '+7-999-456-09-06', s: 'Ежедневно 9:00–21:00', href: 'tel:+79994560906' },
                { i: 'Send', t: 'Telegram: @Omsk_240FPS', s: 'Напишите нам в Telegram', href: 'https://t.me/Omsk_240FPS' },
                { i: 'Users', t: 'ВКонтакте: vk.com/fps240', s: 'Наша группа ВКонтакте', href: 'https://vk.com/fps240' },
                { i: 'MapPin', t: 'Омск, 70 Лет Октября 20', s: 'Магазин "240ФПС" · Самовывоз и доставка по РФ', href: 'https://yandex.ru/maps/?text=Омск+70+Лет+Октября+20' },
                { i: 'MapPin', t: 'Тюмень, Казачьи Луга 9', s: 'Магазин "240ФПС" · Самовывоз и доставка по РФ', href: 'https://yandex.ru/maps/?text=Тюмень+Казачьи+Луга+9' },
                { i: 'MapPin', t: 'Краснодар, Восточно-Кругликовская 30/2', s: 'Магазин "240ФПС" · Самовывоз и доставка по РФ', href: 'https://yandex.ru/maps/?text=Краснодар+Восточно-Кругликовская+30/2' },
              ].map((c) => (
                <div key={c.t} className="group flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:scale-105">
                    <Icon name={c.i} size={22} className="text-primary" />
                  </div>
                  <div className="min-w-0">
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
          <div className="card-premium p-8 hover:translate-y-0">
            <h3 className="font-display font-700 text-2xl uppercase tracking-tight mb-6">Оставить заявку</h3>
            {contactSent ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center glow-yellow">
                  <Icon name="CheckCircle" size={36} className="text-primary" />
                </div>
                <div className="font-display font-700 text-xl">Заявка отправлена!</div>
                <div className="text-muted-foreground text-sm">Мы свяжемся с вами в ближайшее время.</div>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  className="w-full h-12 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
                  placeholder="Ваше имя"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
                <input
                  className="w-full h-12 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
                  placeholder="Телефон"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 min-h-28 resize-none"
                  placeholder="Комментарий"
                  value={contactComment}
                  onChange={(e) => setContactComment(e.target.value)}
                />
                {contactError && <div className="text-destructive text-sm">{contactError}</div>}
                <Button
                  className="btn-sheen w-full bg-primary text-primary-foreground hover:bg-primary font-700 uppercase tracking-wide h-13 py-3.5 glow-yellow transition-all duration-300 hover:glow-yellow-strong active:scale-[0.98] disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:opacity-100"
                  disabled={!contactName.trim() || !contactPhone.trim() || contactSending}
                  onClick={sendContact}
                >
                  {contactSending ? (
                    <><Icon name="Loader2" size={18} className="animate-spin" /> Отправляем…</>
                  ) : (
                    <><Icon name="Send" size={18} /> Отправить заявку</>
                  )}
                </Button>
              </div>
            )}
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
                {callbackError && <div className="text-destructive text-sm mb-3">{callbackError}</div>}
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-600 h-12 glow-yellow"
                  disabled={!callbackName.trim() || !callbackPhone.trim() || callbackSending}
                  onClick={sendCallback}
                >
                  {callbackSending ? (
                    <><Icon name="Loader2" size={18} className="animate-spin" /> Отправляем…</>
                  ) : (
                    <><Icon name="Phone" size={18} /> Перезвоните мне</>
                  )}
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
                <div className="text-muted-foreground text-sm">Мы свяжемся с вами в ближайшее время.</div>
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
                {orderError && <div className="text-destructive text-sm mb-3">{orderError}</div>}
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-600 h-12 glow-yellow"
                  disabled={!orderName.trim() || !orderPhone.trim() || orderSending}
                  onClick={sendOrder}
                >
                  {orderSending ? (
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