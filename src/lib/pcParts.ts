export const COMPONENTS_API_URL = 'https://functions.poehali.dev/5cfc8ecc-4c82-4e93-b6a3-36c98ad09e79';

export type Part = { id: number; name: string; price: number; image?: string; brand?: string; color?: string; gallery?: string[] };

export type Components = {
  cpu: Part[];
  motherboard: Part[];
  ram: Part[];
  gpu: Part[];
  ssd: Part[];
  cooler: Part[];
  psu: Part[];
  case: Part[];
};

export type Brand = 'intel' | 'amd';
export type Platform = 'lga1700' | 'lga1851' | 'am4' | 'am5';
export type SelectKey = keyof Components;

export const fmt = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

export const LABELS: Record<SelectKey, { label: string; icon: string }> = {
  cpu:         { label: 'Процессор',         icon: 'Cpu' },
  motherboard: { label: 'Материнская плата',  icon: 'CircuitBoard' },
  ram:         { label: 'Оперативная память', icon: 'MemoryStick' },
  gpu:         { label: 'Видеокарта',         icon: 'MonitorPlay' },
  ssd:         { label: 'SSD накопитель',     icon: 'HardDrive' },
  cooler:      { label: 'Охлаждение',         icon: 'Wind' },
  psu:         { label: 'Блок питания',       icon: 'Zap' },
  case:        { label: 'Корпус',             icon: 'Box' },
};

export const STEPS: SelectKey[] = ['cpu', 'motherboard', 'ram', 'gpu', 'ssd', 'cooler', 'psu', 'case'];

// Фильтры совместимости по имени компонента
const CPU_LGA1700 = ['i5 12400F', 'i5 14400F', 'i5 14600KF', 'i7 14700KF', 'i5 12400'];
const CPU_LGA1851 = ['Ultra 5 245KF', 'Ultra 7 265KF', 'Ultra 9 285K'];
const CPU_AM4     = ['Ryzen 5 5500', 'Ryzen 5 5500X3D', 'Ryzen 5 5600', 'Ryzen 7 5700', 'Ryzen 7 5700X'];
const CPU_AM5     = ['Ryzen 5 7500F', 'Ryzen 7 7700', 'Ryzen 7 7800X3D', 'Ryzen 7 9800X3D', 'Ryzen 9 9950X', 'Ryzen 5 9600X'];

const MB_LGA1700  = ['H610M', 'B660m D4', 'B760m D4', 'Z790'];
const MB_LGA1851  = ['B860M', 'Z890M'];
const MB_AM4      = ['A520M', 'B550M'];
const MB_AM5      = ['A620M', 'B650M', 'B650M WiFi', 'B850M', 'B850M WiFi', 'MSI B850 ATX'];

const RAM_DDR4     = ['DDR4 16GB 3200', 'DDR4 32GB 3200'];
const RAM_DDR5     = ['DDR5 16GB ', 'DDR5 32GB ', 'DDR5 32GB a-dai', 'DDR5 64GB '];
const RAM_DDR4_DDR5 = [...RAM_DDR4, ...RAM_DDR5];

// Процессоры, для которых обязательно СЖО (мощное тепловыделение, воздух не предлагаем)
const CPU_LIQUID_REQUIRED = [
  'Ryzen 7 7800X3D',
  'Ryzen 7 9800X3D',
  'Ryzen 9 9950X',
  'i5 14600KF',
  'i7 14700KF',
  'Ultra 7 265KF',
  'Ultra 9 285K',
];

// Воздушные системы охлаждения, недоступные для процессоров из CPU_LIQUID_REQUIRED
const AIR_COOLERS = ['SE-224 B', 'SE-224 W'];

export function filterCoolerByCpu(coolers: Part[], cpuName?: string): Part[] {
  if (cpuName && CPU_LIQUID_REQUIRED.includes(cpuName)) {
    const filtered = coolers.filter((c) => !AIR_COOLERS.includes(c.name));
    return filtered.length ? filtered : coolers;
  }
  return coolers;
}

// Шкала "мощности" блоков питания — от слабого к мощному
const PSU_TIER: Record<string, number> = {
  '550W': 1,
  '650W': 2,
  '650W ATX 3.1': 3,
  '750W ATX 3.1': 4,
  '850W ATX 3.1': 5,
  'NGDP 850W': 6,
  'NGDP 1000W': 7,
};

// Минимально допустимый БП для каждой видеокарты
const GPU_MIN_PSU_TIER: Record<string, number> = {
  'GTX 1660 Super': 1,
  'RTX 5050': 1,
  'RTX 5060': 2,
  'RTX 5060 Ti 8Gb': 2,
  'RTX 5060 Ti 16Gb': 2,
  'RTX 5070': 3,
  'RTX 5070 Ti': 5,
  'RTX 5080': 6,
  'RX 9070XT': 5,
};

export const CASE_DEFAULT_NAME = 'Черный аквариум на выбор';

// Материнские платы, недопустимые для конкретных мощных процессоров (слабые VRM)
const MB_EXCLUDED_BY_CPU: Record<string, string[]> = {
  'Ryzen 7 7800X3D': ['A620M'],
  'Ryzen 7 9800X3D': ['A620M'],
  'Ryzen 9 9950X': ['A620M'],
  'i5 14600KF': ['H610M'],
  'i7 14700KF': ['H610M'],
};

