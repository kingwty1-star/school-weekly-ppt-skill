import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

process.env.HOME ||= os.homedir();

const W = 1280;
const H = 720;
const FONT = "Microsoft YaHei";
const LATIN = "Aptos";
const C = {
  deep: "#0B2E4A",
  blue: "#1F5F99",
  soft: "#DDEBFA",
  ice: "#F3F8FF",
  cyan: "#23A6D5",
  ink: "#263238",
  muted: "#6C7A89",
  white: "#FFFFFF",
  line: "#9DB9D8",
  pale: "#EAF3FC",
  warn: "#F6B44B",
  gray: "#D7E1EB",
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function usage() {
  return [
    "Usage:",
    "  node build_school_weekly_ppt.mjs --input report.md [--output deck.pptx] [--title title] [--week 2026W21] [--workdir outputs/ppt-work/name]",
  ].join("\n");
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findPresentationsSkillDir() {
  const explicit = process.env.PRESENTATIONS_SKILL_DIR;
  const candidates = [];
  if (explicit) candidates.push(explicit);

  const homes = [os.homedir(), process.env.USERPROFILE, process.env.HOME].filter(Boolean);
  for (const home of homes) {
    candidates.push(
      path.join(home, ".codex", "plugins", "cache", "openai-primary-runtime", "presentations"),
      path.join(home, ".codex", "plugins", "cache", "openai-bundled", "presentations")
    );
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    const utils = path.join(candidate, "scripts", "artifact_tool_utils.mjs");
    if (await exists(utils)) return candidate;
    if (!(await exists(candidate))) continue;
    const versions = await fs.readdir(candidate, { withFileTypes: true }).catch(() => []);
    const sorted = versions
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
      .reverse();
    for (const version of sorted) {
      const skillDir = path.join(candidate, version, "skills", "presentations");
      const nestedUtils = path.join(skillDir, "scripts", "artifact_tool_utils.mjs");
      if (await exists(nestedUtils)) return skillDir;
    }
  }

  throw new Error("Could not find the Presentations skill. Set PRESENTATIONS_SKILL_DIR to the presentations skill directory.");
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---[\s\S]*?---\s*/, "");
}

function cleanInline(text) {
  return String(text ?? "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~>#]/g, "")
    .replace(/^\s*[-*+]\s+/, "")
    .replace(/^\s*\d+[.)]\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fit(text, max = 80) {
  const clean = cleanInline(text);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

function uniq(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const clean = cleanInline(item);
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}

function parseMarkdown(markdown, inputPath) {
  const body = stripFrontmatter(markdown);
  const lines = body.split(/\r?\n/);
  const sections = [];
  let current = { level: 0, title: "概述", lines: [] };
  for (const line of lines) {
    const heading = line.match(/^(#{1,4})\s+(.+?)\s*$/);
    if (heading) {
      if (current.lines.length || current.title !== "概述") sections.push(current);
      current = { level: heading[1].length, title: cleanInline(heading[2]), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length || current.title !== "概述") sections.push(current);

  const firstHeading = sections.find((section) => section.level === 1)?.title;
  const firstNonEmpty = lines.map(cleanInline).find((line) => line && !line.startsWith("---"));
  const title = firstHeading || firstNonEmpty || path.basename(inputPath, path.extname(inputPath));
  const plain = cleanInline(body);
  const weekMatch =
    plain.match(/20\d{2}\s*W\s*\d{1,2}/i) ||
    plain.match(/20\d{2}[-/.年]\d{1,2}[-/.月]\d{1,2}/) ||
    plain.match(/第\s*\d{1,2}\s*周/) ||
    title.match(/20\d{2}\s*W\s*\d{1,2}/i);

  const bullets = uniq(
    lines
      .filter((line) => /^\s*([-*+]|\d+[.)])\s+/.test(line))
      .map(cleanInline)
  );

  const paragraphs = uniq(
    body
      .split(/\n\s*\n/)
      .map(cleanInline)
      .filter((text) => text && !/^#+\s/.test(text))
  );

  return {
    body,
    plain,
    lines,
    sections,
    title,
    week: weekMatch ? weekMatch[0].replace(/\s+/g, "") : "学习周报",
    bullets,
    paragraphs,
  };
}

function sectionText(report, keywords) {
  const lowered = keywords.map((word) => word.toLowerCase());
  const matched = report.sections.filter((section) => lowered.some((word) => section.title.toLowerCase().includes(word)));
  const pool = matched.length ? matched : report.sections;
  return pool.map((section) => [section.title, ...section.lines].join("\n")).join("\n");
}

function bulletsFrom(text, fallback, count = 4) {
  const lines = text.split(/\r?\n/);
  const bulletLines = uniq(lines.filter((line) => /^\s*([-*+]|\d+[.)])\s+/.test(line)).map(cleanInline));
  if (bulletLines.length) return bulletLines.slice(0, count);
  const sentenceLines = uniq(
    cleanInline(text)
      .split(/[。！？!?；;]/)
      .map((item) => item.trim())
      .filter(Boolean)
  );
  return (sentenceLines.length ? sentenceLines : fallback).slice(0, count);
}

function extractTerms(report) {
  const codeTerms = [...report.body.matchAll(/`([^`\n]{1,40})`/g)].map((match) => match[1]);
  const latinTerms = report.plain.match(/\b[a-zA-Z][a-zA-Z0-9_]*(?:Hat|hat|Ref|ref)?\b/g) || [];
  const priorityNames = [
    "yd",
    "xHat1",
    "xHat2",
    "z1",
    "z2",
    "alpha1",
    "alpha2",
    "phi1",
    "phi2",
    "v",
    "u",
    "dEtaHat",
    "etaHat",
    "gamma",
    "theta",
    "params",
    "results",
    "dt",
  ].filter((term) => new RegExp(`(^|[^a-zA-Z0-9_])${term}([^a-zA-Z0-9_]|$)`).test(report.plain));
  const blacklist = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "this",
    "that",
    "matlab",
    "simulink",
    "figure",
    "table",
    "code",
    "data",
    "true",
    "false",
  ]);
  const ranked = new Map();
  for (const raw of [...codeTerms, ...latinTerms]) {
    const term = raw.trim().replace(/[()[\]{}.,;:，。；：]/g, "");
    if (!term || term.length > 24 || blacklist.has(term.toLowerCase())) continue;
    ranked.set(term, (ranked.get(term) || 0) + (codeTerms.includes(raw) ? 3 : 1));
  }
  const rankedTerms = [...ranked.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([term]) => term)
    .slice(0, 16);
  return uniq([...priorityNames, ...rankedTerms]).slice(0, 16);
}

function findTerm(terms, patterns, fallback) {
  for (const pattern of patterns) {
    const found = terms.find((term) => pattern.test(term));
    if (found) return found;
  }
  return fallback;
}

function isGenericWeeklyTitle(title) {
  return /学习周报|周报|weekly/i.test(title) && /(20\d{2}|第\s*\d+\s*周|W\s*\d+)/i.test(title);
}

function deriveTopicFromText(text) {
  const patterns = [
    /学习主题是\s*([^。；;]+)/,
    /本周围绕\s*([^。；;，,]+?)(?:进行学习|开展学习|展开学习|进行|开展|展开)/,
    /围绕\s*([^。；;，,]+?)(?:进行学习|开展学习|展开学习|进行|开展|展开)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanInline(match[1]);
  }
  return "";
}

function deriveTitle(report, args) {
  if (args.title) return fit(args.title, 34);
  const theme = deriveTopicFromText(report.plain);
  if (isGenericWeeklyTitle(report.title) && theme) return fit(theme, 34);
  if (isGenericWeeklyTitle(report.title)) {
    const heading = report.sections.find((section) => section.level >= 2 && !/周报|概览|总结|计划/.test(section.title))?.title;
    return fit(heading || "学习进展汇报", 34);
  }
  return fit(report.title.replace(/^学习周报[:：-]?\s*/, ""), 34);
}

function buildDeckData(report, args) {
  const progressText = sectionText(report, ["进展", "完成", "成果", "学习", "核心", "总结"]);
  const pathText = sectionText(report, ["路径", "流程", "框架", "结构", "入口", "参数", "循环", "代码"]);
  const mechanismText = sectionText(report, ["机制", "原理", "公式", "模型", "算法", "控制", "变量", "创新", "方法"]);
  const reflectionText = sectionText(report, ["问题", "修正", "反思", "不足", "难点", "错误", "疑问"]);
  const nextText = sectionText(report, ["下周", "计划", "下一步", "后续"]);
  const fallback = report.bullets.length ? report.bullets : report.paragraphs;
  const terms = extractTerms(report);
  const formulaLines = uniq(
    report.lines
      .filter((line) => /[=<>]|gamma|theta|alpha|eta|phi|sigma|RBF|控制|误差|触发/i.test(line))
      .map(cleanInline)
  );
  const headingPath = uniq(
    report.sections
      .map((section) => section.title)
      .filter((title) => title !== "概述" && title !== report.title && !isGenericWeeklyTitle(title))
  );

  return {
    title: deriveTitle(report, args),
    week: args.week || report.week,
    subtitle: fit(report.paragraphs[0] || "本周围绕学习材料、代码复现与关键机制理解形成阶段性沉淀。", 64),
    chips: uniq([terms[0], terms[1], terms[2], "学习周报"].filter(Boolean)).slice(0, 4),
    progress: bulletsFrom(progressText, fallback, 3),
    path: (headingPath.length >= 4 ? headingPath : ["输入资料", "框架理解", "机制拆解", "输出沉淀"]).slice(0, 4),
    detail: bulletsFrom(pathText, fallback, 4),
    mechanism: {
      terms,
      formula: fit(formulaLines[0] || `${terms[2] || "error"} = ${terms[1] || "state"} - ${terms[0] || "target"}`, 70),
      caption: fit(bulletsFrom(mechanismText, fallback, 1)[0] || "将关键变量放回系统关系中，解释公式项的作用。", 72),
    },
    knowledge: uniq([...terms, ...headingPath]).slice(0, 9),
    reflection: bulletsFrom(reflectionText, fallback, 3),
    next: bulletsFrom(nextText, ["对应公式位置", "补充关键机制推导", "整理仿真图和数据", "准备下一次汇报"], 4),
  };
}

function noneLine() {
  return { fill: { type: "none" }, width: 0 };
}

function addShape(slide, geometry, x, y, w, h, opts = {}) {
  return slide.shapes.add({
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill: opts.fill ?? C.white,
    line: opts.line ?? { fill: C.line, width: 1 },
    shadow: opts.shadow,
  });
}

function styleText(shape, opts = {}) {
  shape.text.typeface = opts.font ?? FONT;
  shape.text.fontSize = opts.size ?? 20;
  shape.text.color = opts.color ?? C.ink;
  shape.text.bold = opts.bold ?? false;
  shape.text.alignment = opts.align ?? "left";
  shape.text.verticalAlignment = opts.valign ?? "top";
  shape.text.wrap = "square";
  shape.text.autoFit = opts.autoFit ?? "shrinkText";
  shape.text.insets = opts.insets ?? { top: 8, right: 10, bottom: 8, left: 10 };
}

function addText(slide, x, y, w, h, text, opts = {}) {
  const sh = addShape(slide, "rect", x, y, w, h, { fill: { type: "none" }, line: noneLine() });
  sh.text.set(text);
  styleText(sh, opts);
  return sh;
}

function addBox(slide, x, y, w, h, text, opts = {}) {
  const sh = addShape(slide, opts.geometry ?? "roundRect", x, y, w, h, {
    fill: opts.fill ?? C.white,
    line: opts.line ?? { fill: opts.stroke ?? C.line, width: opts.strokeWidth ?? 1.5 },
    shadow: opts.shadow,
  });
  sh.text.set(text);
  styleText(sh, {
    size: opts.size ?? 19,
    color: opts.color ?? C.deep,
    bold: opts.bold ?? false,
    align: opts.align ?? "center",
    valign: opts.valign ?? "middle",
    insets: opts.insets ?? { top: 8, right: 12, bottom: 8, left: 12 },
    font: opts.font ?? FONT,
  });
  return sh;
}

function addPill(slide, x, y, w, h, text, opts = {}) {
  return addBox(slide, x, y, w, h, text, {
    fill: opts.fill ?? C.soft,
    stroke: opts.stroke ?? C.blue,
    strokeWidth: opts.strokeWidth ?? 0.8,
    size: opts.size ?? 16,
    bold: opts.bold ?? false,
    color: opts.color ?? C.deep,
    insets: { top: 4, right: 10, bottom: 4, left: 10 },
    font: opts.font ?? FONT,
  });
}

function addArrow(slide, x, y, w, h, opts = {}) {
  return addShape(slide, "rightArrow", x, y, w, h, {
    fill: opts.fill ?? C.blue,
    line: { fill: opts.stroke ?? opts.fill ?? C.blue, width: opts.strokeWidth ?? 0 },
  });
}

function addBackground(slide, dark = false) {
  slide.background.fill = dark ? C.deep : C.ice;
  if (dark) return;
  for (let x = 80; x < W; x += 120) {
    addShape(slide, "rect", x, 0, 1, H, { fill: "#E7F0FA", line: noneLine() });
  }
  for (let y = 80; y < H; y += 100) {
    addShape(slide, "rect", 0, y, W, 1, { fill: "#E7F0FA", line: noneLine() });
  }
}

function addHeader(slide, kicker, title, pageNo) {
  addText(slide, 58, 32, 190, 28, kicker, {
    size: 13,
    bold: true,
    color: C.cyan,
    font: LATIN,
    align: "left",
    valign: "middle",
  });
  addText(slide, 58, 58, 900, 52, title, {
    size: 30,
    bold: true,
    color: C.deep,
    align: "left",
    valign: "middle",
  });
  addShape(slide, "rect", 58, 118, 68, 4, { fill: C.cyan, line: noneLine() });
  addText(slide, 1145, 36, 82, 32, String(pageNo).padStart(2, "0"), {
    size: 18,
    bold: true,
    color: C.blue,
    font: LATIN,
    align: "right",
    valign: "middle",
  });
}

function addFooter(slide, data) {
  addText(slide, 58, 684, 520, 18, `${data.week} 学习周报 | Markdown -> PPT`, {
    size: 10,
    color: "#7E91A6",
    align: "left",
    valign: "middle",
  });
}

function addMiniSignal(slide, x, y, w, h, color = C.cyan) {
  const pts = [
    [0.0, 0.72],
    [0.12, 0.45],
    [0.24, 0.58],
    [0.36, 0.28],
    [0.5, 0.35],
    [0.64, 0.18],
    [0.78, 0.44],
    [1.0, 0.24],
  ];
  for (let i = 0; i < pts.length - 1; i += 1) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const left = x + x1 * w;
    const right = x + x2 * w;
    const top = y + ((y1 + y2) / 2) * h;
    addShape(slide, "rect", left, top - 1.5, Math.max(6, right - left), 3, { fill: color, line: noneLine() });
  }
  for (const [px, py] of pts) {
    addShape(slide, "ellipse", x + px * w - 4, y + py * h - 4, 8, 8, { fill: color, line: noneLine() });
  }
}

function slide01(presentation, data) {
  const slide = presentation.slides.add();
  addBackground(slide, true);
  addShape(slide, "rect", 0, 0, W, H, { fill: C.deep, line: noneLine() });
  addShape(slide, "rect", 0, 0, W, 170, { fill: "#123F66", line: noneLine() });
  addShape(slide, "rect", 0, 520, W, 200, { fill: "#123F66", line: noneLine() });
  for (let i = 0; i < 9; i += 1) {
    addShape(slide, "ellipse", 750 + i * 38, 86 + (i % 3) * 58, 8, 8, { fill: "#83D4F0", line: noneLine() });
  }
  addText(slide, 68, 92, 780, 68, `${data.week} 学习周报`, {
    size: 42,
    bold: true,
    color: C.white,
    align: "left",
    valign: "middle",
  });
  addText(slide, 72, 170, 850, 120, data.title, {
    size: 52,
    bold: true,
    color: "#E8F6FF",
    align: "left",
    valign: "middle",
  });
  addText(slide, 76, 308, 640, 62, data.subtitle, {
    size: 20,
    color: "#BBDCF6",
    align: "left",
    valign: "middle",
  });
  data.chips.slice(0, 4).forEach((chip, i) => {
    addPill(slide, 76 + i * 180, 414, 160, 36, fit(chip, 14), { fill: "#163F63", stroke: "#5CB8E5", color: C.white });
  });
  addBox(slide, 745, 225, 150, 58, "input", { fill: "#E8F6FF", stroke: "#6CC8F0", size: 22, bold: true, font: LATIN });
  addArrow(slide, 910, 242, 96, 24, { fill: "#5CB8E5" });
  addBox(slide, 1020, 225, 180, 58, "learning", { fill: "#E8F6FF", stroke: "#6CC8F0", size: 22, bold: true, font: LATIN });
  addMiniSignal(slide, 762, 360, 430, 110, "#84D7F5");
  addText(slide, 790, 492, 350, 34, "从学习材料到可汇报理解", {
    size: 17,
    color: "#D6EEFA",
    align: "center",
    valign: "middle",
  });
}

function slide02(presentation, data) {
  const slide = presentation.slides.add();
  addBackground(slide);
  addHeader(slide, "CORE PROGRESS", "本周核心进展", 2);
  addText(slide, 82, 150, 1080, 78, "把 Markdown 笔记中的学习过程压缩为三条最值得汇报的进展。", {
    size: 30,
    bold: true,
    color: C.deep,
    align: "center",
    valign: "middle",
  });
  data.progress.slice(0, 3).forEach((item, i) => {
    const x = 88 + i * 380;
    addBox(slide, x, 286, 320, 222, "", { fill: C.white, stroke: "#C8DAEC" });
    addText(slide, x + 24, 308, 56, 44, String(i + 1).padStart(2, "0"), {
      size: 28,
      bold: true,
      color: i === 0 ? C.cyan : C.blue,
      font: LATIN,
      align: "left",
      valign: "middle",
    });
    addText(slide, x + 24, 358, 260, 92, fit(item, 48), {
      size: 23,
      bold: true,
      color: C.deep,
      align: "left",
      valign: "middle",
    });
    addShape(slide, "rect", x + 24, 474, 94, 5, { fill: i === 0 ? C.cyan : C.soft, line: noneLine() });
  });
  addBox(slide, 404, 548, 472, 58, "重点只保留最能说明学习推进的内容", {
    fill: C.deep,
    stroke: C.deep,
    color: C.white,
    size: 22,
    bold: true,
  });
  addFooter(slide, data);
}

function slide03(presentation, data) {
  const slide = presentation.slides.add();
  addBackground(slide);
  addHeader(slide, "LEARNING PATH", "学习路径：从输入到输出沉淀", 3);
  data.path.slice(0, 4).forEach((item, i) => {
    const x = 78 + i * 292;
    const active = i === 3;
    addBox(slide, x, 242, 220, 116, fit(item, 22), {
      fill: active ? C.deep : C.white,
      stroke: active ? C.cyan : C.blue,
      strokeWidth: active ? 3 : 1.5,
      color: active ? C.white : C.deep,
      size: 21,
      bold: true,
    });
    addText(slide, x + 22, 376, 176, 72, ["材料进入", "框架建立", "机制拆解", "汇报输出"][i] || "学习推进", {
      size: 19,
      color: active ? C.blue : C.ink,
      bold: active,
      align: "center",
      valign: "top",
    });
    if (i < 3) addArrow(slide, x + 230, 282, 58, 28, { fill: C.cyan });
  });
  addBox(slide, 130, 510, 1010, 70, "先确定主线，再把笔记中的细节放入清晰的汇报结构。", {
    fill: C.pale,
    stroke: "#BBD2EA",
    size: 24,
    bold: true,
    color: C.deep,
  });
  addFooter(slide, data);
}

function slide04(presentation, data) {
  const slide = presentation.slides.add();
  addBackground(slide);
  addHeader(slide, "WEEKLY DETAIL", "本周工作拆解", 4);
  addText(slide, 80, 150, 1020, 44, "将周报里的过程信息整理成可讲述的推进链路。", {
    size: 28,
    bold: true,
    color: C.deep,
    align: "left",
    valign: "middle",
  });
  addShape(slide, "rect", 116, 410, 1030, 5, { fill: C.blue, line: noneLine() });
  data.detail.slice(0, 4).forEach((item, i) => {
    const x = 96 + i * 285;
    addBox(slide, x, 226, 220, 118, "", { fill: C.white, stroke: C.blue, size: 20, bold: true, font: LATIN });
    addText(slide, x + 18, 242, 184, 26, `Step ${i + 1}`, {
      size: 19,
      bold: true,
      color: C.blue,
      font: LATIN,
      align: "center",
      valign: "middle",
    });
    addText(slide, x + 16, 276, 188, 54, fit(item, 38), {
      size: 16,
      color: C.ink,
      align: "center",
      valign: "top",
    });
    addShape(slide, "ellipse", 170 + i * 285, 392, 42, 42, { fill: i === 0 ? C.cyan : C.white, line: { fill: C.blue, width: 2 } });
    if (i < 3) addArrow(slide, x + 216, 254, 62, 24, { fill: C.cyan });
  });
  addBox(slide, 276, 476, 728, 78, "这一页不要堆满原文，重点是让老师快速看到本周学习如何逐步推进。", {
    fill: "#EEF5FC",
    stroke: "#AFC8E2",
    size: 23,
    bold: true,
    color: C.deep,
  });
  addFooter(slide, data);
}

function slide05(presentation, data) {
  const slide = presentation.slides.add();
  addBackground(slide);
  addHeader(slide, "KEY MECHANISM", "关键机制：把公式拆成物理关系", 5);
  addText(slide, 74, 136, 1090, 38, data.mechanism.caption, {
    size: 21,
    bold: true,
    color: C.deep,
    align: "center",
    valign: "middle",
  });

  const terms = data.mechanism.terms;
  const ref = findTerm(terms, [/^yd$/i, /ref/i, /target/i, /goal/i], "目标/参考");
  const state = findTerm(terms, [/xhat/i, /^x\d?$/i, /state/i, /output/i], "状态/输出");
  const err = findTerm(terms, [/^z\d$/i, /^e\d?$/i, /error/i], "误差 e");
  const comp = findTerm(terms, [/phi/i, /rbf/i, /comp/i], "补偿项");
  const virtual = findTerm(terms, [/alpha/i, /virtual/i], "虚拟控制");
  const want = findTerm(terms, [/^v$/i, /cmd/i, /control/i], "期望控制 v");
  const actual = findTerm(terms, [/^u$/i, /input/i, /act/i], "执行输入 u");
  const adapt = findTerm(terms, [/eta/i, /adapt/i], "自适应率");

  addShape(slide, "roundRect", 54, 192, 1168, 360, { fill: "#EAF4FE", line: { fill: "#BBD2EA", width: 1.2 } });
  addText(slide, 82, 204, 236, 24, "principle diagram", {
    size: 15,
    bold: true,
    color: C.blue,
    font: LATIN,
    align: "left",
    valign: "middle",
  });

  addShape(slide, "rect", 96, 264, 188, 98, { fill: C.white, line: { fill: C.blue, width: 1.3 } });
  addMiniSignal(slide, 112, 278, 150, 58, C.cyan);
  addText(slide, 105, 334, 170, 22, `${state} 与 ${ref} 的距离`, { size: 13, color: C.ink, align: "center", valign: "middle" });
  addShape(slide, "rect", 155, 292, 32, 32, { fill: "#CFE8F8", line: noneLine() });
  addText(slide, 118, 365, 160, 32, `${err} = ${state} - ${ref}`, { size: 16, bold: true, color: C.deep, font: LATIN, align: "center", valign: "middle" });

  addArrow(slide, 300, 292, 78, 28, { fill: C.blue });
  addBox(slide, 392, 270, 146, 74, `${virtual}\n中间目标`, { fill: C.white, stroke: C.blue, size: 18, bold: true, font: LATIN });
  addArrow(slide, 552, 292, 74, 28, { fill: C.blue });
  addBox(slide, 642, 270, 162, 74, comp, { fill: C.white, stroke: C.blue, size: 18, bold: true, font: LATIN });
  addArrow(slide, 818, 292, 72, 28, { fill: C.blue });
  addBox(slide, 906, 270, 126, 74, want, { fill: C.deep, stroke: C.cyan, strokeWidth: 2.5, color: C.white, size: 23, bold: true, font: LATIN });
  addArrow(slide, 1046, 292, 68, 28, { fill: C.blue });
  addBox(slide, 1120, 270, 72, 74, actual, { fill: C.cyan, stroke: C.cyan, color: C.white, size: 22, bold: true, font: LATIN });
  addText(slide, 1084, 348, 126, 24, "真正作用到系统", { size: 13, color: C.deep, align: "center", valign: "middle" });

  addBox(slide, 120, 426, 208, 58, "阴影区\n表示偏离/阈值", { fill: "#DDEBFA", stroke: C.cyan, size: 18, bold: true });
  addText(slide, 346, 434, 260, 38, "误差、补偿或阈值不只是变量名，而是系统中的作用区域。", { size: 16, color: C.ink, align: "left", valign: "middle" });

  addShape(slide, "roundRect", 622, 396, 334, 132, { fill: C.white, line: { fill: C.cyan, width: 3 } });
  addText(slide, 650, 408, 278, 36, `|${want}-${actual}| >= threshold ?`, {
    size: 19,
    bold: true,
    color: C.deep,
    font: LATIN,
    align: "center",
    valign: "middle",
  });
  addShape(slide, "rect", 684, 456, 208, 28, { fill: "#D7F3FB", line: noneLine() });
  addText(slide, 690, 459, 196, 22, "触发/更新边界", {
    size: 15,
    color: C.blue,
    align: "center",
    valign: "middle",
  });
  addArrow(slide, 970, 430, 96, 34, { fill: C.cyan });
  addBox(slide, 1080, 410, 106, 74, "更新\n输出", { fill: C.cyan, stroke: C.cyan, color: C.white, size: 20, bold: true });

  addShape(slide, "roundRect", 76, 580, 1110, 72, { fill: "#F7FBFF", line: { fill: "#BBD2EA", width: 1 } });
  addText(slide, 98, 594, 214, 28, "公式项对应关系", { size: 18, bold: true, color: C.blue, align: "left", valign: "middle" });
  addArrow(slide, 330, 604, 104, 24, { fill: C.blue });
  addText(slide, 446, 588, 352, 44, data.mechanism.formula, { size: 18, bold: true, color: C.deep, font: LATIN, align: "center", valign: "middle" });
  addArrow(slide, 810, 604, 104, 24, { fill: C.blue });
  addBox(slide, 930, 590, 154, 48, adapt, { fill: C.deep, stroke: C.deep, color: C.white, size: 19, bold: true, font: LATIN });
}

function slide06(presentation, data) {
  const slide = presentation.slides.add();
  addBackground(slide);
  addHeader(slide, "KNOWLEDGE MAP", "知识点关系图", 6);
  addText(slide, 82, 142, 1030, 42, "把周报中的关键词整理成一条从概念到输出的理解链。", {
    size: 25,
    bold: true,
    color: C.deep,
    align: "left",
    valign: "middle",
  });
  const items = (data.knowledge.length ? data.knowledge : ["输入", "模型", "误差", "方法", "输出"]).slice(0, 9);
  items.forEach((item, i) => {
    const x = 72 + i * 132;
    const important = i === 0 || i === Math.floor(items.length / 2) || i === items.length - 1;
    addBox(slide, x, 266, 102, 72, fit(item, 12), {
      fill: important ? C.deep : C.white,
      stroke: important ? C.cyan : C.blue,
      color: important ? C.white : C.deep,
      size: 18,
      bold: true,
      font: /[a-zA-Z]/.test(item) ? LATIN : FONT,
    });
    if (i < items.length - 1) addArrow(slide, x + 105, 290, 34, 20, { fill: C.cyan });
  });
  const lanes = [
    ["概念层", "报告中出现的关键词先被归类。"],
    ["机制层", "再说明变量、公式或方法之间的因果关系。"],
    ["表达层", "最后转成可汇报的图形和结论。"],
  ];
  lanes.forEach((lane, i) => {
    const x = 132 + i * 350;
    addBox(slide, x, 470, 286, 104, "", { fill: C.white, stroke: "#BBD2EA" });
    addText(slide, x + 18, 486, 240, 28, lane[0], {
      size: 21,
      bold: true,
      color: C.blue,
      align: "left",
      valign: "middle",
    });
    addText(slide, x + 18, 522, 240, 38, lane[1], {
      size: 16,
      color: C.ink,
      align: "left",
      valign: "top",
    });
  });
  addFooter(slide, data);
}

function slide07(presentation, data) {
  const slide = presentation.slides.add();
  addBackground(slide);
  addHeader(slide, "REFLECTION", "问题修正与理解加深", 7);
  addText(slide, 82, 142, 1020, 42, "反思页重点呈现：哪里曾经模糊，现在如何变清楚。", {
    size: 25,
    bold: true,
    color: C.deep,
    align: "left",
    valign: "middle",
  });
  data.reflection.slice(0, 3).forEach((item, i) => {
    const y = 230 + i * 126;
    addBox(slide, 96, y, 142, 76, `问题 ${i + 1}`, { fill: C.deep, stroke: C.deep, color: C.white, size: 22, bold: true });
    addBox(slide, 284, y, 360, 76, fit(item, 46), { fill: "#EEF1F5", stroke: "#C7D1DA", color: C.muted, size: 18 });
    addArrow(slide, 666, y + 24, 76, 28, { fill: C.cyan });
    addBox(slide, 764, y, 392, 76, "下一步：结合公式、代码或图形继续验证", {
      fill: C.white,
      stroke: C.cyan,
      strokeWidth: 2.5,
      color: C.deep,
      size: 19,
      bold: true,
    });
  });
  addText(slide, 302, 598, 690, 36, "修正不是扣分点，而是本周理解进入细节层的证据。", {
    size: 23,
    bold: true,
    color: C.blue,
    align: "center",
    valign: "middle",
  });
  addFooter(slide, data);
}

function slide08(presentation, data) {
  const slide = presentation.slides.add();
  addBackground(slide, true);
  addShape(slide, "rect", 0, 0, W, H, { fill: C.deep, line: noneLine() });
  addShape(slide, "rect", 0, 0, W, 155, { fill: "#123F66", line: noneLine() });
  addShape(slide, "rect", 0, 540, W, 180, { fill: "#123F66", line: noneLine() });
  addText(slide, 66, 58, 940, 58, "下周重点：把理解继续推进到可验证输出", {
    size: 40,
    bold: true,
    color: C.white,
    align: "left",
    valign: "middle",
  });
  addText(slide, 70, 136, 880, 38, "从“已经看懂主线”推进到“能解释细节并产出图形或结果”。", {
    size: 22,
    color: "#CDEBFA",
    align: "left",
    valign: "middle",
  });
  data.next.slice(0, 4).forEach((item, i) => {
    const x = 82 + i * 292;
    addShape(slide, "roundRect", x, 268, 238, 172, {
      fill: i === 3 ? "#E8F6FF" : "#164365",
      line: { fill: i === 3 ? C.cyan : "#3D7197", width: 1.5 },
    });
    addText(slide, x + 18, 290, 54, 34, String(i + 1).padStart(2, "0"), {
      size: 24,
      bold: true,
      color: i === 3 ? C.blue : C.cyan,
      font: LATIN,
      align: "left",
      valign: "middle",
    });
    addText(slide, x + 18, 340, 190, 70, fit(item, 38), {
      size: 20,
      bold: true,
      color: i === 3 ? C.deep : C.white,
      align: "left",
      valign: "middle",
    });
    if (i < 3) addArrow(slide, x + 246, 338, 42, 22, { fill: C.cyan });
  });
  addBox(slide, 356, 532, 568, 64, "最终目标：形成可复用的周报 PPT 汇报闭环", {
    fill: "#E8F6FF",
    stroke: C.cyan,
    strokeWidth: 2,
    color: C.deep,
    size: 24,
    bold: true,
  });
  addText(slide, 1054, 628, 118, 28, "08", {
    size: 18,
    bold: true,
    color: "#BBDCF6",
    font: LATIN,
    align: "right",
    valign: "middle",
  });
}

function safeName(text) {
  return cleanInline(text)
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

const args = parseArgs(process.argv.slice(2));
if (!args.input) {
  console.error(usage());
  process.exit(2);
}

const root = process.cwd();
const inputPath = path.resolve(root, args.input);
const markdown = await fs.readFile(inputPath, "utf8");
const report = parseMarkdown(markdown, inputPath);
const data = buildDeckData(report, args);
const outputPath = path.resolve(
  root,
  args.output || path.join("outputs", "final", `${safeName(`${data.week}-${data.title}`) || "学习周报"}.pptx`)
);
const deckName = safeName(path.basename(outputPath, path.extname(outputPath))) || "school-weekly-ppt";
const workdir = path.resolve(root, args.workdir || path.join("outputs", "ppt-work", deckName));
const previewDir = path.join(workdir, "preview");

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const presentationsSkillDir = await findPresentationsSkillDir();
const utilsPath = path.join(presentationsSkillDir, "scripts", "artifact_tool_utils.mjs");
const { ensureArtifactToolWorkspace, importArtifactTool, saveBlobToFile } = await import(pathToFileURL(utilsPath).href);

await ensureArtifactToolWorkspace(workdir);
const artifact = await importArtifactTool(workdir);
const { Presentation, PresentationFile } = artifact;
const presentation = Presentation.create({ slideSize: { width: W, height: H } });

[slide01, slide02, slide03, slide04, slide05, slide06, slide07, slide08].forEach((build) => build(presentation, data));

const previewPaths = [];
for (let i = 0; i < presentation.slides.count; i += 1) {
  const slide = presentation.slides.getItem(i);
  const previewPath = path.join(previewDir, `slide-${String(i + 1).padStart(2, "0")}.png`);
  const preview = await presentation.export({ slide, format: "png", scale: 1 });
  await saveBlobToFile(preview, previewPath);
  previewPaths.push(previewPath);
}

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(outputPath);

const manifest = {
  input: inputPath,
  finalPptx: outputPath,
  slideCount: presentation.slides.count,
  previewDir,
  previewPaths,
  title: data.title,
  week: data.week,
};
await fs.writeFile(path.join(workdir, "build-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify(manifest, null, 2));
