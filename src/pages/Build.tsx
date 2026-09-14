import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BuildProduct, findBySlug, buildSlug, storageLabel, fmtPrice } from '@/lib/buildSlug';

const PRODUCTS_URL = 'https://functions.poehali.dev/c48cecd4-2c62-4a36-a7c7-f88df7d5ea05';
const SEND_LEAD_URL = 'https://functions.poehali.dev/0417654c-b782-4720-851a-0c4f89751599';

type ApiProduct = {
  id: number; name: string; brand: string; cpu_brand: string; cpu: string;
  gpu: string; ram: number; storage: number; price: number; fps: string;
  tag?: string; img: string; imgs?: string[];
};

const mapProduct = (p: ApiProduct): BuildProduct => ({
  id: p.id, name: p.name, brand: p.brand, cpuBrand: p.cpu_brand, cpu: p.cpu,
  gpu: p.gpu, ram: p.ram, storage: p.storage, price: p.price, fps: p.fps,
  tag: p.tag, img: p.img, imgs: p.imgs,
});

const Build = () => {
  const { slug = '' } = useParams();
  const [products, setProducts] = useState<BuildProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(PRODUCTS_URL)
      .then((r) => r.json())
      .then((rows: ApiProduct[]) => setProducts(rows.map(mapProduct)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const product = useMemo(() => findBySlug(products, slug), [products, slug]);

  const similar = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id)
      .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price))
      .slice(0, 3);
  }, [products, product]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const list = product.imgs?.length ? product.imgs : [product.img];
    return list;
  }, [product]);

  // SEO: заголовок, описание и микроразметка товара для поисковиков и Яндекс.Товаров
  useEffect(() => {
    if (!product) return;
    const title = `${product.name} — игровой ПК ${product.cpu} / ${product.gpu} | 240FPS`;
    const desc = `Игровой компьютер ${product.name}: ${product.cpu}, ${product.gpu}, ${product.ram} ГБ RAM, SSD ${storageLabel(product.storage)}. ${product.fps} в играх. Цена ${fmtPrice(product.price)}. Гарантия 1 год, доставка по РФ.`;
    document.title = title;

    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:image', product.img);
    setMeta('property', 'og:type', 'product');
    setMeta('property', 'og:url', window.location.href);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/build/${buildSlug(product.name)}`;

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: gallery,
      description: desc,
      brand: { '@type': 'Brand', name: '240FPS' },
      sku: `BUILD-${product.id}`,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'RUB',
        availability: 'https://schema.org/InStock',
        url: window.location.href,
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: '240FPS' },
      },
    };
    let script = document.getElementById('build-ld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'build-ld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(ld);

    return () => {
      document.getElementById('build-ld')?.remove();
    };
  }, [product, gallery]);

  const sendOrder = async () => {
    if (!product) return;
    setSending(true);
    setError('');
    const text = `Заявка на покупку!\n\n🖥 ${product.name}\nЦП: ${product.cpu}\nГП: ${product.gpu}\nОЗУ: ${product.ram} ГБ\nSSD: ${storageLabel(product.storage)}\nЦена: ${fmtPrice(product.price)}\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}`;
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
      setError('Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.');
      return;
    }
    setSending(false);
    setSent(true);
  };

  const specs = product
    ? [
        { icon: 'Cpu', label: 'Процессор', value: product.cpu },
        { icon: 'MonitorPlay', label: 'Видеокарта', value: product.gpu },
        { icon: 'MemoryStick', label: 'Оперативная память', value: `${product.ram} ГБ` },
        { icon: 'HardDrive', label: 'Накопитель', value: `SSD ${storageLabel(product.storage)}` },
        { icon: 'Gauge', label: 'Производительность', value: `${product.fps} в играх` },
        { icon: 'ShieldCheck', label: 'Гарантия', value: '1 год официальной гарантии' },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Icon name="Loader2" size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-5 px-6 text-center">
        <Icon name="SearchX" size={48} className="text-muted-foreground" />
        <h1 className="font-display font-700 text-3xl uppercase">Сборка не найдена</h1>
        <p className="text-muted-foreground max-w-sm">Возможно, эта конфигурация больше не производится. Посмотрите актуальный каталог.</p>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary font-700 uppercase glow-yellow">
          <Link to="/#catalog"><Icon name="Cpu" size={18} /> Перейти в каталог</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/75 border-b border-border/80 shadow-lg shadow-black/20">
        <div className="container flex items-center justify-between h-16 md:h-18 py-3">
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-primary flex items-center justify-center glow-yellow transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-8deg]">
              <Icon name="Zap" className="text-primary-foreground" size={20} />
            </div>
            <span className="font-display font-700 text-xl md:text-2xl tracking-[-0.02em]">
              240<span className="text-primary">FPS</span>
            </span>
          </Link>
          <Button asChild variant="outline" size="sm" className="border-secondary/60 text-secondary font-600 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
            <Link to="/#catalog"><Icon name="ArrowLeft" size={16} /> В каталог</Link>
          </Button>
        </div>
      </header>

      <div className="container py-6 md:py-10">
        {/* Хлебные крошки — помогают поисковикам понять структуру */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-7 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <Link to="/#catalog" className="hover:text-primary transition-colors">Каталог</Link>
          <Icon name="ChevronRight" size={14} />
          <span className="text-foreground font-600">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Галерея */}
          <div className="lg:sticky lg:top-24">
            <div
              className="relative rounded-2xl overflow-hidden border border-border bg-muted cursor-zoom-in group"
              onClick={() => setLightbox(true)}
            >
              <img
                src={gallery[imgIdx]}
                alt={`Игровой компьютер ${product.name} — ${product.cpu}, ${product.gpu}`}
                className="w-full aspect-square object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
              />
              {product.tag && (
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-700 uppercase text-[11px] tracking-wider shadow-lg shadow-primary/30">
                  {product.tag}
                </Badge>
              )}
              <Badge className="absolute top-4 right-4 bg-background/70 backdrop-blur-md text-primary border border-primary/40 font-700 text-[11px] tracking-wider">
                {product.fps}
              </Badge>
              <div className="absolute bottom-4 right-4 bg-background/70 backdrop-blur-md border border-border/60 rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon name="Maximize2" size={13} /> Увеличить
              </div>
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-3 mt-4 flex-wrap">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      i === imgIdx ? 'border-primary scale-105 glow-yellow' : 'border-border opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} фото ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Информация */}
          <div>
            <div className="section-eyebrow">Готовая сборка</div>
            <h1 className="section-title text-4xl md:text-5xl mb-4">{product.name}</h1>
            <p className="text-muted-foreground leading-relaxed mb-7">
              Игровой компьютер на базе {product.cpu} и {product.gpu}. Собран и протестирован под нагрузкой
              24 часа — стабильные {product.fps} в современных играх.
            </p>

            <div className="card-premium hover:translate-y-0 p-6 mb-6">
              <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Цена</div>
                  <div className="font-display font-700 text-4xl text-primary leading-none">{fmtPrice(product.price)}</div>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-400 font-600">
                  <Icon name="Check" size={16} /> В наличии
                </div>
              </div>

              {sent ? (
                <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center glow-yellow">
                    <Icon name="CheckCircle" size={32} className="text-primary" />
                  </div>
                  <div className="font-display font-700 text-xl">Заявка отправлена!</div>
                  <div className="text-muted-foreground text-sm">Мы свяжемся с вами в ближайшее время.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      className="w-full h-12 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
                      placeholder="Ваше имя"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <input
                      className="w-full h-12 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
                      placeholder="Телефон"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  {error && <div className="text-destructive text-sm">{error}</div>}
                  <Button
                    className="btn-sheen w-full h-13 py-3.5 bg-primary text-primary-foreground hover:bg-primary font-700 uppercase tracking-wide glow-yellow transition-all duration-300 hover:glow-yellow-strong active:scale-[0.98] disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:opacity-100"
                    disabled={!name.trim() || !phone.trim() || sending}
                    onClick={sendOrder}
                  >
                    {sending ? (
                      <><Icon name="Loader2" size={18} className="animate-spin" /> Отправляем…</>
                    ) : (
                      <><Icon name="ShoppingCart" size={18} /> Купить сборку</>
                    )}
                  </Button>
                  <a
                    href="tel:+79131498240"
                    className="flex items-center justify-center gap-2 h-12 rounded-xl border border-secondary/50 text-secondary font-600 uppercase text-sm tracking-wide hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                  >
                    <Icon name="Phone" size={16} /> Позвонить и уточнить
                  </a>
                </div>
              )}
            </div>

            {/* Характеристики */}
            <div className="card-premium hover:translate-y-0 p-6">
              <h2 className="font-display font-700 text-xl uppercase tracking-tight mb-5">Характеристики</h2>
              <div className="space-y-0">
                {specs.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex items-start gap-3 py-3.5 ${i > 0 ? 'border-t border-border/60' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                      <Icon name={s.icon} size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="text-sm text-muted-foreground">{s.label}</span>
                      <span className="font-600 text-right">{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              {[
                { icon: 'Truck', t: 'Доставка по РФ' },
                { icon: 'Wrench', t: 'Тест 24 часа' },
                { icon: 'Award', t: 'Оригинальные детали' },
              ].map((b) => (
                <div key={b.t} className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 p-3">
                  <Icon name={b.icon} size={18} className="text-secondary shrink-0" />
                  <span className="text-sm font-600 leading-snug">{b.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Похожие сборки */}
        {similar.length > 0 && (
          <section className="mt-20">
            <div className="section-eyebrow">Смотрите также</div>
            <h2 className="section-title text-3xl md:text-4xl mb-8">Похожие сборки</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map((p) => (
                <Link key={p.id} to={`/build/${buildSlug(p.name)}`} className="group card-premium edge-light block">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={p.img}
                      alt={`Игровой компьютер ${p.name}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.09]"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-card/80 to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-background/70 backdrop-blur-md text-primary border border-primary/40 font-700 text-[10px] tracking-wider">
                      {p.fps}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <div className="font-display font-700 text-lg uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{p.name}</div>
                    <div className="text-sm text-muted-foreground mb-4 space-y-1">
                      <div className="truncate">{p.cpu}</div>
                      <div className="truncate">{p.gpu}</div>
                    </div>
                    <div className="font-display font-700 text-xl text-primary">{fmtPrice(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="border-t border-border bg-card mt-16">
        <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <Link to="/" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Icon name="Zap" size={16} className="text-primary" /> 240FPS
          </Link>
          <span>© 2026 240FPS. Все права защищены.</span>
        </div>
      </footer>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setLightbox(false)}>
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightbox(false)} className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors">
              <Icon name="X" size={24} />
            </button>
            <img src={gallery[imgIdx]} alt={product.name} className="w-full rounded-2xl border border-border object-contain max-h-[80vh]" />
            {gallery.length > 1 && (
              <div className="flex gap-3 mt-4 justify-center flex-wrap">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-primary' : 'border-border opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Build;