export function filterMotherboardByCpu(mobos: Part[], cpuName?: string): Part[] {
  const excluded = cpuName ? MB_EXCLUDED_BY_CPU[cpuName] : undefined;
  if (excluded) {
    const filtered = mobos.filter((m) => !excluded.includes(m.name));
    return filtered.length ? filtered : mobos;
  }
  return mobos;
}

function minPsuTierFor(gpuName?: string): number {
  if (!gpuName) return 0;
  return GPU_MIN_PSU_TIER[gpuName] ?? 0;
}

export function filterPsuByGpu(psus: Part[], gpuName?: string): Part[] {
  const minTier = minPsuTierFor(gpuName);
  if (!minTier) return psus;
  const filtered = psus.filter((p) => (PSU_TIER[p.name] ?? 0) >= minTier);
  return filtered.length ? filtered : psus;
}

export function defaultCoolerFor(cpuName: string | undefined, coolers: Part[]): Part | undefined {
  if (!coolers.length) return undefined;
  if (cpuName && CPU_LIQUID_REQUIRED.includes(cpuName)) {
    return coolers.find((c) => c.name.includes('СЖО')) ?? cheapestOf(coolers);
  }
  return coolers.find((c) => c.name.startsWith('SE-224')) ?? cheapestOf(coolers);
}

function filterByNames(parts: Part[], names: string[]): Part[] {
  return parts.filter((p) => names.includes(p.name));
}

export const PLATFORM_INFO: Record<Platform, { label: string; moboNames: string[]; ramNames: string[]; cpuNames: string[] }> = {
  lga1700: { label: 'Intel LGA1700 (DDR4/DDR5)', moboNames: MB_LGA1700, ramNames: RAM_DDR4_DDR5, cpuNames: CPU_LGA1700 },
  lga1851: { label: 'Intel LGA1851 (DDR5)',       moboNames: MB_LGA1851, ramNames: RAM_DDR5,      cpuNames: CPU_LGA1851 },
  am4:     { label: 'AMD AM4 (DDR4)',             moboNames: MB_AM4,     ramNames: RAM_DDR4,      cpuNames: CPU_AM4     },
  am5:     { label: 'AMD AM5 (DDR5)',             moboNames: MB_AM5,     ramNames: RAM_DDR5,      cpuNames: CPU_AM5     },
};

// Комплектующие, которые не должны подставляться по умолчанию (доступны только для ручного выбора)
const DEFAULT_EXCLUDED: Partial<Record<SelectKey, string[]>> = {
  gpu: ['GTX 1660 Super'],
};

export function cheapestOf(parts: Part[], key?: SelectKey): Part | undefined {
  const excluded = key ? DEFAULT_EXCLUDED[key] : undefined;
  const candidates = excluded ? parts.filter((p) => !excluded.includes(p.name)) : parts;
  const pool = candidates.length ? candidates : parts;
  return pool.length ? pool.reduce((min, p) => (p.price < min.price ? p : min), pool[0]) : undefined;
}

export function filteredPartsFor(
  key: SelectKey,
  plat: Platform | null,
  comps: Components | null,
  selected?: Partial<Record<SelectKey, Part>>,
): Part[] {
  if (!comps || !plat) return [];
  const info = PLATFORM_INFO[plat];
  const all = comps[key];
  if (key === 'cpu')         return filterByNames(all, info.cpuNames);
  if (key === 'motherboard') return filterMotherboardByCpu(filterByNames(all, info.moboNames), selected?.cpu?.name);
  if (key === 'ram')         return filterByNames(all, info.ramNames);
  if (key === 'psu')         return filterPsuByGpu(all, selected?.gpu?.name);
  if (key === 'cooler')      return filterCoolerByCpu(all, selected?.cpu?.name);
  return all;
}

export function calcAssemblyFee(partsTotal: number): number {
  if (partsTotal === 0) return 0;
  if (partsTotal >= 300000) return 10000;
  if (partsTotal >= 200000) return 7000;
  if (partsTotal > 150000) return 6000;
  return 5000;
}

export function autoSelectForPlatform(p: Platform, components: Components | null): Partial<Record<SelectKey, Part>> {
  const auto: Partial<Record<SelectKey, Part>> = {};
  STEPS.forEach((key) => {
    if (key === 'cooler' || key === 'psu' || key === 'case' || key === 'motherboard') return;
    const cheapest = cheapestOf(filteredPartsFor(key, p, components), key);
    if (cheapest) auto[key] = cheapest;
  });
  if (components) {
    const validMobos = filterMotherboardByCpu(filteredPartsFor('motherboard', p, components), auto.cpu?.name);
    const mobo = cheapestOf(validMobos);
    if (mobo) auto.motherboard = mobo;
    const cooler = defaultCoolerFor(auto.cpu?.name, components.cooler);
    if (cooler) auto.cooler = cooler;
    const validPsus = filterPsuByGpu(components.psu, auto.gpu?.name);
    const psu = cheapestOf(validPsus);
    if (psu) auto.psu = psu;
    const defaultCase = components.case.find((c) => c.name === CASE_DEFAULT_NAME) ?? cheapestOf(components.case, 'case');
    if (defaultCase) auto.case = defaultCase;
  }
  return auto;
}