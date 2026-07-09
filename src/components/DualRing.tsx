/**
 * 双环组件：今日摄入 vs 今日消耗 + 净差
 * 灵感来自 Apple Fitness+ 活动环，但适配"吃×练"双向能量逻辑
 *
 * 左环（橙）：今日应吃（摄入目标）
 * 右环（青绿）：今日总消耗（基础代谢 + 力训 + 有氧）
 * 中间：净差 = 摄入 - 消耗（负=减脂缺口✓，正=增肌盈余）
 *
 * 当前版本显示"目标"（静态），后续可升级为"实际/目标"打卡进度
 */
import { COLORS } from './ui';

interface DualRingProps {
  /** 今日应吃 kcal */
  intake: number;
  /** 今日总消耗 kcal（基础+力训+有氧） */
  burn: number;
  /** 目标：减脂/增肌（决定净差的正负含义） */
  goal: '减脂' | '增肌';
  /** 是否训练日 */
  isTrainDay: boolean;
  /** 消耗构成（用于环内展示） */
  burnBreakdown: { base: number; train: number; cardio: number };
}

export function DualRing({ intake, burn, goal, isTrainDay, burnBreakdown }: DualRingProps) {
  const net = Math.round(intake - burn);
  // 减脂：摄入<消耗 = 缺口（好事，绿）；增肌：摄入>消耗 = 盈余（好事，绿）
  const isGood = goal === '减脂' ? net < 0 : net > 0;
  const netColor = isGood ? COLORS.protein : COLORS.fat;
  const netLabel = goal === '减脂' ? (net < 0 ? '减脂缺口 ✓' : '注意：未形成缺口') : net > 0 ? '增肌盈余 ✓' : '注意：未形成盈余';

  return (
    <div className="card !p-5">
      <div className="flex items-center justify-between gap-2">
        {/* 左环：摄入 */}
        <div className="flex flex-col items-center flex-1">
          <Ring
            value={intake}
            max={burn * 1.2}
            color={COLORS.carb}
            sub="摄入"
          />
          <div className="text-xs text-muted dark:text-muted-dark mt-2 tnum">{intake.toFixed(0)} kcal</div>
        </div>

        {/* 中间净差 */}
        <div className="flex flex-col items-center px-1 shrink-0">
          <div className="text-[10px] text-muted dark:text-muted-dark mb-1">净差</div>
          <div className="tnum text-2xl font-bold leading-none" style={{ color: netColor }}>
            {net > 0 ? '+' : ''}
            {net}
          </div>
          <div className="text-[10px] text-muted dark:text-muted-dark mt-0.5">kcal</div>
          <div
            className="text-[10px] mt-1.5 px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${netColor}1a`, color: netColor }}
          >
            {netLabel}
          </div>
        </div>

        {/* 右环：消耗 */}
        <div className="flex flex-col items-center flex-1">
          <Ring
            value={burn}
            max={burn * 1.2}
            color={COLORS.protein}
            sub="消耗"
          />
          <div className="text-xs text-muted dark:text-muted-dark mt-2 tnum">
            {isTrainDay ? `基础${burnBreakdown.base}+力训${burnBreakdown.train}` : `基础${burnBreakdown.base}`}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 单个环（SVG） */
function Ring({
  value,
  max,
  color,
  sub,
}: {
  value: number;
  max: number;
  color: string;
  sub: string;
}) {
  const size = 92;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const dash = circumference * pct;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* 背景轨 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-black/10 dark:text-white/10"
        />
        {/* 进度环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="tnum text-base font-bold leading-none" style={{ color }}>
          {Math.round(value)}
        </div>
        <div className="text-[8px] text-muted dark:text-muted-dark mt-0.5">{sub}</div>
      </div>
    </div>
  );
}
