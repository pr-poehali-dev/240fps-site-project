export type BuildProduct = {
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

const RU_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

/** Превращает название сборки в человекочитаемый адрес: "GLADIATOR V2" -> "gladiator-v2" */
export function buildSlug(name: string): string {
  return name
    .toLowerCase()
    .split('')
    .map((ch) => (ch in RU_MAP ? RU_MAP[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function findBySlug<T extends { name: string }>(items: T[], slug: string): T | undefined {
  const target = slug.trim().toLowerCase();
  return items.find((p) => buildSlug(p.name) === target);
}

export const storageLabel = (storage: number) =>
  storage >= 1000 ? `${storage / 1000} ТБ` : `${storage} ГБ`;

export const fmtPrice = (n: number) => n.toLocaleString('ru-RU') + ' ₽';
