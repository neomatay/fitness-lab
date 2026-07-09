import { useState } from 'react';
import { calcOneRM, recommendedOneRM, avgOneRM } from '../lib/oneRM';
import type { Gender } from '../lib/diet';
import { Card, Metric, SectionTitle, Chip, COLORS, PageHeader } from '../components/ui';

export function OneRMPage() {
  const [weight, setWeight] = useState(50);
  const [reps, setReps] = useState(10);
  const [gender, setGender] = useState<Gender>('男');

  const results = calcOneRM(weight, reps);
  const avg = avgOneRM(weight, reps);
  const rec = recommendedOneRM(weight, reps, gender);

  return (
    <div className="space-y-5">
      <div>
        <PageHeader
          title="最大力量预测"
          desc="输入配重与力竭次数，8个方程并行预测1RM · 还原自套表表24"
          backTo="/library"
          backLabel="查阅"
        />
      </div>

      <Card>
        <SectionTitle>输入</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="label">配重 kg</label>
            <input type="number" className="input tnum" value={weight} onChange={(e) => setWeight(+e.target.value)} />
          </div>
          <div>
            <label className="label">力竭次数</label>
            <input type="number" className="input tnum" value={reps} onChange={(e) => setReps(+e.target.value)} />
          </div>
          <div>
            <label className="label">性别（影响推荐）</label>
            <div className="flex gap-1.5">
              {(['男', '女'] as Gender[]).map((g) => (
                <Chip key={g} active={gender === g} onClick={() => setGender(g)} color={COLORS.gold}>
                  {g}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle hint="综合参考">预测结果</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <Metric label={`${gender}推荐值`} value={rec} unit="kg" color={COLORS.gold} sub={`优先采用对${gender}较准的公式`} />
          <Metric label="8式平均值" value={avg} unit="kg" sub="所有公式综合" />
        </div>
      </Card>

      <Card>
        <SectionTitle hint="配重×次数 → 1RM">8个预测方程</SectionTitle>
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.author} className="flex items-center justify-between py-2 border-b border-line dark:border-line-dark last:border-0">
              <div>
                <div className="font-medium text-sm">{r.author}</div>
                <div className="text-xs text-muted dark:text-muted-dark">{r.formula}</div>
              </div>
              <div className="flex items-center gap-3">
                {r.genderNote && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/15 text-gold dark:text-gold-dark">
                    {r.genderNote.replace('较准确', '')}
                  </span>
                )}
                <span className="tnum text-lg font-bold" style={{ color: COLORS.gold }}>
                  {r.value}
                </span>
                <span className="text-xs text-muted dark:text-muted-dark">kg</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted dark:text-muted-dark mt-4 pt-3 border-t border-line dark:border-line-dark">
          💡 适用于自由卧推/深蹲，动作全程接近完全标准。Brown/Brzycki/Lander 对女性较准，Lombardi 对男性较准。
        </p>
      </Card>
    </div>
  );
}
