export const COMPONENTS_API_URL = 'https://functions.poehali.dev/5cfc8ecc-4c82-4e93-b6a3-36c98ad09e79';

export type Part = { id: number; name: string; price: number; image?: string; brand?: string; color?: string; gallery?: string[]; socket?: string; ram_type?: string };

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

// Фильтры совместимости по ID компонента (id стабилен, в отличие от названия, которое можно менять)
const CPU_LGA1700 = [1, 2, 3, 4, 18];
const CPU_LGA1851 = [11, 12, 14];
const CPU_AM4     = [5, 19, 6, 15, 13];
const CPU_AM5     = [7, 8, 9, 10, 16, 17, 20];

const MB_LGA1700  = [9, 14, 15, 13];
const MB_LGA1851  = [8, 12];
const MB_AM4      = [1, 3];
const MB_AM5      = [2, 7, 4, 6, 5, 10];

const RAM_DDR4     = [1, 2];
const RAM_DDR5     = [4, 6, 7, 9];
const RAM_DDR4_DDR5 = [...RAM_DDR4, ...RAM_DDR5];

// Процессоры, для которых обязательно СЖО (мощное тепловыделение, воздух не предлагаем)
const CPU_LIQUID_REQUIRED = [9, 10, 16, 3, 4, 12, 14];

// Воздушные системы охлаждения, недоступные для процессоров из CPU_LIQUID_REQUIRED
const AIR_COOLERS = [1, 2, 5];

export function filterCoolerByCpu(coolers: Part[], cpuId?: number): Part[] {
  if (cpuId && CPU_LIQUID_REQUIRED.includes(cpuId)) {
    const filtered = coolers.filter((c) => !AIR_COOLERS.includes(c.id));
    return filtered.length ? filtered : coolers;
  }
  return coolers;
}

// Шкала "мощности" блоков питания — от слабого к мощному (по id)
const PSU_TIER: Record<number, number> = {
  1: 1, // 550W
  2: 2, // 650W
  3: 3, // 650W ATX 3.1
  4: 4, // 750W ATX 3.1
  5: 5, // 850W ATX 3.1
  6: 6, // NGDP 850W
  7: 7, // NGDP 1000W
};

// Минимально допустимый БП для каждой видеокарты (по id)
const GPU_MIN_PSU_TIER: Record<number, number> = {
  9: 1, // GTX 1660 Super
  1: 1, // RTX 5050
  2: 2, // RTX 5060
  4: 2, // RTX 5060 Ti 8Gb
  3: 2, // RTX 5060 Ti 16Gb
  5: 3, // RTX 5070
  6: 5, // RTX 5070 Ti
  7: 6, // RTX 5080
  8: 5, // RX 9070XT
};

export const CASE_DEFAULT_ID = 2; // "Черный аквариум на выбор"

// Материнские платы, недопустимые для конкретных мощных процессоров (слабые VRM), по id
const MB_EXCLUDED_BY_CPU: Record<number, number[]> = {
  9: [2],  // Ryzen 7 7800X3D -> A620M
  10: [2], // Ryzen 7 9800X3D -> A620M
  16: [2], // Ryzen 9 9950X -> A620M
  3: [9],  // i5 14600KF -> H610M
  4: [9],  // i7 14700KF -> H610M
};

export function filterMotherboardByCpu(mobos: Part[], cpuId?: number): Part[] {
  const excluded = cpuId ? MB_EXCLUDED_BY_CPU[cpuId] : undefined;
  if (excluded) {
    const filtered = mobos.filter((m) => !excluded.includes(m.id));
    return filtered.length ? filtered : mobos;
  }
  return mobos;
}

function minPsuTierFor(gpuId?: number): number {
  if (!gpuId) return 0;
  return GPU_MIN_PSU_TIER[gpuId] ?? 0;
}

export function filterPsuByGpu(psus: Part[], gpuId?: number): Part[] {
  const minTier = minPsuTierFor(gpuId);
  if (!minTier) return psus;
  const filtered = psus.filter((p) => (PSU_TIER[p.id] ?? 0) >= minTier);
  return filtered.length ? filtered : psus;
}

// Охладители СЖО и воздушные, определяемые по id (не зависят от названия)
const LIQUID_COOLER_IDS = [3, 4];
const DEFAULT_AIR_COOLER_IDS = [1, 2, 5];

