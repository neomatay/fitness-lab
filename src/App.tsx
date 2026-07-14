import { NavLink, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { useStore } from './store/useStore';
import { OnboardingPage } from './pages/Onboarding';
import { TodayPage } from './pages/Today';
import { DietPage } from './pages/Diet';
import { LibraryPage } from './pages/Library';
import { FoodPage } from './pages/Food';
import { TrainingPage } from './pages/Training';
import { QAPage } from './pages/QA';
import { GalleryPage } from './pages/Gallery';
import { CardioPage } from './pages/Cardio';
import { OneRMPage } from './pages/OneRM';
import { Attribution } from './components/Attribution';

// 一级导航：今日 / 方案 / 查阅
const NAV = [
  { to: '/', label: '今日', icon: '⚡' },
  { to: '/plan', label: '方案', icon: '📋' },
  { to: '/library', label: '查阅', icon: '🔎' },
];

// 需要引导的路径（查阅子页和工具页也都需要先引导）
function RequireOnboard({ children }: { children: React.ReactNode }) {
  const isOnboarded = useStore((s) => s.isOnboarded);
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const isOnboarded = useStore((s) => s.isOnboarded);
  const location = useLocation();
  const isOnboarding = location.pathname === '/onboarding';

  // 引导页不显示主导航
  if (!isOnboarded && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="h-dvh flex flex-col">
      {!isOnboarding && (
        <header className="shrink-0 z-20 backdrop-blur-md bg-bg/80 dark:bg-bg-dark/80 border-b border-line dark:border-line-dark">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="font-bold tracking-tight">Fitness Lab</span>
            </div>
            <button onClick={toggleTheme} className="btn btn-ghost !px-3 !py-1.5 text-sm" aria-label="切换主题">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
          {/* 桌面端横向导航 */}
          <nav className="hidden md:block max-w-5xl mx-auto px-4 pb-2">
            <div className="flex gap-1">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-1.5 rounded-btn text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gold dark:bg-gold-dark text-bg-dark dark:text-bg'
                        : 'text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark'
                    }`
                  }
                >
                  <span className="mr-1.5">{n.icon}</span>
                  {n.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </header>
      )}

      {/* 主内容：只有这一块滚动 */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-5xl w-full mx-auto px-4 py-6">
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/" element={<RequireOnboard><TodayPage /></RequireOnboard>} />
            <Route path="/plan" element={<RequireOnboard><DietPage /></RequireOnboard>} />
            <Route path="/library" element={<RequireOnboard><LibraryPage /></RequireOnboard>} />
            <Route path="/library/food" element={<RequireOnboard><FoodPage /></RequireOnboard>} />
            <Route path="/library/training" element={<RequireOnboard><TrainingPage /></RequireOnboard>} />
            <Route path="/library/qa" element={<RequireOnboard><QAPage /></RequireOnboard>} />
            <Route path="/library/gallery" element={<RequireOnboard><GalleryPage /></RequireOnboard>} />
            <Route path="/tools/cardio" element={<RequireOnboard><CardioPage /></RequireOnboard>} />
            <Route path="/tools/1rm" element={<RequireOnboard><OneRMPage /></RequireOnboard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* 致谢页脚：常驻底部，不随内容滚动 */}
      <Attribution />

      {/* 移动端底部 Tab：常驻底部，不滚动 */}
      {!isOnboarding && (
        <nav className="md:hidden shrink-0 z-20 backdrop-blur-md bg-bg/90 dark:bg-bg-dark/90 border-t border-line dark:border-line-dark">
          <div className="grid grid-cols-3">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center py-2.5 text-xs transition-colors ${
                    isActive ? 'text-gold dark:text-gold-dark' : 'text-muted dark:text-muted-dark'
                  }`
                }
              >
                <span className="text-xl mb-0.5">{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
