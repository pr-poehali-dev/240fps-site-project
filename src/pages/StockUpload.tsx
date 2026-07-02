import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const UPLOAD_URL = 'https://functions.poehali.dev/6975c94e-bfa2-44dd-9928-fbb1993bccf4';

export default function StockUpload() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ matched: number; unmatched: number; not_found: string[]; details: { stock: string; db: string }[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;
    setStatus('loading');
    setResult(null);

    const text = await file.text();
    const res = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv_content: text }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setStatus('success');
      setResult(data);
    } else {
      setStatus('error');
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-6">
        <div>
          <h1 className="font-display font-700 text-3xl uppercase mb-1">Обновление остатков</h1>
          <p className="text-muted-foreground text-sm">Загрузи выгрузку из 1С в формате CSV или TXT. Система автоматически обновит наличие в конфигураторе.</p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragOver ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 bg-card'
          }`}
        >
          <Icon name="Upload" size={36} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-500 mb-1">Перетащи файл сюда или нажми для выбора</p>
          <p className="text-xs text-muted-foreground">CSV, TXT — выгрузка товаров из 1С</p>
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={onFile} />
        </div>

        {status === 'loading' && (
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <Icon name="Loader" size={18} className="animate-spin" /> Обрабатываю файл…
          </div>
        )}

        {status === 'success' && result && (
          <div className="rounded-xl bg-card border border-border p-5 space-y-4">
            <div className="flex items-center gap-2 text-green-500 font-600">
              <Icon name="CheckCircle" size={18} /> Готово!
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-green-500/10 p-3 text-center">
                <div className="text-2xl font-700 text-green-500">{result.matched}</div>
                <div className="text-xs text-muted-foreground mt-1">найдено совпадений</div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <div className="text-2xl font-700 text-muted-foreground">{result.unmatched}</div>
                <div className="text-xs text-muted-foreground mt-1">не найдено</div>
              </div>
            </div>

            {result.details.length > 0 && (
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-2">Сопоставлено</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {result.details.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Icon name="ArrowRight" size={12} className="text-primary shrink-0" />
                      <span className="text-muted-foreground truncate">{d.stock}</span>
                      <span className="text-muted-foreground shrink-0">→</span>
                      <span className="font-500 truncate">{d.db}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.not_found.length > 0 && (
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-2">Не найдено в конфигураторе</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {result.not_found.map((n, i) => (
                    <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                      <Icon name="Minus" size={12} className="shrink-0" /> {n}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full"
              variant="outline"
              onClick={() => { setStatus('idle'); setResult(null); if (fileRef.current) fileRef.current.value = ''; }}
            >
              Загрузить другой файл
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <Icon name="AlertCircle" size={16} /> Ошибка при обработке файла. Проверь формат и попробуй снова.
          </div>
        )}
      </div>
    </div>
  );
}