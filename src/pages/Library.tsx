import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import foodsRaw from '../data/foods.json';
import exercises from '../data/exercises.json';
import qa from '../data/qa.json';
import { Card, COLORS } from '../components/ui';

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
const foods = foodsRaw as FoodItem[];

interface SearchResult {
  type: '食物' | '动作' | '问答';
  title: string;
  subtitle: string;
  path: string;
}

const LIBRARIES = [
  { key: 'food', icon: '🥗', label: '食物营养库', desc: `${foods.length} 种食物的碳水率/蛋白率/GI`, path: '/library/food', color: COLORS.carb },
  { key: 'training', icon: '🏋', label: '训练动作库', desc: `${exercises.length} 个动作，4 种分化方案`, path: '/library/training', color: COLORS.gold },
  { key: 'qa', icon: '❓', label: '健身问答', desc: `${qa.length} 条减脂/增肌问答`, path: '/library/qa', color: COLORS.protein },
  { key: 'gallery', icon: '🩻', label: '解剖图库', desc: '拉伸图、关节活动图、肌肉活动图', path: '/library/gallery', color: COLORS.fat },
];

export function LibraryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.trim();
    const out: SearchResult[] = [];

    // 食物
    foods
      .filter((f) => f.name.includes(q) || (f.note || '').includes(q))
      .slice(0, 5)
      .forEach((f) => {
        const isCarb = 'carbRate' in f || 'carbRateText' in f;
        const rate = isCarb ? f.carbRate ?? f.carbRateText : f.proteinRate ?? f.proteinRateText;
        out.push({
          type: '食物',
          title: f.name,
          subtitle: `${isCarb ? '碳水' : '蛋白'} ${typeof rate === 'number' ? `${(rate * 100).toFixed(0)}%` : rate}${f.category ? ' · ' + f.category : ''}`,
          path: '/library/food',
        });
      });

    // 动作
    exercises
      .filter((e) => e.name.includes(q) || e.part.includes(q))
      .slice(0, 5)
      .forEach((e) => {
        out.push({
          type: '动作',
          title: e.name,
          subtitle: `${e.plan} · ${e.day.replace(/^Day\d+[：:]?/, '')} · ${e.part}`,
          path: '/library/training',
        });
      });

    // 问答
    qa
      .filter((item) => item.q.includes(q) || item.a.includes(q))
      .slice(0, 5)
      .forEach((item) => {
        out.push({
          type: '问答',
          title: item.q,
          subtitle: item.a.slice(0, 50) + '...',
          path: '/library/qa',
        });
      });

    return out;
  }, [query]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">查阅</h1>
        <p className="text-sm text-muted dark:text-muted-dark mt-1">
          食物 / 训练 / 问答 / 图库 · 搜索任意词跨库查找
        </p>
      </div>

      {/* 全局搜索 */}
      <Card>
        <input
          autoFocus
          className="input"
          placeholder="🔍 搜索：鸡蛋、米饭、深蹲、体重不掉..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query.trim() && (
          <div className="mt-3">
            <div className="text-xs text-muted dark:text-muted-dark mb-2">共 {results.length} 条结果</div>
            {results.length === 0 ? (
              <div className="text-sm text-muted dark:text-muted-dark py-4 text-center">没有匹配内容</div>
            ) : (
              <div className="space-y-1.5">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(r.path)}
                    className="w-full text-left rounded-btn p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          backgroundColor: `${r.type === '食物' ? COLORS.carb : r.type === '动作' ? COLORS.gold : COLORS.protein}20`,
                          color: r.type === '食物' ? COLORS.carb : r.type === '动作' ? COLORS.gold : COLORS.protein,
                        }}
                      >
                        {r.type}
                      </span>
                      <span className="text-sm font-medium truncate">{r.title}</span>
                    </div>
                    <div className="text-xs text-muted dark:text-muted-dark mt-1 truncate pl-1">{r.subtitle}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 子库卡片 */}
      {!query.trim() && (
        <div className="grid sm:grid-cols-2 gap-3">
          {LIBRARIES.map((lib) => (
            <button
              key={lib.key}
              onClick={() => navigate(lib.path)}
              className="card text-left hover:scale-[1.01] transition-transform"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-btn grid place-items-center text-2xl shrink-0"
                  style={{ backgroundColor: `${lib.color}20` }}
                >
                  {lib.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{lib.label}</div>
                  <div className="text-xs text-muted dark:text-muted-dark mt-1 leading-relaxed">{lib.desc}</div>
                </div>
                <span className="text-muted dark:text-muted-dark shrink-0">→</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 工具区 */}
      {!query.trim() && (
        <Card>
          <div className="text-sm font-medium mb-2">计算工具</div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => navigate('/tools/cardio')} className="btn btn-ghost text-sm">
              🏃 有氧热量计算
            </button>
            <button onClick={() => navigate('/tools/1rm')} className="btn btn-ghost text-sm">
              💪 1RM 最大力量预测
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
