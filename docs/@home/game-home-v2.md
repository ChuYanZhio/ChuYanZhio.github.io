---
layout: home

hero:
  name: 仙途传说
  text: 踏碎凌霄 放肆桀骜
  tagline: 🔥 十年修仙路，一朝问仙途
  actions:
    - theme: brand
      text: ⚔️ 立即下载
      link: /guide/intro
    - theme: alt
      text: 📖 游戏攻略
      link: /reference/config
    - theme: alt
      text: 🎬 观看宣传片
      link: https://www.bilibili.com

features:
  - icon: 🌟
    title: 极致画质
    details: 次世代引擎打造，4K超清画质，每一帧都是壁纸级视觉盛宴。
  - icon: ⚔️
    title: 自由战斗
    details: 无锁定战斗系统，连招自由搭配，体验酣畅淋漓的战斗快感。
  - icon: 🏔️
    title: 广袤世界
    details: 1000+平方公里开放世界，探索上古遗迹、仙山福地、魔域深渊。
  - icon: 🐉
    title: 坐骑系统
    details: 收服上古神兽，驾驭仙鹤飞剑，遨游天地之间。
  - icon: 💑
    title: 情缘系统
    details: 缘定三生，邂逅命定之人，共赴仙途，双修证道。
  - icon: 🏆
    title: 跨服争霸
    details: 万人同屏攻城战，宗门跨服对决，问鼎仙界之巅。

---

<style>
/* 全局样式重置 */
.VPHome {
  position: relative;
  overflow: hidden;
}

/* 背景图片层 */
.VPHome::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/zliao/beij/1%20(11).jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.15;
  z-index: -1;
  filter: blur(2px);
}

/* Hero 区域增强 */
.VPHero {
  position: relative;
  padding-bottom: 80px !important;
}

.VPHero::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(to top, var(--vp-c-bg), transparent);
  pointer-events: none;
}

/* 名称渐变动画 */
.vp-home-hero-name {
  background: linear-gradient(
    135deg,
    #ff6b6b 0%,
    #ffd93d 25%,
    #6bcb77 50%,
    #4d96ff 75%,
    #ff6b6b 100%
  );
  background-size: 400% 400%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* 标签发光效果 */
.VPHero .tagline {
  text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
  animation: glow 3s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
  }
  to {
    text-shadow: 0 0 30px rgba(255, 217, 61, 0.8), 0 0 60px rgba(255, 107, 107, 0.4);
  }
}

/* 特色卡片增强 */
.VPFeature {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.VPFeature::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff);
  opacity: 0;
  transition: opacity 0.3s;
}

.VPFeature:hover {
  transform: translateY(-8px) scale(1.02);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(255, 107, 107, 0.2);
}

.VPFeature:hover::before {
  opacity: 1;
}

/* 图标动画 */
.VPFeature .icon {
  transition: transform 0.3s;
}

.VPFeature:hover .icon {
  transform: scale(1.3) rotate(10deg);
}

/* 按钮增强 */
.VPHero .action {
  transition: all 0.3s;
}

.VPHero .action:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .VPHome::before {
    opacity: 0.1;
  }
  
  .vp-home-hero-name {
    font-size: 2.5rem !important;
  }
}
</style>

<div class="game-stats">

## 📊 游戏数据

| 统计项 | 数据 |
|--------|------|
| 🎮 注册玩家 | 10,000,000+ |
| ⭐ 好评率 | 98.5% |
| 🌍 开放地区 | 全球 50+ |
| 📅 运营时间 | 5 年 |

</div>

<div class="game-sections">

## 🎭 角色职业

<div class="classes-grid">

### ⚔️ 剑修
以剑入道，剑气纵横三万里，一剑光寒十九洲。

### 🔥 法修
掌控元素之力，火焚天地，冰封万里，雷霆万钧。

### 🌿 医修
悬壶济世，救死扶伤，丹药炼制，妙手回春。

### 🗡️ 刺修
隐匿于暗影之中，一击必杀，千里不留行。

</div>

---

## 🎬 游戏截图

<div class="screenshot-gallery">

![游戏截图1](/zliao/beij/1%20(3).jpg)
![游戏截图2](/zliao/beij/1%20(6).jpg)
![游戏截图3](/zliao/beij/1%20(10).jpg)

</div>

---

## 📜 游戏背景

> 天地初开，混沌未分，盘古开天辟地，女娲炼石补天。
> 
> 自上古神魔大战后，仙界封闭，凡间灵气日渐稀薄。
> 
> 然天地不仁，以万物为刍狗。仍有逆天之人，寻仙问道，誓要踏碎凌霄，问鼎长生。
> 
> **你，便是这天选之人。**

---

## 🏆 荣誉奖项

- 🥇 2025 年度最佳仙侠游戏
- 🥇 2025 年度最佳美术设计
- 🥇 2025 年度最佳音乐音效
- 🥇 2025 最受期待游戏

---

## 💬 玩家评价

> "画面精美，玩法丰富，是我玩过最好的修仙游戏！"
> — 玩家：仙途追梦人

> "战斗系统非常流畅，技能特效华丽，强烈推荐！"
> — 玩家：剑指苍穹

> "情缘系统太赞了，在这里遇到了我的另一半！"
> — 玩家：缘定三生

</div>

<style>
/* 统计数据样式 */
.game-stats table {
  width: 100%;
  max-width: 600px;
  margin: 2rem auto;
  border-collapse: collapse;
}

.game-stats td {
  padding: 1rem 2rem;
  text-align: center;
  font-size: 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.game-stats td:first-child {
  text-align: left;
  font-weight: bold;
}

/* 职业网格 */
.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.classes-grid h3 {
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(77, 150, 255, 0.1));
  border-radius: 12px;
  border-left: 4px solid;
  transition: all 0.3s;
}

.classes-grid h3:nth-child(1) { border-left-color: #ff6b6b; }
.classes-grid h3:nth-child(2) { border-left-color: #ffd93d; }
.classes-grid h3:nth-child(3) { border-left-color: #6bcb77; }
.classes-grid h3:nth-child(4) { border-left-color: #4d96ff; }

.classes-grid h3:hover {
  transform: translateX(10px);
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(77, 150, 255, 0.2));
}

/* 截图画廊 */
.screenshot-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.screenshot-gallery img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.screenshot-gallery img:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 30px rgba(255, 107, 107, 0.4);
}

/* 引用样式 */
.game-sections blockquote {
  position: relative;
  padding: 2rem;
  margin: 2rem 0;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.05), rgba(77, 150, 255, 0.05));
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  font-style: italic;
  line-height: 2;
}

.game-sections blockquote::before {
  content: '"';
  position: absolute;
  top: -10px;
  left: 20px;
  font-size: 4rem;
  color: rgba(255, 107, 107, 0.3);
  font-family: serif;
}

/* 奖项样式 */
.game-sections ul {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  list-style: none;
  padding: 0;
}

.game-sections ul li {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  color: #000;
  border-radius: 30px;
  font-weight: bold;
  transition: transform 0.3s;
}

.game-sections ul li:hover {
  transform: scale(1.1);
}

/* 评价样式 */
.game-sections > p {
  position: relative;
  padding: 1.5rem;
  margin: 1rem 0;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border-left: 3px solid #6bcb77;
}
</style>
