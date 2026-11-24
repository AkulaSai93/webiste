import * as THREE from "three";
import { SNIPPETS } from "./codeSnippets";

type Token = { text: string; color: string };

const C = {
  bg0: "#08101f",
  bg1: "#0d1a33",
  text: "#dbe6ff",
  gutter: "#3c4c6e",
  keyword: "#c792ea",
  string: "#a5e887",
  number: "#ffad66",
  comment: "#5f7294",
  fn: "#7fb4ff",
  tag: "#ff6b81",
  accent: "#e4002b",
};

const KEYWORDS =
  "def|class|import|from|return|for|in|if|else|const|let|async|await|function|export|default|new|while|with|as|lambda|True|False|None|true|false";

const TOKEN_RE = new RegExp(
  [
    String.raw`(#.*$|\/\/.*$)`, // 1 comment
    String.raw`(f?"[^"]*"|'[^']*'|\x60[^\x60]*\x60)`, // 2 string
    String.raw`(<\/?[A-Z]\w*|\/>|>)`, // 3 jsx tag
    String.raw`\b(\d+\.?\d*)\b`, // 4 number
    String.raw`\b(${KEYWORDS})\b`, // 5 keyword
    String.raw`\b([A-Za-z_]\w*)(?=\()`, // 6 function call
  ].join("|"),
  "g",
);

function tokenize(line: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN_RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: line.slice(last, i), color: C.text });
    const color = m[1] ? C.comment : m[2] ? C.string : m[3] ? C.tag : m[4] ? C.number : m[5] ? C.keyword : C.fn;
    out.push({ text: m[0], color });
    last = i + m[0].length;
  }
  if (last < line.length) out.push({ text: line.slice(last), color: C.text });
  return out;
}

/**
 * A tiny code editor drawn on a 2D canvas and used as a texture on the bot's screen.
 * It types the active snippet character by character, holds, then starts over.
 */
export class CodeScreen {
  readonly texture: THREE.CanvasTexture;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private w = 720;
  private h = 470;
  private key = "";
  private file = "";
  private lines: Token[][] = [];
  private lineLens: number[] = [];
  private total = 0;
  private typed = 0;
  private hold = 0;
  private charW = 12;
  private time = 0;

  constructor(initial = "agent") {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.font = "500 21px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
    this.charW = this.ctx.measureText("M").width;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
    this.setSnippet(initial);
  }

  setSnippet(key: string) {
    const snip = SNIPPETS[key];
    if (!snip || key === this.key) return;
    this.key = key;
    this.file = snip.file;
    const raw = snip.code.split("\n");
    this.lines = raw.map(tokenize);
    this.lineLens = raw.map((l) => l.length);
    this.total = this.lineLens.reduce((a, b) => a + b + 1, 0);
    this.typed = 0;
    this.hold = 0;
  }

  update(dt: number, reduced: boolean) {
    this.time += dt;
    if (reduced) {
      this.typed = this.total;
    } else if (this.typed < this.total) {
      this.typed += dt * 46; // chars per second
    } else {
      this.hold += dt;
      if (this.hold > 3.2) {
        this.typed = 0;
        this.hold = 0;
      }
    }
    this.draw();
  }

  private draw() {
    const { ctx, w, h, charW } = this;
    // background
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, C.bg1);
    g.addColorStop(1, C.bg0);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // title bar
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(0, 0, w, 46);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(26 + i * 22, 23, 6.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.font = "600 17px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(108, 8, ctx.measureText(this.file).width + 32, 38);
    ctx.fillStyle = C.text;
    ctx.fillText(this.file, 124, 33);
    // running badge
    const pulse = 0.55 + 0.45 * Math.sin(this.time * 4);
    ctx.fillStyle = `rgba(40,200,72,${pulse})`;
    ctx.beginPath();
    ctx.arc(w - 112, 23, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7d8db0";
    ctx.fillText("running", w - 100, 29);

    // code
    ctx.font = "500 21px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
    const lineH = 31;
    const top = 82;
    const gutterX = 20;
    const codeX = 64;
    const maxLines = Math.floor((h - top - 40) / lineH) + 1;

    // find cursor line
    let remaining = Math.floor(this.typed);
    let cursorLine = 0;
    let cursorCol = 0;
    const visible: number[] = [];
    for (let i = 0; i < this.lines.length; i++) {
      const len = this.lineLens[i];
      if (remaining < 0) break;
      const vis = Math.min(len, remaining);
      visible.push(vis);
      cursorLine = i;
      cursorCol = vis;
      remaining -= len + 1;
    }
    const first = Math.max(0, cursorLine - maxLines + 2);

    for (let i = first; i < visible.length && i - first < maxLines; i++) {
      const y = top + (i - first) * lineH;
      ctx.fillStyle = i === cursorLine ? "rgba(127,180,255,0.07)" : "transparent";
      ctx.fillRect(0, y - 23, w, lineH);
      ctx.fillStyle = i === cursorLine ? "#8fa3c9" : C.gutter;
      ctx.fillText(String(i + 1).padStart(2, " "), gutterX, y);

      let x = codeX;
      let drawn = 0;
      for (const tok of this.lines[i]) {
        if (drawn >= visible[i]) break;
        const part = tok.text.slice(0, visible[i] - drawn);
        ctx.fillStyle = tok.color;
        ctx.fillText(part, x, y);
        x += part.length * charW;
        drawn += tok.text.length;
      }
    }

    // cursor
    if (Math.floor(this.time * 2.2) % 2 === 0 || this.typed < this.total) {
      ctx.fillStyle = C.accent;
      ctx.fillRect(codeX + cursorCol * charW + 1, top + (cursorLine - first) * lineH - 21, 3, 26);
    }

    // status bar
    ctx.fillStyle = "rgba(228,0,43,0.85)";
    ctx.fillRect(0, h - 30, w, 30);
    ctx.font = "600 15px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
    ctx.fillStyle = "#fff";
    ctx.fillText("upGrad SOT  ·  AI-First", 16, h - 10);
    ctx.fillText(`Ln ${cursorLine + 1}, Col ${cursorCol + 1}`, w - 160, h - 10);

    // scanlines + vignette for a "real display" feel
    ctx.fillStyle = "rgba(255,255,255,0.018)";
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
    const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);

    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }
}
