import { useState, useMemo } from 'react';
import qa from '../data/qa.json';
import { Card, Chip, COLORS, PageHeader } from '../components/ui';

type QAFilter = '全部' | '减脂' | '增肌';

export function QAPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<QAFilter>('全部');
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const list = qa.filter((q) => filter === '全部' || q.type === filter);
    if (!query) return list;
    return list.filter((q) => q.q.includes(query) || q.a.includes(query));
  }, [query, filter]);

  return (
    <div className="space-y-5">
      <div>
        <PageHeader
          title="健身问答"
          desc={`减脂${qa.filter((q) => q.type === '减脂').length}问 + 增肌${qa.filter((q) => q.type === '增肌').length}问 · 数据来自套表表17-18`}
        />
      </div>

      <Card>
        <input
          className="input"
          placeholder="搜索问题，如 体重不掉、鸡蛋、食堂..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-1.5 mt-3">
          {(['全部', '减脂', '增肌'] as QAFilter[]).map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)} color={f === '减脂' ? COLORS.carb : f === '增肌' ? COLORS.protein : COLORS.gold}>
              {f}
            </Chip>
          ))}
        </div>
      </Card>

      <div className="text-xs text-muted dark:text-muted-dark px-1">共 {filtered.length} 条</div>

      <div className="space-y-2">
        {filtered.map((q, i) => {
          const isOpen = openIdx === i;
          return (
            <Card key={i} className="!p-0 overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full text-left p-4 flex items-start gap-3"
              >
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `${q.type === '减脂' ? COLORS.carb : COLORS.protein}20`,
                    color: q.type === '减脂' ? COLORS.carb : COLORS.protein,
                  }}
                >
                  {q.type}
                </span>
                <span className="font-medium text-sm flex-1">{q.q}</span>
                <span className="text-muted dark:text-muted-dark shrink-0">{isOpen ? '▴' : '▾'}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-0">
                  <div className="text-sm leading-relaxed text-ink dark:text-ink-dark whitespace-pre-line border-l-2 border-gold/40 dark:border-gold-dark/40 ml-1 pl-3">
                    {q.a}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-muted dark:text-muted-dark py-12 text-sm">没有匹配的问答</div>
        )}
      </div>
    </div>
  );
}
