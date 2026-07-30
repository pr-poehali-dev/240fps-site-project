import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Part,
  Components,
  Brand,
  Platform,
  SelectKey,
  fmt,
  LABELS,
  STEPS,
  PLATFORM_INFO,
  filterMotherboardByCpu,
  filterPsuByGpu,
  filterCoolerByCpu,
  cheapestOf,
  filteredPartsFor,
  autoSelectForPlatform,
  defaultCoolerFor,
} from '@/lib/pcParts';

export type ConfiguratorResult = {
  platform: Platform;
  selected: Partial<Record<SelectKey, Part>>;
  partsTotal: number;
  assemblyFee: number;
  total: number;
};

export default function PcConfigurator({
  components,
  onDone,
  doneLabel = 'Готово',
}: {
  components: Components;
  onDone: (result: ConfiguratorResult) => void;
  doneLabel?: string;
}) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [selected, setSelected] = useState<Partial<Record<SelectKey, Part>>>({});
  const [galleryPart, setGalleryPart] = useState<Part | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const keys = Object.keys(LABELS) as SelectKey[];
  const partsTotal = Object.values(selected).reduce((sum, p) => sum + (p?.price ?? 0), 0);
  const assemblyFee = partsTotal === 0 ? 0 : partsTotal > 150000 ? 6000 : 5000;
  const total = partsTotal + assemblyFee;
  const pInfo = platform ? PLATFORM_INFO[platform] : null;

  const filteredParts = (key: SelectKey): Part[] => filteredPartsFor(key, platform, components, selected);

  const selectPart = (category: SelectKey, part: Part) => {
    setSelected((prev) => {
      let next: Partial<Record<SelectKey, Part>>;
      if (prev[category]?.id === part.id) {
        next = { ...prev };
        delete next[category];
      } else {
        next = { ...prev, [category]: part };
      }

      if (category === 'cpu') {
        const validCoolers = filterCoolerByCpu(components.cooler, next.cpu?.name);
        if (!next.cooler || !validCoolers.some((c) => c.id === next.cooler!.id)) {
          next.cooler = defaultCoolerFor(next.cpu?.name, components.cooler);
        }
        const validMobos = filterMotherboardByCpu(
          filteredPartsFor('motherboard', platform, components),
          next.cpu?.name,
        );
        if (!next.motherboard || !validMobos.some((m) => m.id === next.motherboard!.id)) {
          next.motherboard = cheapestOf(validMobos);
        }
      }

      if (category === 'gpu') {
        const validPsus = filterPsuByGpu(components.psu, next.gpu?.name);
        if (!next.psu || !validPsus.some((p) => p.id === next.psu!.id)) {
          next.psu = cheapestOf(validPsus);
        }
      }

      return next;
    });
  };

  const chooseBrand = (b: Brand) => {
    setBrand(b);
    setPlatform(null);
    setSelected({});
  };

  const choosePlatform = (p: Platform) => {
    setPlatform(p);
    setSelected(autoSelectForPlatform(p, components));
  };

  const reset = () => { setBrand(null); setPlatform(null); setSelected({}); };

  const handleDone = () => {
    if (!platform) return;
    onDone({ platform, selected, partsTotal, assemblyFee, total });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div className="space-y-4">
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

        {/* Шаги 3+: выбор комплектующих */}
        {platform && STEPS.map((key) => {
          const { label, icon } = LABELS[key];
          const parts = filteredParts(key);
          const picked = selected[key];

          if (key === 'case') {
            return (
              <div key={key} className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                  <Icon name={icon} size={18} className="text-primary" />
                  <span className="font-600">{label}</span>
                  {picked && (
                    <Badge className="ml-auto bg-primary/15 text-primary border-primary/30 font-500 text-xs">
                      {picked.name}
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
                      {parts.map((p) => {
                        const diff = picked ? p.price - picked.price : 0;
                        const diffLabel = !picked || diff === 0
                          ? ''
                          : diff > 0 ? ` (+${fmt(diff)})` : ` (−${fmt(Math.abs(diff))})`;
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name}{diffLabel}
                          </option>
                        );
                      })}
                    </select>
                    <Icon name="ChevronDown" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>

                  {picked && (
                    <button
                      onClick={() => { if (picked.gallery && picked.gallery.length > 0) { setGalleryPart(picked); setGalleryIndex(0); } }}
                      className="mt-3 w-full aspect-video rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden relative group border border-border"
                    >
                      {picked.image ? (
                        <img src={picked.image} alt={picked.name} className="w-full h-full object-contain p-3" loading="lazy" />
                      ) : (
                        <Icon name="Box" size={32} className="text-muted-foreground" />
                      )}
                      {picked.gallery && picked.gallery.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 rounded-full px-2 py-1 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <Icon name="Images" size={13} className="text-white" />
                          <span className="text-white text-xs">{picked.gallery.length}</span>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                <Icon name={icon} size={18} className="text-primary" />
                <span className="font-600">{label}</span>
                {picked && (
                  <Badge className="ml-auto bg-primary/15 text-primary border-primary/30 font-500 text-xs">
                    {picked.name}
                  </Badge>
                )}
              </div>
              <div className="p-4">
                {key === 'psu' && selected.gpu && (
                  <div className="flex items-start gap-2 mb-3 p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground">
                    <Icon name="Info" size={14} className="text-primary shrink-0 mt-0.5" />
                    <span>Список ограничен блоками питания, достаточными для видеокарты «{selected.gpu.name}».</span>
                  </div>
                )}
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
                    {parts.map((p) => {
                      const diff = picked ? p.price - picked.price : 0;
                      const diffLabel = !picked || diff === 0
                        ? ''
                        : diff > 0 ? ` (+${fmt(diff)})` : ` (−${fmt(Math.abs(diff))})`;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name}{diffLabel}
                        </option>
                      );
                    })}
                  </select>
                  <Icon name="ChevronDown" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="lg:sticky lg:top-4 space-y-4">
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="font-display font-700 text-xl uppercase mb-5 flex items-center gap-2">
            <Icon name="ShoppingCart" size={20} className="text-primary" /> Сборка
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
              {selected.case && (
                <div className="rounded-xl bg-muted/30 border border-border overflow-hidden mb-1">
                  <div className="aspect-square bg-muted/50 flex items-center justify-center overflow-hidden">
                    {selected.case.image ? (
                      <img src={selected.case.image} alt={selected.case.name} className="w-full h-full object-contain p-3" />
                    ) : (
                      <Icon name="Box" size={40} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-muted-foreground mb-0.5">Корпус</div>
                    <div className="font-500 text-sm">{selected.case.name}</div>
                  </div>
                </div>
              )}
              {keys.filter((k) => selected[k] && k !== 'case').map((k) => (
                <div key={k} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">{LABELS[k].label}</div>
                    <div className="font-500">{selected[k]!.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center justify-between mb-1 text-sm text-muted-foreground">
              <span>Комплектующие:</span>
              <span>{fmt(partsTotal)}</span>
            </div>
            <div className="flex items-center justify-between mb-5 text-sm text-muted-foreground">
              <span>Сборка:</span>
              <span>{fmt(assemblyFee)}</span>
            </div>
            <div className="flex items-center justify-between mb-5">
              <span className="text-muted-foreground text-sm font-600">Итого:</span>
              <span className="font-display font-700 text-2xl text-primary">{fmt(total)}</span>
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-600 h-12 glow-yellow"
              disabled={total === 0}
              onClick={handleDone}
            >
              <Icon name="Check" size={18} /> {doneLabel}
            </Button>
            {total > 0 && (
              <button onClick={reset} className="w-full mt-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                Сбросить всё
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gallery modal */}
      {galleryPart && galleryPart.gallery && galleryPart.gallery.length > 0 && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setGalleryPart(null)}
        >
          <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setGalleryPart(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
            >
              <Icon name="X" size={24} />
            </button>
            <div className="rounded-2xl overflow-hidden bg-card border border-border">
              <div className="relative aspect-square bg-muted/30 flex items-center justify-center">
                <img
                  src={galleryPart.gallery[galleryIndex]}
                  alt={galleryPart.name}
                  className="w-full h-full object-contain"
                />
                {galleryPart.gallery.length > 1 && (
                  <>
                    <button
                      onClick={() => setGalleryIndex((i) => (i - 1 + galleryPart.gallery!.length) % galleryPart.gallery!.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                    >
                      <Icon name="ChevronLeft" size={20} />
                    </button>
                    <button
                      onClick={() => setGalleryIndex((i) => (i + 1) % galleryPart.gallery!.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                    >
                      <Icon name="ChevronRight" size={20} />
                    </button>
                  </>
                )}
              </div>
              <div className="p-4">
                <div className="font-600 mb-3">{galleryPart.name}</div>
                {galleryPart.gallery.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {galleryPart.gallery.map((img, idx) => (
                      <button
                        key={img}
                        onClick={() => setGalleryIndex(idx)}
                        className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                          idx === galleryIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-contain bg-muted/30" />
                      </button>
                    ))}
                  </div>
                )}
                <Button
                  className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-600 h-11"
                  onClick={() => { selectPart('case', galleryPart); setGalleryPart(null); }}
                >
                  <Icon name="Check" size={18} /> Выбрать этот корпус
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
