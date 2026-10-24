# obsidian-display-lock

Obsidian 显示锁定插件（开发中）

## 要解决的问题

安卓上的 Obsidian，把笔记「锁定」（= 标签页 pin）之后，**界面上看不出哪些笔记处于锁定状态**。

## 当前状态

**还没有写代码。** 已完成：需求梳理、Obsidian 源码调查、插件市场调研、方案确定。

详细过程见 → [开发记录-2026-10-21-锁定状态方案.md](开发记录-2026-10-21-锁定状态方案.md)

## 调查结论摘要

```
Obsidian 源码 app.js：
  "pinned"  出现 46 次
  "lock"    出现 0 次

i18n/zh.txt 680-681 行：
  锁定 / 取消锁定

→ 中文的「锁定」就是英文 pin，作用对象是【标签页 leaf】，不是笔记文件
→ 状态存在 workspace.json（桌面）/ workspace-mobile.json（手机），互不同步
→ 唯一视觉提示是标签栏上的小图标，手机屏幕窄看不清
```

## 下一步（按顺序）

```
1. 在 Ob测试库装 pinned-files（手机可用，文件列表出图钉）
2. 同时装 pins-save（修复重启后锁定丢失）
3. 两者都试完再决定要不要写自研插件
```

**自研方案技术路线**（已在源码确认可行）：

```js
app.workspace.getLeavesOfType("markdown").filter(l => l.pinned).map(l => l.view.file.path);
app.workspace.on("pinned-change", () => {});
```

## 本地开发目录

```
D:\dev\obsidian-display-lock
```

## 相关

- Gitea: http://192.168.5.115:3001/agent/obsidian-display-lock
- 库里已装的相关插件：`password-protection` v1.1.34（密码保护笔记，与标签锁定无关）
- 方案文档：`D:\syncthing\MyOpenclaw\Obsidian锁定状态显示_方案与插件推荐.md`
