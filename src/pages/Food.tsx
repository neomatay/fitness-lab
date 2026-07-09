import { useState, useMemo } from 'react';
import foodsRaw from '../data/foods.json';
import { Card, Chip, COLORS, PageHeader } from '../components/ui';

interface FoodItem {
  category: string;
  name: string;
  note: string;
  carbRate?: number;
  carbRateText?: string;
  proteinRate?: number;
  proteinRateText?: string;
  gi?: string;
  role?: string;
}

const foods: FoodItem[] = foodsRaw as FoodItem[];

type Section = '碳水' | '蛋白质';

export function FoodPage() {
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<Section | '全部'>('全部');
  const [giFilter, setGiFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return foods.filter((f) => {
      // 关键词
      if (query && !f.name.includes(query) && !(f.note || '').includes(query)) return false;
      // 分类
      if (section !== '全部') {
        if (section === '碳水' && !('carbRate' in f) && !('carbRateText' in f)) return false;
        if (section === '蛋白质' && !('proteinRate' in f) && !('proteinRateText' in f)) return false;
      }
      // GI
      if (giFilter && f.gi !== giFilter) return false;
      return true;
    });
  }, [query, section, giFilter]);

  return (
    <div className="space-y-5">
      <div>
        <PageHeader title="食物营养率查询" desc={`${foods.length} 种日常食物的碳水率/蛋白率/GI · 数据来自套表表19`} />
      </div>

      <Card>
        <input
          className="input"
          placeholder="搜索食物名或关键词，如 米饭、瘦肉、鸡蛋..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Chip active={section === '全部'} onClick={() => setSection('全部')} color={COLORS.gold}>
            全部
          </Chip>
          <Chip active={section === '碳水'} onClick={() => setSection('碳水')} color={COLORS.carb}>
            碳水
          </Chip>
          <Chip active={section === '蛋白质'} onClick={() => setSection('蛋白质')} color={COLORS.protein}>
            蛋白质
          </Chip>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {['高', '中', '低'].map((g) => (
            <Chip key={g} active={giFilter === g} onClick={() => setGiFilter(giFilter === g ? null : g)}>
              GI {g}
            </Chip>
          ))}
        </div>
      </Card>

      <div className="text-xs text-muted dark:text-muted-dark px-1">共 {filtered.length} 条结果</div>

      <div className="space-y-2">
        {filtered.map((f, i) => {
          const isCarb = 'carbRate' in f || 'carbRateText' in f;
          const rate = isCarb ? (f.carbRate ?? f.carbRateText) : (f.proteinRate ?? f.proteinRateText);
          const color = isCarb ? COLORS.carb : COLORS.protein;
          return (
            <Card key={i} className="!p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{f.name}</span>
                    {f.category && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-muted dark:text-muted-dark">
                        {f.category}
                      </span>
                    )}
                    {f.gi && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}20`, color }}>
                        GI {f.gi}
                      </span>
                    )}
                    {f.role && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}20`, color }}>
                        {f.role}
                      </span>
                    )}
                  </div>
                  {f.note && <p className="text-xs text-muted dark:text-muted-dark mt-1.5 leading-relaxed">{f.note}</p>}
                </div>
                <div className="text-right shrink-0">
                  <div className="tnum text-xl font-bold" style={{ color }}>
                    {typeof rate === 'number' ? `${(rate * 100).toFixed(0)}%` : rate}
                  </div>
                  <div className="text-[10px] text-muted dark:text-muted-dark">{isCarb ? '碳水率' : '蛋白率'}</div>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-muted dark:text-muted-dark py-12 text-sm">没有匹配的食物</div>
        )}
      </div>
    </div>
  );
}
