import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calcDiet, getMealOrder, getRestMealOrder, type TrainTime, type Gender, type Goal, type TrainLevel } from '../lib/diet';
import { cardioDailyForDiet } from '../lib/cardio';
import { Card, Metric, NutrientBar, SectionTitle, Chip, COLORS } from '../components/ui';

const TRAIN_TIMES: TrainTime[] = ['早饭前练', '早饭后练', '午饭前练', '午饭后练', '晚饭前练', '晚饭后练', '夜里练', '不力训'];
const GOALS: Goal[] = ['减脂', '增肌'];
const LEVELS: TrainLevel[] = ['新手', '有基础', '老手'];

export function DietPage() {
  const navigate = useNavigate();
  const { profile, setProfile, cardio, setCardio, override, setOverride, resetOnboarding } = useStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 计算有氧日均消耗
  const cardioDaily = cardio.enabled
    ? cardioDailyForDiet(cardio.exerciseHR, cardio.restHR, profile.weightKg, cardio.weeklyHours)
    : 0;

  // 主计算
  const result = useMemo(
    () =>
      calcDiet({
        gender: profile.gender,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        age: profile.age,
        goal: profile.goal,
        trainLevel: profile.trainLevel,
        cardioKcalPerDay: cardioDaily,
        overrideCarbPerKg: override.carbPerKg,
        overrideProteinPerKg: override.proteinPerKg,
      }),
    [profile, cardioDaily, override],
  );

  const trainMeals = getMealOrder(profile.trainTime);
  const restMeals = getRestMealOrder();

  // 训练日营养素占比
  const trainTotal = result.trainDayKcal.carb + result.trainDayKcal.protein + result.trainDayKcal.fat;
  const restTotal = result.restDayKcal.carb + result.restDayKcal.protein + result.restDayKcal.fat;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">我的方案</h1>
          <p className="text-sm text-muted dark:text-muted-dark mt-1">
            调整体征与目标，自动重算每日热量与碳蛋脂配额 · 今日页据此展示
          </p>
        </div>
        <button
          onClick={() => {
            resetOnboarding();
            navigate('/onboarding', { replace: true });
          }}
          className="btn btn-ghost !px-3 !py-1.5 text-xs shrink-0"
        >
          重新引导
        </button>
      </div>

      {/* 输入面板 */}
      <Card>
        <SectionTitle hint="数据存本地，下次免输入">体征输入</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="label">性别</label>
            <div className="flex gap-1.5">
              {(['男', '女'] as Gender[]).map((g) => (
                <Chip key={g} active={profile.gender === g} onClick={() => setProfile({ gender: g })} color={COLORS.gold}>
                  {g}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <label className="label">目标</label>
            <div className="flex gap-1.5">
              {GOALS.map((g) => (
                <Chip key={g} active={profile.goal === g} onClick={() => setProfile({ goal: g })} color={COLORS.gold}>
                  {g}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <label className="label">身高 cm</label>
            <input
              type="number"
              className="input tnum"
              value={profile.heightCm}
              onChange={(e) => setProfile({ heightCm: +e.target.value })}
            />
          </div>
          <div>
            <label className="label">体重 kg</label>
            <input
              type="number"
              className="input tnum"
              value={profile.weightKg}
              onChange={(e) => setProfile({ weightKg: +e.target.value })}
            />
          </div>
          <div>
            <label className="label">年龄</label>
            <input
              type="number"
              className="input tnum"
              value={profile.age}
              onChange={(e) => setProfile({ age: +e.target.value })}
            />
          </div>
          <div>
            <label className="label">训练水平</label>
            <div className="flex gap-1.5">
              {LEVELS.map((l) => (
                <Chip key={l} active={profile.trainLevel === l} onClick={() => setProfile({ trainLevel: l })} color={COLORS.gold}>
                  {l}
                </Chip>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <label className="label">训练时段</label>
            <select
              className="input"
              value={profile.trainTime}
              onChange={(e) => setProfile({ trainTime: e.target.value as TrainTime })}
            >
              {TRAIN_TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 有氧开关 */}
        <div className="mt-4 pt-4 border-t border-line dark:border-line-dark">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cardio.enabled}
              onChange={(e) => setCardio({ enabled: e.target.checked })}
              className="w-4 h-4 accent-[#C9A86A]"
            />
            <span className="text-sm font-medium">加入有氧消耗</span>
            {cardio.enabled && (
              <span className="text-xs text-muted dark:text-muted-dark">
                · 日均 +{cardioDaily.toFixed(0)} kcal
              </span>
            )}
          </label>
          {cardio.enabled && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <label className="label">静息心率</label>
                <input type="number" className="input tnum" value={cardio.restHR} onChange={(e) => setCardio({ restHR: +e.target.value })} />
              </div>
              <div>
                <label className="label">运动心率</label>
                <input type="number" className="input tnum" value={cardio.exerciseHR} onChange={(e) => setCardio({ exerciseHR: +e.target.value })} />
              </div>
              <div>
                <label className="label">周时长 h</label>
                <input type="number" className="input tnum" value={cardio.weeklyHours} onChange={(e) => setCardio({ weeklyHours: +e.target.value })} />
              </div>
            </div>
          )}
        </div>

        {/* 高级：配额手动覆盖 */}
        <div className="mt-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-gold dark:text-gold-dark"
          >
            {showAdvanced ? '▾' : '▸'} 高级：手动覆盖配额（参考值，可对照视频微调）
          </button>
          {showAdvanced && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="label">碳水 g/kg（留空=自动 {result.trainCarbPerKg}）</label>
                <input
                  type="number"
                  step="0.1"
                  className="input tnum"
                  placeholder={String(result.trainCarbPerKg)}
                  value={override.carbPerKg ?? ''}
                  onChange={(e) => setOverride({ carbPerKg: e.target.value ? +e.target.value : undefined })}
                />
              </div>
              <div>
                <label className="label">蛋白 g/kg（留空=自动 {result.trainProteinPerKg}）</label>
                <input
                  type="number"
                  step="0.1"
                  className="input tnum"
                  placeholder={String(result.trainProteinPerKg)}
                  value={override.proteinPerKg ?? ''}
                  onChange={(e) => setOverride({ proteinPerKg: e.target.value ? +e.target.value : undefined })}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 结果：基础数据 */}
      <Card>
        <SectionTitle hint={`系数 ${result.eatFactor} · 减脂0.64/增肌0.84`}>热量计算</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric label="基础代谢" value={result.bmr.toFixed(0)} unit="kcal" sub="Mifflin-St Jeor" />
          <Metric label="无运动消耗" value={result.noExerciseBurn.toFixed(0)} unit="kcal" sub="基础代谢÷0.7" />
          <Metric label="力训消耗" value={result.trainBurn} unit="kcal" sub={`${profile.trainLevel}`} />
          <Metric label="有氧消耗" value={result.cardioBurn.toFixed(0)} unit="kcal/日" sub={cardio.enabled ? '已计入' : '未开启'} color={COLORS.gold} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-line dark:border-line-dark">
          <Metric label="训练日应吃" value={result.trainDayEat.toFixed(0)} unit="kcal" sub={`平衡${result.trainDayBalance.toFixed(0)}×${result.eatFactor}`} color={COLORS.carb} />
          <Metric label="休息日应吃" value={result.restDayEat.toFixed(0)} unit="kcal" sub={`平衡${result.restDayBalance.toFixed(0)}×${result.eatFactor}`} />
        </div>
      </Card>

      {/* 训练日营养素 */}
      <Card>
        <SectionTitle hint={`共 ${trainTotal} kcal`}>训练日三大营养素</SectionTitle>
        <div className="space-y-4">
          <NutrientBar label="碳水" grams={result.trainCarbG} kcal={result.trainDayKcal.carb} color={COLORS.carb} pct={(result.trainDayKcal.carb / trainTotal) * 100} />
          <NutrientBar label="蛋白质" grams={result.trainProteinG} kcal={result.trainDayKcal.protein} color={COLORS.protein} pct={(result.trainDayKcal.protein / trainTotal) * 100} />
          <NutrientBar label="脂肪" grams={result.fatG} kcal={result.trainDayKcal.fat} color={COLORS.fat} pct={(result.trainDayKcal.fat / trainTotal) * 100} />
        </div>
        <div className="flex gap-4 mt-4 pt-3 border-t border-line dark:border-line-dark text-xs text-muted dark:text-muted-dark">
          <span>碳水 {result.trainCarbPerKg} g/kg</span>
          <span>蛋白 {result.trainProteinPerKg} g/kg</span>
          <span>脂肪 {result.fatG} g/日</span>
        </div>
      </Card>

      {/* 休息日营养素 */}
      <Card>
        <SectionTitle hint={`共 ${restTotal} kcal`}>休息日三大营养素</SectionTitle>
        <div className="space-y-4">
          <NutrientBar label="碳水" grams={result.restCarbG} kcal={result.restDayKcal.carb} color={COLORS.carb} pct={(result.restDayKcal.carb / restTotal) * 100} />
          <NutrientBar label="蛋白质" grams={result.restProteinG} kcal={result.restDayKcal.protein} color={COLORS.protein} pct={(result.restDayKcal.protein / restTotal) * 100} />
          <NutrientBar label="脂肪" grams={result.fatG} kcal={result.restDayKcal.fat} color={COLORS.fat} pct={(result.restDayKcal.fat / restTotal) * 100} />
        </div>
      </Card>

      {/* 三餐分配 */}
      <Card>
        <SectionTitle hint="按时段自动排列">餐序分配</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-2 text-gold dark:text-gold-dark">力训日</div>
            <ol className="space-y-1.5">
              {trainMeals.map((m, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-muted dark:text-muted-dark tnum w-6">{i + 1}.</span>
                  <span>{m}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <div className="text-sm font-medium mb-2 text-muted dark:text-muted-dark">休息日</div>
            <ol className="space-y-1.5">
              {restMeals.map((m, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-muted dark:text-muted-dark tnum w-6">{i + 1}.</span>
                  <span>{m}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="text-xs text-muted dark:text-muted-dark mt-4 pt-3 border-t border-line dark:border-line-dark">
          💡 训练日：扣脂肪后剩余热量 64% 给碳水、36% 给蛋白；休息日蛋白同训练日，剩余全给碳水。配额由热量计算派生，无需查视频。
        </p>
      </Card>
    </div>
  );
}
