# Display Lock

Show a lock icon in the note's more options button while the note is pinned.

Obsidian has a **Pin** feature (called 锁定 in the Chinese UI) that keeps a tab from being closed. The only visual hint that a note is pinned is a small icon in the tab bar — which is easy to miss, and on a phone the tab bar is so narrow that the hint is effectively invisible.

This plugin makes the pinned state obvious: while the active note is pinned, the ⋯ button in the top-right corner of the note switches to a **lock icon** and turns **red**.

| Not pinned | Pinned |
|:---:|:---:|
| ![More options button, not pinned](./images/normal.png) | ![More options button, pinned](./images/pinned.png) |

## Usage

Nothing to configure.

1. Open a note.
2. Pin the tab (right-click the tab and choose **Pin**, or run the **Toggle pin** command).
3. The ⋯ button in the note header turns into a red lock icon.

Unpin the tab and the button returns to its normal appearance.

The button keeps working as a menu — only its icon and color change.

## How it works

Obsidian exposes the more options button of each view as `view.moreOptionsButtonEl`, and each leaf carries a `pinned` flag. The plugin reads the flag, swaps the button icon with `setIcon`, and toggles a CSS class that colors it.

It listens on each leaf's `pinned-change` event, plus the workspace `layout-change` and `active-leaf-change` events. There is no polling and no background work.

A CSS snippet cannot do this, because Obsidian only applies `.is-pinned` to side drawers — there is no ancestor class on the tab itself, and `:has()` is not reliable on mobile.

## Installation

### From the community directory

Search for **Display Lock** in **Settings → Community plugins → Browse**.

### Manually

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](../../releases/latest).
2. Create the folder `<your vault>/.obsidian/plugins/display-lock/`.
3. Copy the three files into it.
4. Reload Obsidian and enable **Display Lock** in **Settings → Community plugins**.

### From source

There is no build step — `main.js` is the source. Copy the three files as above.

## Compatibility

- Works on desktop and mobile (`isDesktopOnly: false`).
- No third-party dependencies; the only `require` is the host `obsidian` module.
- No network access, no telemetry, no file system access.

## License

MIT — see [LICENSE](./LICENSE).

---

## 中文说明

Obsidian 的「锁定」（英文 Pin）作用是防止标签页被误关。但界面上只有一个很小的图标提示，手机上标签栏太窄，基本看不出来这篇笔记到底锁没锁。

这个插件让锁定状态一眼可见：**当前笔记处于锁定状态时，右上角的 ⋯ 按钮会变成一个红色的锁图标**。解锁后自动变回三个点。

**用法**：打开笔记 → 锁定标签页（右键标签选「锁定」，或用「解锁/锁定」命令）→ 右上角变成红色锁图标。按钮本身照常能点，只是图标和颜色变了。

**原理**：读 `leaf.pinned` 状态，用 `setIcon` 换图标，加一个 CSS class 染色。监听每个标签页的 `pinned-change` 事件，不做轮询、不后台运行。

**为什么不用 CSS 片段**：Obsidian 只给侧边抽屉加了 `.is-pinned`，标签页本身没有对应的祖先 class，纯 CSS 选不到；`:has()` 在手机端不保证可用。
