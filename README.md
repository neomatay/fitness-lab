# Fitness Lab · 健身方案实验室

把 B站「好人松松」健身Excel套表（26年4月版）重构为网页应用，输入体征即自动算出饮食/训练方案，不再需要看 Excel 和视频。

## 功能模块

| 模块 | 说明 | 数据来源 |
|------|------|---------|
| 🍽 饮食方案生成器 | 输入体征→自动算基础代谢/应吃热量/三大营养素配额/三餐分配 | 表1-15（文字算法还原） |
| 🏃 有氧热量计算器 | 心率+体重→每小时消耗，全体重档查表 | 表16（1950公式） |
| 💪 最大力量预测 | 配重+次数→8个1RM方程并行预测 | 表24（9公式） |
| 🥗 食物营养查询 | 104种食物的碳水率/蛋白率/GI | 表19 |
| 🏋 训练计划 | 4种分化方案的动作库 | 表20-23 |
| ❓ 健身问答 | 减脂26问+增肌18问，可搜索 | 表17-18 |

## 核心算法（三大引擎）

### 引擎A：饮食方案
```
基础代谢 a (Mifflin-St Jeor): 男=体重×9.99+身高×6.25-年龄×4.92+5; 女=...-161
无运动消耗 b = a ÷ 0.7
力训消耗 c (查表): 男150/200/250 女100/150/200
有氧消耗 d (引擎B传入)
平衡热量: 训练日 e1=b+c+d / 休息日 e2=b+d
应吃热量: 减脂 ×0.64 / 增肌 ×0.84
营养素: 训练日扣脂肪后64%碳水/36%蛋白; 休息日剩余全碳水
脂肪配额: 减脂男60女50(120kg+→70) / 增肌男80女70
```
**关键设计**：配额(g/kg)由热量计算派生（作者注释"配额表就是这么计算而来的"），无需查视频，全自动。

### 引擎B：有氧热量
```
每kg消耗 = 运动心率÷静息心率×6.4 - 6.2
每小时消耗 = 上式 × 体重 × 体重校正系数(50-85kg:1.0, 90:0.98, 95:0.96...)
结果 ROUND 到10的倍数
填表d值 = 每小时 × 周时长 ÷ 7
```
已用 Excel 已知值验证：静息60/运动120/体重70→460，体重120→710。

### 引擎C：1RM预测
8个方程（Adams/Brown/Brzycki/Lander/Lombardi/Mayhew/O'Connor/Wathen），已用 Excel 表24 验证（配重50/次数10→Adams 62.5, Brzycki 66.7）。

## 技术栈

- React 18 + Vite + TypeScript
- Tailwind CSS（明暗双主题，暖调质感配色）
- Zustand + localStorage（体征信息持久化，免重复输入）
- React Router（6模块路由）
- Vitest（公式引擎单元测试）

视觉风格融合 Core Atelier / Ethos Athletic Club / Alo / Fitonist / Apple Fitness+ 五个参考站：大量留白 + 数据优先 + 暖中性克制配色 + 粗体大字 + 圆角卡片 + 彩色进度条。

## 本地运行

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器 http://localhost:5173
npm test         # 运行单元测试（28个）
npm run build    # 生产构建
```

## 部署到 GitHub Pages（免费托管，无需服务器）

本项目是纯前端应用，可免费托管在 GitHub Pages。

**已配置好**：
- 路由用 `HashRouter`（避免 GitHub Pages 刷新 404）
- Vite 生产构建 `base: '/fitness-lab/'`（匹配仓库名）

**部署步骤**：

1. 在 GitHub 新建空仓库 `fitness-lab`（Public，不要勾选 README/license）

2. 本地推送：
```bash
git remote add origin https://github.com/<你的用户名>/fitness-lab.git
git branch -M main
git push -u origin main
```

3. GitHub 仓库 → Settings → Pages → Source 选 **`GitHub Actions`**（不是 branch）

4. 推送后仓库 Actions 标签页会自动跑 `Deploy to GitHub Pages` 工作流，1-2 分钟完成

5. 访问 `https://<你的用户名>.github.io/fitness-lab/`

**更新网站**：以后每次 `git push` 到 main，网站自动重新构建部署，无需手动操作。

## 重新提取数据

原始 Excel 不在仓库内。如需从源表重新生成数据：

```bash
# 把 xlsx 放到项目上级目录，然后：
python3 scripts/extract_excel.py
# 生成 src/data/{foods,exercises,qa}.json
```

## 项目结构

```
fitness-app/
├── scripts/extract_excel.py          # Excel→JSON 提取脚本
├── src/
│   ├── data/                          # 提取的结构化数据
│   │   ├── foods.json                 # 104种食物
│   │   ├── exercises.json             # 145个训练动作
│   │   └── qa.json                    # 44条问答
│   ├── lib/                           # 三大公式引擎
│   │   ├── diet.ts / cardio.ts / oneRM.ts
│   │   └── engines.test.ts            # 21个单元测试
│   ├── pages/                         # 6个模块页面
│   ├── components/ui.tsx              # 通用UI组件
│   ├── store/useStore.ts              # Zustand状态
│   └── hooks/useTheme.ts              # 主题切换
└── ...
```

## 数据与算法来源

原始 Excel：`【可任意分享】健身Excel超级套表（作者：B站好人松松）26年4月最新版.xlsx`
所有公式与数据均忠实还原自该套表，仅做网页化重构，不改变计算逻辑。
