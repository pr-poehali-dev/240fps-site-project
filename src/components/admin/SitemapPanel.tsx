import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const SITEMAP_API = "https://functions.poehali.dev/13341346-3879-4bf4-bc22-3f5b977f0355";

type Status = "loading" | "ok" | "stale" | "error";

/**
 * Панель контроля карты сайта: сравнивает опубликованный sitemap.xml
 * с актуальным списком сборок и подсказывает, что делать при расхождении.
 */
export default function SitemapPanel() {
  const [status, setStatus] = useState<Status>("loading");
  const [liveCount, setLiveCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const countBuilds = (xml: string) => (xml.match(/\/build\//g) || []).length;

  const check = async () => {
    setStatus("loading");
    try {
      const liveRes = await fetch(SITEMAP_API, { cache: "no-store" });
      const liveXml = await liveRes.text();
      const live = countBuilds(liveXml);
      setLiveCount(live);

      let published = 0;
      try {
        const pubRes = await fetch(`/sitemap.xml?t=${Date.now()}`, { cache: "no-store" });
        if (pubRes.ok) published = countBuilds(await pubRes.text());
      } catch {
        published = 0;
      }
      setPublishedCount(published);
      setStatus(published === live && live > 0 ? "ok" : "stale");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    check();
  }, []);

  const download = async () => {
    const res = await fetch(SITEMAP_API, { cache: "no-store" });
    const xml = await res.text();
    const url = URL.createObjectURL(new Blob([xml], { type: "application/xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(SITEMAP_API);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tone =
    status === "ok"
      ? "border-green-500/40 bg-green-500/5"
      : status === "stale"
      ? "border-primary/40 bg-primary/5"
      : "border-border bg-card";

  return (
    <div className={`rounded-xl border p-5 mb-5 ${tone}`}>
      <div className="flex items-start gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
          <Icon name="Map" size={18} className="text-primary" fallback="Globe" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="font-semibold mb-1">Карта сайта для поисковиков</div>

          {status === "loading" && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Icon name="Loader2" size={14} className="animate-spin" /> Проверяем…
            </div>
          )}

          {status === "ok" && (
            <div className="text-sm text-muted-foreground">
              Актуальна: все <span className="text-foreground font-semibold">{liveCount}</span> сборок
              есть в опубликованной карте.
            </div>
          )}

          {status === "stale" && (
            <div className="text-sm text-muted-foreground">
              Каталог изменился: сейчас сборок{" "}
              <span className="text-foreground font-semibold">{liveCount}</span>, а в опубликованной
              карте — <span className="text-foreground font-semibold">{publishedCount}</span>.
              Скачайте свежую карту и передайте разработчику, либо просто добавьте ссылку ниже
              в Яндекс.Вебмастер — она всегда актуальна.
            </div>
          )}

          {status === "error" && (
            <div className="text-sm text-destructive">Не удалось проверить карту сайта.</div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={download}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          <Icon name="Download" size={14} /> Скачать свежую карту
        </button>
        <button
          onClick={copyLink}
          className="border border-border rounded-lg px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5"
        >
          <Icon name={copied ? "Check" : "Link"} size={14} />
          {copied ? "Ссылка скопирована" : "Скопировать ссылку для Вебмастера"}
        </button>
        <button
          onClick={check}
          className="border border-border rounded-lg px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5"
        >
          <Icon name="RefreshCw" size={14} /> Проверить снова
        </button>
      </div>
    </div>
  );
}
