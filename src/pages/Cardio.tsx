import { useState } from 'react';
import { cardioKcalPerHour, cardioTableByWeight, cardioDailyForDiet, perKgBurn } from '../lib/cardio';
import { useStore } from '../store/useStore';
import { Card, Metric, SectionTitle, COLORS, PageHeader } from '../components/ui';

export function CardioPage() {
  const { profile, cardio, setCardio } = useStore();
  const [restHR, setRestHR] = useState(cardio.restHR);
  const [exerciseHR, setExerciseHR] = useState(cardio.exerciseHR);

  const perKg = perKgBurn(exerciseHR, restHR);
  const table = cardioTableByWeight(exerciseHR, restHR);
  const myKcal = cardioKcalPerHour(exerciseHR, restHR, profile.weightKg);
  const daily = cardioDailyForDiet(exerciseHR, restHR, profile.weightKg, cardio.weeklyHours);

  return (
    <div className="space-y-5">
      <div>
        <PageHeader
          title="有氧热量计算器"
          desc="输入心率与体重，查每小时有氧消耗 · 还原自套表表16"
          backTo="/library"
          backLabel="查阅"
        />
      </div>

      <Card>
        <SectionTitle>输入参数</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="label">静息心率</label>
            <input type="number" className="input tnum" value={restHR} onChange={(e) => setRestHR(+e.target.value)} />
          </div>
          <div>
            <label className="label">运动心率</label>
            <input type="number" className="input tnum" value={exerciseHR} onChange={(e) => setExerciseHR(+e.target.value)} />
          </div>
          <div>
            <label className="label">体重 kg</label>
            <input type="number" className="input tnum" value={profile.weightKg} onChange={(e) => useStore.setState((s) => ({ profile: { ...s.profile, weightKg: +e.target.value } }))} />
          </div>
          <div>
            <label className="label">周时长 h</label>
            <input type="number" className="input tnum" value={cardio.weeklyHours} onChange={(e) => setCardio({ weeklyHours: +e.target.value })} />
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle>计算结果</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Metric label="每kg消耗系数" value={perKg.toFixed(2)} sub="心率÷静息×6.4-6.2" color={COLORS.gold} />
          <Metric label="你的每小时消耗" value={myKcal} unit="kcal/h" sub={`${profile.weightKg}kg`} color={COLORS.carb} />
          <Metric label="日均(填表d值)" value={daily.toFixed(0)} unit="kcal/日" sub={`×${cardio.weeklyHours}h÷7`} color={COLORS.protein} />
        </div>
      </Card>

      <Card>
        <SectionTitle hint="50-120kg 全档">各体重每小时消耗</SectionTitle>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {table.map((row) => (
            <div
              key={row.weight}
              className={`rounded-btn p-2.5 text-center border ${
                row.weight === Math.round(profile.weightKg / 5) * 5
                  ? 'border-gold dark:border-gold-dark bg-gold/10'
                  : 'border-line dark:border-line-dark'
              }`}
            >
              <div className="text-xs text-muted dark:text-muted-dark">{row.weight}kg</div>
              <div className="tnum text-lg font-bold">{row.kcal}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted dark:text-muted-dark mt-4 pt-3 border-t border-line dark:border-line-dark">
          💡 减脂推荐运动心率约120（脂肪最大氧化点）。填饮食表"有氧消耗d" = 每小时消耗 × 周小时 ÷ 7。
        </p>
      </Card>
    </div>
  );
}
