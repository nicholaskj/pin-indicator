/*
 * Pin Indicator · 笔记锁定指示器
 *
 * 笔记「锁定」（= Obsidian 的 pin）之后，右上角那个 ⋯ 按钮变成锁图标 + 红色，
 * 一眼就看得出来当前这篇笔记是不是锁着的。
 *
 * 原理：
 *   Obsidian 给每个视图挂了 moreOptionsButtonEl（就是右上角的 ⋯ 按钮），
 *   标签页有 leaf.pinned 状态。两边一配对，换图标 + 加 class 就完事。
 *
 * 关键坑（实测踩过）：
 *   pinned-change 事件是在【leaf】上触发的，不是 app.workspace 上。
 *   源码：setPinned = function(e){ this.pinned=e; this.trigger("pinned-change", e); ... }
 *   所以必须逐个 leaf 监听，只在 workspace 上监听是收不到的。
 *
 * 为什么不写 CSS 片段？
 *   Obsidian 只给侧边抽屉加了 .is-pinned，标签页本身没有对应的祖先 class，
 *   纯 CSS 选不到「当前锁定标签页里的 ⋯」。（:has() 在手机端不保证可用，不能依赖）
 */

const { Plugin, setIcon } = require("obsidian");

const CSS_CLASS = "pin-indicator-active";
const DATA_ATTR = "data-pin-indicator";
const ICON_PINNED = "lock";
const ICON_NORMAL = "more-vertical";

module.exports = class PinIndicatorPlugin extends Plugin {
  onload() {
    // 已经挂过监听器的 leaf，避免重复注册
    this._hooked = new WeakSet();

    // 刷单个标签页
    this.refreshLeaf = (leaf) => {
      const btn = leaf && leaf.view && leaf.view.moreOptionsButtonEl;
      if (!btn) return;

      const pinned = !!leaf.pinned;
      btn.classList.toggle(CSS_CLASS, pinned);

      // 换图标：锁定 → 锁；未锁定 → 原来的三个点
      // 只在状态真的变了时才重设，避免每次刷新都重建 SVG
      const want = pinned ? ICON_PINNED : ICON_NORMAL;
      if (btn.getAttribute(DATA_ATTR + "-icon") !== want) {
        setIcon(btn, want);
        btn.setAttribute(DATA_ATTR + "-icon", want);
      }

      if (pinned) {
        btn.setAttribute(DATA_ATTR, "1");
        btn.setAttribute("aria-description", "This note is pinned");
      } else {
        btn.removeAttribute(DATA_ATTR);
        btn.removeAttribute("aria-description");
      }
    };

    // 刷所有标签页，并给新出现的 leaf 挂上监听
    this.refreshAll = () => {
      this.app.workspace.iterateAllLeaves((leaf) => {
        this.refreshLeaf(leaf);

        // pinned-change 在 leaf 上，不在 workspace 上
        if (!this._hooked.has(leaf)) {
          this._hooked.add(leaf);
          leaf.on("pinned-change", () => {
            this.refreshLeaf(leaf);
            // Obsidian 在 pinned-change 之后还会跑 updateHeader()，
            // 可能把图标刷回去，隔一拍再补两次（幂等，不会死循环）
            setTimeout(() => this.refreshLeaf(leaf), 150);
            setTimeout(() => this.refreshLeaf(leaf), 600);
          });
        }
      });
    };

    // 布局变化 / 切换标签页时重刷（同时把新 leaf 挂上）
    this.registerEvent(this.app.workspace.on("layout-change", () => this.refreshAll()));
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.refreshAll()));

    // 布局就绪后刷一遍
    this.app.workspace.onLayoutReady(() => this.refreshAll());

    // 还要直接刷一次：
    // 实测插件在布局已就绪的情况下加载时，onLayoutReady 不一定回调，
    // 结果一个 leaf 都没挂上监听，点锁定后完全不响应。
    this.refreshAll();
    // 再兜一次，防界面还没渲染完
    setTimeout(() => this.refreshAll(), 1500);
  }

  onunload() {
    // 卸载时把加的东西清干净，别留残影
    this.app.workspace.iterateAllLeaves((leaf) => {
      const btn = leaf && leaf.view && leaf.view.moreOptionsButtonEl;
      if (!btn) return;
      btn.classList.remove(CSS_CLASS);
      btn.removeAttribute(DATA_ATTR);
      btn.removeAttribute(DATA_ATTR + "-icon");
      btn.removeAttribute("aria-description");
      try {
        setIcon(btn, ICON_NORMAL);
      } catch (e) {
        /* 恢复失败不影响卸载 */
      }
    });
  }
};
