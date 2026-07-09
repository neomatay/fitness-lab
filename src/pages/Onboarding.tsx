import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, WEEKDAY_LABELS, type Weekday } from '../store/useStore';
import type { Gender, Goal, TrainLevel, TrainTime } from '../lib/diet';
import { Card, Chip, COLORS } from '../components/ui';

const TRAIN_TIMES: TrainTime[] = ['早饭前练', '早饭后练', '午饭前练', '午饭后练', '晚饭前练', '晚饭后练', '夜里练', '不力训'];
const GOALS: Goal[] = ['减脂', '增肌'];
const LEVELS: TrainLevel[] = ['新手', '有基础', '老手'];

// 每步的标题 + 预览下一步要填什么
const STEPS = [
  { title: '目标', hint: '下一步：身高/体重/年龄' },
  { title: '体征', hint: '下一步：训练时段与日历' },
  { title: '训练', hint: '完成即可生成方案' },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { profile, setProfile, trainingDays, toggleTrainingDay, completeOnboarding } = useStore();
  const [step, setStep] = useState(0);

  const finish = () => {
    completeOnboarding();
    navigate('/', { replace: true });
  };

  const current = STEPS[step];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-md">
        {/* 顶部品牌 */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">⚡</div>
          <h1 className="text-2xl font-bold tracking-tight">欢迎使用 Fitness Lab</h1>
          <p className="text-sm text-muted dark:text-muted-dark mt-1">花 1 分钟认识你，生成专属方案</p>
        </div>

        {/* 进度条 */}
        <div className="flex gap-1.5 mb-2">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex-1">
              <div
                className="h-1 rounded-full transition-colors"
                style={{ backgroundColor: i <= step ? COLORS.gold : 'rgba(128,128,128,0.2)' }}
              />
            </div>
          ))}
        </div>
        {/* 当前步标题 + 预知 */}
        <div className="flex items-center justify-between mb-4 px-0.5">
          <span className="text-xs font-medium text-gold dark:text-gold-dark">
            {step + 1}/{STEPS.length} · {current.title}
          </span>
          <span className="text-[11px] text-muted dark:text-muted-dark">接着：{current.hint}</span>
        </div>

        <Card>
          {/* Step 0: 目标 + 性别 */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="label">你的目标</label>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setProfile({ goal: g })}
                      className={`btn ${profile.goal === g ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      {g === '减脂' ? '🔥 减脂' : '💪 增肌'}
                    </button>
                  ))}
                </div>
              </div>
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
            </div>
          )}

          {/* Step 1: 体征（身高/体重/年龄/水平） */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">身高 cm</label>
                  <input type="number" className="input tnum" value={profile.heightCm} onChange={(e) => setProfile({ heightCm: +e.target.value })} />
                </div>
                <div>
                  <label className="label">体重 kg</label>
                  <input type="number" className="input tnum" value={profile.weightKg} onChange={(e) => setProfile({ weightKg: +e.target.value })} />
                </div>
                <div>
                  <label className="label">年龄</label>
                  <input type="number" className="input tnum" value={profile.age} onChange={(e) => setProfile({ age: +e.target.value })} />
                </div>
                <div>
                  <label className="label">训练水平</label>
                  <select className="input" value={profile.trainLevel} onChange={(e) => setProfile({ trainLevel: e.target.value as TrainLevel })}>
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-xs text-muted dark:text-muted-dark">
                基础代谢按 Mifflin-St Jeor 方程，需要身高体重年龄；训练水平决定力训消耗（男 150/200/250，女 100/150/200）。
              </p>
            </div>
          )}

          {/* Step 2: 训练时段 + 日历 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="label">你通常在什么时候训练？</label>
                <div className="grid grid-cols-2 gap-2">
                  {TRAIN_TIMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setProfile({ trainTime: t })}
                      className={`btn text-sm ${profile.trainTime === t ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted dark:text-muted-dark mt-2">
                  这决定三餐顺序（如早饭后练：早饭=练前餐 → 练后餐最大）
                </p>
              </div>
              <div>
                <label className="label">每周哪几天训练？</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEKDAY_LABELS.map((label, i) => {
                    const day = i as Weekday;
                    const active = trainingDays.includes(day);
                    return (
                      <button
                        key={label}
                        onClick={() => toggleTrainingDay(day)}
                        className={`aspect-square rounded-btn text-sm font-medium transition-colors ${
                          active ? 'btn-primary' : 'btn-ghost'
                        }`}
                      >
                        {label.replace('周', '')}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted dark:text-muted-dark mt-2">
                  已选 {trainingDays.length} 天。今日页据此判定训练日/休息日。
                </p>
              </div>
            </div>
          )}

          {/* 导航按钮 */}
          <div className="flex gap-2 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="btn btn-ghost flex-1">
                上一步
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="btn btn-primary flex-1">
                下一步
              </button>
            ) : (
              <button onClick={finish} className="btn btn-primary flex-1">
                生成我的方案 ✨
              </button>
            )}
          </div>
        </Card>

        <p className="text-center text-xs text-muted dark:text-muted-dark mt-4">
          数据仅存于本机，不上传任何服务器
        </p>
      </div>
    </div>
  );
}
