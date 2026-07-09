/**
 * 通用 UI 组件
 */
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** 卡片容器 */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

/** 大数字指标卡（参考 Apple Fitness+ 指标展示） */
export function Metric({
  label,
  value,
  unit,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="tnum text-3xl font-bold" style={color ? { color } : undefined}>
          {value}
        </span>
        {unit && <span className="text-sm text-muted dark:text-muted-dark">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-muted dark:text-muted-dark mt-1">{sub}</div>}
    </div>
  );
}

/** 营养素进度条（彩色，参考 Apple 三色环但用条形） */
export function NutrientBar({
  label,
  grams,
  kcal,
  color,
  pct,
}: {
  label: string;
  grams: number;
  kcal: number;
  color: string;
  pct: number; // 0-100 占比
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium" style={{ color }}>
          {label}
        </span>
        <span className="tnum text-sm text-muted dark:text-muted-dark">
          {grams.toFixed(0)}g · {kcal}kcal · {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/** 区段标题 */
export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="text-lg font-bold tracking-tight">{children}</h2>
      {hint && <span className="text-xs text-muted dark:text-muted-dark">{hint}</span>}
    </div>
  );
}

/** 标签 chip */
export function Chip({
  children,
  active,
  onClick,
  color,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`chip transition-colors ${
        active
          ? 'text-bg-dark dark:text-bg-dark'
          : 'bg-black/5 dark:bg-white/5 text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark'
      }`}
      style={active && color ? { backgroundColor: color } : undefined}
    >
      {children}
    </button>
  );
}

/** 子页面顶部：面包屑 + 标题（用于查阅/工具子页） */
export function PageHeader({
  title,
  desc,
  backTo = '/library',
  backLabel = '查阅',
}: {
  title: string;
  desc?: string;
  backTo?: string;
  backLabel?: string;
}) {
  return (
    <div>
      <Link
        to={backTo}
        className="text-xs text-muted dark:text-muted-dark hover:text-gold dark:hover:text-gold-dark mb-2 flex items-center gap-1 w-fit"
      >
        ‹ {backLabel}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {desc && <p className="text-sm text-muted dark:text-muted-dark mt-1">{desc}</p>}
    </div>
  );
}

/** 营养素标准色 */
export const COLORS = {
  carb: '#FF9F40',
  protein: '#A6FF4D',
  fat: '#FF2D55',
  gold: '#C9A86A',
};