export function defaultCoolerFor(cpuId: number | undefined, coolers: Part[]): Part | undefined {
  if (!coolers.length) return undefined;
  if (cpuId && CPU_LIQUID_REQUIRED.includes(cpuId)) {
    return coolers.find((c) => LIQUID_COOLER_IDS.includes(c.id)) ?? cheapestOf(coolers);
  }
  return coolers.find((c) => DEFAULT_AIR_COOLER_IDS.includes(c.id)) ?? cheapestOf(coolers);
}

function filterByIds(parts: Part[], ids: number[]): Part[] {
  return parts.filter((p) => ids.includes(p.id));
}

// Сокет/тип платформы — используется для автоматической совместимости новых комплектующих,
// добавленных через админку с указанием сокета. Если у детали сокет не указан (старые записи),
// используется резервный список ID выше.
const PLATFORM_SOCKET: Record<Platform, string> = {
  lga1700: 'lga1700',
  lga1851: 'lga1851',
  am4: 'am4',
  am5: 'am5',
};

const PLATFORM_RAM_TYPES: Record<Platform, string[]> = {
  lga1700: ['ddr4', 'ddr5'],
  lga1851: ['ddr5'],
  am4: ['ddr4'],
  am5: ['ddr5'],
};

function filterBySocket(parts: Part[], plat: Platform, fallbackIds: number[]): Part[] {
  const socket = PLATFORM_SOCKET[plat];
  return parts.filter((p) => (p.socket ? p.socket === socket : fallbackIds.includes(p.id)));
}

function filterByRamType(parts: Part[], plat: Platform, fallbackIds: number[]): Part[] {
  const types = PLATFORM_RAM_TYPES[plat];
  return parts.filter((p) => (p.ram_type ? types.includes(p.ram_type) : fallbackIds.includes(p.id)));
}

export const PLATFORM_INFO: Record<Platform, { label: string; moboIds: number[]; ramIds: number[]; cpuIds: number[] }> = {
  lga1700: { label: 'Intel LGA1700 (DDR4/DDR5)', moboIds: MB_LGA1700, ramIds: RAM_DDR4_DDR5, cpuIds: CPU_LGA1700 },
  lga1851: { label: 'Intel LGA1851 (DDR5)',       moboIds: MB_LGA1851, ramIds: RAM_DDR5,      cpuIds: CPU_LGA1851 },
  am4:     { label: 'AMD AM4 (DDR4)',             moboIds: MB_AM4,     ramIds: RAM_DDR4,      cpuIds: CPU_AM4     },
  am5:     { label: 'AMD AM5 (DDR5)',             moboIds: MB_AM5,     ramIds: RAM_DDR5,      cpuIds: CPU_AM5     },
};

// Комплектующие, которые не должны подставляться по умолчанию (доступны только для ручного выбора), по id
const DEFAULT_EXCLUDED: Partial<Record<SelectKey, number[]>> = {
  gpu: [9], // GTX 1660 Super
};

export function cheapestOf(parts: Part[], key?: SelectKey): Part | undefined {
  const excluded = key ? DEFAULT_EXCLUDED[key] : undefined;
  const candidates = excluded ? parts.filter((p) => !excluded.includes(p.id)) : parts;
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
  if (key === 'cpu')         return filterBySocket(all, plat, info.cpuIds);
  if (key === 'motherboard') return filterMotherboardByCpu(filterBySocket(all, plat, info.moboIds), selected?.cpu?.id);
  if (key === 'ram')         return filterByRamType(all, plat, info.ramIds);
  if (key === 'psu')         return filterPsuByGpu(all, selected?.gpu?.id);
  if (key === 'cooler')      return filterCoolerByCpu(all, selected?.cpu?.id);
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
    const validMobos = filterMotherboardByCpu(filteredPartsFor('motherboard', p, components), auto.cpu?.id);
    const mobo = cheapestOf(validMobos);
    if (mobo) auto.motherboard = mobo;
    const cooler = defaultCoolerFor(auto.cpu?.id, components.cooler);
    if (cooler) auto.cooler = cooler;
    const validPsus = filterPsuByGpu(components.psu, auto.gpu?.id);
    const psu = cheapestOf(validPsus);
    if (psu) auto.psu = psu;
    const defaultCase = components.case.find((c) => c.id === CASE_DEFAULT_ID) ?? cheapestOf(components.case, 'case');
    if (defaultCase) auto.case = defaultCase;
  }
  return auto;
}