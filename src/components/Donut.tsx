/**
 * 营养素甜甜圈图
 * 三色扇形显示碳水/蛋白/脂肪的热量构成，中间显示总热量，右侧图例
 */
import { COLORS } from './ui';

interface NutrientDonutProps {
  carbKcal: number;
  proteinKcal: number;
  fatKcal: number;
  carbG: number;
  proteinG: number;
  fatG: number;
  /** 紧凑模式：圈居中、图例在下方（用于窄列） */
  compact?: boolean;
}

interface Segment {
  key: string;
  label: string;
  kcal: number;
  grams: number;
  color: string;
}

export function NutrientDonut({ carbKcal, proteinKcal, fatKcal, carbG, proteinG, fatG, compact }: NutrientDonutProps) {
  const segments: Segment[] = [
    { key: 'carb', label: '碳水', kcal: carbKcal, grams: carbG, color: COLORS.carb },
    { key: 'protein', label: '蛋白', kcal: proteinKcal, grams: proteinG, color: COLORS.protein },
    { key: 'fat', label: '脂肪', kcal: fatKcal, grams: fatG, color: COLORS.fat },
  ];

  const total = segments.reduce((s, x) => s + x.kcal, 0) || 1;
  const size = compact ? 108 : 132;
  const stroke = compact ? 16 : 20;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.kcal / total;
    const dash = circumference * pct;
    const arc = { ...seg, pct, dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className={compact ? 'flex flex-col items-center gap-2' : 'flex items-center gap-4'}>
      {/* 甜甜圈 */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-black/8 dark:text-white/8"
          />
          {arcs.map((arc) => (
            <circle
              key={arc.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth={stroke}
              strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
              strokeDashoffset={-arc.offset}
              style={{ filter: `drop-shadow(0 0 3px ${arc.color}55)` }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="tnum font-bold leading-none" style={{ color: COLORS.gold, fontSize: compact ? 16 : 20 }}>
            {Math.round(total)}
          </div>
          <div className="text-[9px] text-muted dark:text-muted-dark mt-0.5">kcal</div>
        </div>
      </div>

      {/* 图例 */}
      <div className={compact ? 'w-full space-y-1' : 'flex-1 space-y-2'}>
        {arcs.map((arc) => (
          <div key={arc.key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: arc.color }} />
            <span className="font-medium" style={{ color: arc.color, fontSize: compact ? 11 : 14 }}>
              {arc.label}
            </span>
            <span className="tnum text-ink dark:text-ink-dark ml-auto" style={{ fontSize: compact ? 11 : 14 }}>
              {arc.grams.toFixed(0)}g
            </span>
            <span className="tnum text-muted dark:text-muted-dark w-8 text-right" style={{ fontSize: compact ? 10 : 12 }}>
              {(arc.pct * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
