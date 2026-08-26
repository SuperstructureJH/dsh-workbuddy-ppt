#!/usr/bin/env node
import { lstat, mkdir, open, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import yaml from "js-yaml";
import PptxGenJSImport from "pptxgenjs";
//#region lib/types/pptd.js
/** Clean-room PPTD v2 parser, checker, loader, and native editable PPTX renderer. */
const PptxGenJS = typeof PptxGenJSImport === "function" ? PptxGenJSImport : PptxGenJSImport.default;
const POINTS_PER_INCH = 72;
const MAX_MANIFEST_BYTES = 512 * 1024;
const MAX_PAGE_BYTES = 2 * 1024 * 1024;
const MAX_ASSET_BYTES = 32 * 1024 * 1024;
const MAX_TOTAL_ASSET_BYTES = 256 * 1024 * 1024;
const MAX_PAGES = 200;
const MAX_ELEMENTS_PER_PAGE = 2e3;
function record(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function string(value) {
	return typeof value === "string" ? value : void 0;
}
function number(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function boolean(value) {
	return typeof value === "boolean" ? value : void 0;
}
function tuple(value, size) {
	if (!Array.isArray(value) || value.length !== size) return void 0;
	const values = value.map(number);
	return values.every((item) => item !== void 0) ? values : void 0;
}
function safeProjectPath(value) {
	if (value === "" || path.isAbsolute(value) || value.includes("\\")) return void 0;
	const normalized = path.posix.normalize(value);
	return normalized === ".." || normalized.startsWith("../") || normalized.startsWith("/") ? void 0 : normalized;
}
function parseYaml(content, file, issues) {
	try {
		const value = record(yaml.load(content, {
			schema: yaml.JSON_SCHEMA,
			json: true
		}));
		if (value !== void 0) return value;
		issues.push({
			code: "yaml-root",
			severity: "error",
			file,
			message: `${file} 的 YAML 根节点必须是对象。`
		});
	} catch (error) {
		issues.push({
			code: "yaml-syntax",
			severity: "error",
			file,
			message: `${file} 无法解析：${error instanceof Error ? error.message : String(error)}`
		});
	}
}
/** Parse a bounded in-memory PPTD v2 project into a renderer-independent AST. */
function parsePptdProject(source) {
	const issues = [];
	const manifest = parseYaml(source.manifest, source.entryName, issues) ?? {};
	if (manifest.version !== "v2") issues.push({
		code: "version",
		severity: "error",
		file: source.entryName,
		message: "PPTD version 必须为 v2。"
	});
	const size = tuple(manifest.size, 2);
	const pageWidth = size?.[0];
	const pageHeight = size?.[1];
	if (pageWidth === void 0 || pageHeight === void 0 || pageWidth <= 0 || pageHeight <= 0) issues.push({
		code: "page-size",
		severity: "error",
		file: source.entryName,
		message: "PPTD size 必须是两个正数。"
	});
	const pageRefs = Array.isArray(manifest.pages) ? manifest.pages : [];
	if (!Array.isArray(manifest.pages) || pageRefs.length === 0 || pageRefs.length > MAX_PAGES) issues.push({
		code: "pages",
		severity: "error",
		file: source.entryName,
		message: `PPTD pages 必须包含 1 到 ${MAX_PAGES} 个页面路径。`
	});
	const pages = [];
	const seen = /* @__PURE__ */ new Set();
	for (const [index, rawRef] of pageRefs.slice(0, MAX_PAGES).entries()) {
		const ref = typeof rawRef === "string" ? safeProjectPath(rawRef) : void 0;
		if (ref === void 0 || !ref.endsWith(".page")) {
			issues.push({
				code: "page-path",
				severity: "error",
				page: index + 1,
				message: `第 ${index + 1} 个页面路径无效。`
			});
			continue;
		}
		if (seen.has(ref)) {
			issues.push({
				code: "duplicate-page",
				severity: "error",
				file: ref,
				page: index + 1,
				message: `页面 ${ref} 被重复引用。`
			});
			continue;
		}
		seen.add(ref);
		const content = source.pages.get(ref);
		if (content === void 0) {
			issues.push({
				code: "missing-page",
				severity: "error",
				file: ref,
				page: index + 1,
				message: `找不到页面文件 ${ref}。`
			});
			continue;
		}
		const parsed = parseYaml(content, ref, issues);
		if (parsed === void 0) continue;
		const elements = Array.isArray(parsed.elements) ? parsed.elements.map(record).filter((item) => item !== void 0) : [];
		if (!Array.isArray(parsed.elements) || elements.length > MAX_ELEMENTS_PER_PAGE) issues.push({
			code: "elements",
			severity: "error",
			file: ref,
			page: index + 1,
			message: `页面 elements 必须是数组且不超过 ${MAX_ELEMENTS_PER_PAGE} 个元素。`
		});
		const background = record(parsed.background);
		pages.push({
			file: ref,
			...typeof parsed.pageType === "string" ? { pageType: parsed.pageType } : {},
			...background === void 0 ? {} : { background },
			notes: typeof parsed.notes === "string" ? parsed.notes : "",
			elements: elements.slice(0, MAX_ELEMENTS_PER_PAGE)
		});
	}
	return {
		source,
		title: typeof manifest.title === "string" ? manifest.title : path.basename(source.entryName, ".pptd"),
		width: pageWidth ?? 960,
		height: pageHeight ?? 540,
		theme: record(manifest.theme) ?? {},
		pages,
		parseIssues: issues
	};
}
function projectDigest(project) {
	const hash = createHash("sha256").update(project.source.manifest);
	for (const page of project.pages) hash.update(page.file).update(project.source.pages.get(page.file) ?? "");
	for (const asset of [...project.source.assets.values()].sort((left, right) => left.path.localeCompare(right.path))) hash.update(asset.path).update(asset.sha256);
	return hash.digest("hex");
}
function themeMap(project, key) {
	return record(project.theme[key]) ?? {};
}
function resolveThemeReference(value, map) {
	if (typeof value !== "string" || !value.startsWith("$")) return value;
	return map[value.slice(1)];
}
function resolveColorValue(project, value, fallback = "#000000") {
	let current = value;
	const colors = themeMap(project, "colors");
	for (let depth = 0; depth < 8 && typeof current === "string" && current.startsWith("$"); depth += 1) current = colors[current.slice(1)];
	return typeof current === "string" && /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/iu.test(current) ? current : fallback;
}
function colorOptions(project, value, opacity = 1) {
	const resolved = resolveColorValue(project, value);
	const alpha = resolved.length === 9 ? Number.parseInt(resolved.slice(7, 9), 16) / 255 : 1;
	const transparency = Math.round((1 - Math.max(0, Math.min(1, alpha * opacity))) * 100);
	return {
		color: resolved.slice(1, 7).toUpperCase(),
		...transparency === 0 ? {} : { transparency }
	};
}
function readableForeground(background) {
	const red = Number.parseInt(background.slice(0, 2), 16) / 255;
	const green = Number.parseInt(background.slice(2, 4), 16) / 255;
	const blue = Number.parseInt(background.slice(4, 6), 16) / 255;
	return red * .2126 + green * .7152 + blue * .0722 < .5 ? "E2E8F0" : "1F2937";
}
function textStyle(project, content) {
	return {
		...record(resolveThemeReference(content.style, themeMap(project, "textStyles"))) ?? {},
		...content
	};
}
function plainText(value) {
	return value.replace(/<br\s*\/?\s*>/giu, "\n").replace(/<\/p\s*>/giu, "\n").replace(/<li(?:\s[^>]*)?>/giu, "• ").replace(/<\/li\s*>/giu, "\n").replace(/<[^>]+>/gu, "").replace(/&lt;/gu, "<").replace(/&gt;/gu, ">").replace(/&amp;/gu, "&").replace(/&quot;/gu, "\"").replace(/\n{3,}/gu, "\n\n").trimEnd();
}
function textCapacityIssue(project, element) {
	const bounds = tuple(element.bounds, 4);
	const content = record(element.content);
	if (bounds === void 0 || content === void 0 || typeof content.text !== "string") return false;
	const style = textStyle(project, content);
	const fontSize = number(style.fontSize) ?? 18;
	const lineHeight = number(style.lineHeight) ?? 1.15;
	const lines = plainText(content.text).split("\n");
	const boxWidth = bounds[2] ?? 0;
	const boxHeight = bounds[3] ?? 0;
	return lines.reduce((sum, line) => {
		const units = Array.from(line).reduce((count, char) => count + (/^[\u0000-\u00ff]$/u.test(char) ? .55 : 1), 0);
		return sum + Math.max(1, Math.ceil(units / Math.max(1, boxWidth / (fontSize * .95))));
	}, 0) * fontSize * lineHeight > boxHeight * 1.08;
}
function localAssetPath(value) {
	if (typeof value !== "string" || /^https?:\/\//iu.test(value)) return void 0;
	return safeProjectPath(value);
}
function elementContext(page, element) {
	return {
		page,
		...typeof element.elementId === "string" ? { elementId: element.elementId } : {}
	};
}
function checkElement(project, page, pageNumber, element, ids) {
	const issues = [];
	const context = elementContext(pageNumber, element);
	const id = string(element.elementId);
	if (id === void 0 || id.trim() === "") issues.push({
		code: "element-id",
		severity: "error",
		file: page.file,
		...context,
		message: "元素缺少 elementId。"
	});
	else if (ids.has(id)) issues.push({
		code: "duplicate-id",
		severity: "error",
		file: page.file,
		...context,
		message: `元素 ID ${id} 重复。`
	});
	else ids.add(id);
	const bounds = tuple(element.bounds, 4);
	const [x = 0, y = 0, width = -1, height = -1] = bounds ?? [];
	if (bounds === void 0 || width < 0 || height < 0) issues.push({
		code: "bounds",
		severity: "error",
		file: page.file,
		...context,
		message: "元素 bounds 必须是 [x, y, width, height]。"
	});
	else if (x < 0 || y < 0 || x + width > project.width + .01 || y + height > project.height + .01) issues.push({
		code: "out-of-bounds",
		severity: "error",
		file: page.file,
		...context,
		message: "元素超出 PPTD 页面边界。"
	});
	const type = string(element.elementType);
	if (![
		"text",
		"shape",
		"line",
		"image",
		"icon",
		"table",
		"chart"
	].includes(type ?? "")) {
		issues.push({
			code: "element-type",
			severity: "error",
			file: page.file,
			...context,
			message: `不支持的 elementType：${type ?? "missing"}。`
		});
		return issues;
	}
	if (type === "text") {
		const content = record(element.content);
		if (content === void 0 || typeof content.text !== "string") issues.push({
			code: "text-content",
			severity: "error",
			file: page.file,
			...context,
			message: "文本元素需要 content.text。"
		});
		else if (textCapacityIssue(project, element)) issues.push({
			code: "text-overflow",
			severity: "warning",
			file: page.file,
			...context,
			message: "文本可能超出当前文本框，建议检查渲染结果。"
		});
	}
	if (type === "shape" && typeof element.shapeName !== "string") issues.push({
		code: "shape-name",
		severity: "error",
		file: page.file,
		...context,
		message: "形状元素需要 shapeName。"
	});
	if (type === "line" && (tuple(element.viewBox, 2) === void 0 || typeof element.points !== "string")) issues.push({
		code: "line-path",
		severity: "error",
		file: page.file,
		...context,
		message: "线条元素需要 viewBox 和 points。"
	});
	if (type === "image") if (typeof element.src !== "string") issues.push({
		code: "image-src",
		severity: "error",
		file: page.file,
		...context,
		message: "图片元素需要 src。"
	});
	else if (/^https?:\/\//iu.test(element.src)) issues.push({
		code: "remote-image",
		severity: "error",
		file: page.file,
		...context,
		message: "本地 PPTD 渲染器不访问网络图片，请先将图片放入项目目录。"
	});
	else {
		const assetPath = localAssetPath(element.src);
		if (assetPath === void 0 || !project.source.assets.has(assetPath)) issues.push({
			code: "missing-asset",
			severity: "error",
			file: page.file,
			...context,
			message: `找不到图片资源 ${element.src}。`
		});
	}
	if (type === "table") {
		const rows = Array.isArray(element.rows) ? element.rows : [];
		const width = Array.isArray(rows[0]) ? rows[0].length : 0;
		if (rows.length === 0 || width === 0 || rows.some((row) => !Array.isArray(row) || row.length !== width)) issues.push({
			code: "table-data",
			severity: "error",
			file: page.file,
			...context,
			message: "表格 rows 必须是列数一致的二维数组。"
		});
	}
	if (type === "chart") {
		const data = record(element.data);
		const cols = Array.isArray(data?.cols) ? data.cols : [];
		const rows = Array.isArray(data?.rows) ? data.rows : [];
		const series = Array.isArray(element.series) ? element.series.map(record).filter((item) => item !== void 0) : [];
		const validRows = rows.every((row) => Array.isArray(row) && row.length === cols.length);
		const validSeries = series.length > 0 && series.every((item) => {
			const encode = record(item.encode);
			const refs = encode === void 0 ? [] : Object.values(encode).filter((value) => typeof value === "string");
			return typeof item.type === "string" && refs.length >= 2 && refs.every((ref) => cols.includes(ref));
		});
		if (cols.length < 2 || rows.length === 0 || !validRows || !validSeries) issues.push({
			code: "chart-data",
			severity: "error",
			file: page.file,
			...context,
			message: "图表 data/series/encode 结构不完整。"
		});
	}
	if (type === "icon") issues.push({
		code: "icon-fallback",
		severity: "warning",
		file: page.file,
		...context,
		message: "图标将以可编辑文本符号回退渲染。"
	});
	return issues;
}
/** Check a parsed PPTD project without writing files or executing external code. */
function checkPptdProject(project) {
	const issues = [...project.parseIssues];
	for (const [index, page] of project.pages.entries()) {
		const ids = /* @__PURE__ */ new Set();
		for (const element of page.elements) issues.push(...checkElement(project, page, index + 1, element, ids));
	}
	const errorCount = issues.filter((item) => item.severity === "error").length;
	const warningCount = issues.filter((item) => item.severity === "warning").length;
	return {
		status: errorCount > 0 ? "fail" : warningCount > 0 ? "warning" : "pass",
		digest: projectDigest(project),
		pageCount: project.pages.length,
		nativeObjectCount: project.pages.reduce((sum, page) => sum + page.elements.length, 0),
		warningCount,
		errorCount,
		issues
	};
}
function inches(value) {
	return value / POINTS_PER_INCH;
}
function frame(element) {
	const [x = 0, y = 0, width = 0, height = 0] = tuple(element.bounds, 4) ?? [
		0,
		0,
		0,
		0
	];
	return {
		x: inches(x),
		y: inches(y),
		w: inches(width),
		h: inches(height)
	};
}
function fontFace(value, fallback = "Arial") {
	if (typeof value === "string") return value;
	const font = record(value);
	return string(font?.ea) ?? string(font?.latin) ?? fallback;
}
function inlineStyle(project, raw) {
	const options = {};
	for (const declaration of raw?.split(";") ?? []) {
		const [name, ...rest] = declaration.split(":");
		const value = rest.join(":").trim();
		if (name?.trim() === "color") options.color = colorOptions(project, value).color;
		if (name?.trim() === "font-size" && /^\d+(?:\.\d+)?px$/u.test(value)) options.fontSize = Number.parseFloat(value);
		if (name?.trim() === "font-weight" && (value === "bold" || Number(value) >= 600)) options.bold = true;
		if (name?.trim() === "font-style" && value === "italic") options.italic = true;
	}
	return options;
}
function richRuns(project, value) {
	const runs = [];
	const stack = [{
		tag: "root",
		options: {}
	}];
	const currentOptions = () => stack.at(-1)?.options ?? {};
	for (const token of value.split(/(<[^>]+>)/gu)) {
		if (token === "") continue;
		if (!token.startsWith("<")) {
			const decoded = plainText(token);
			if (decoded !== "") runs.push({
				text: decoded,
				options: { ...currentOptions() }
			});
			continue;
		}
		const closing = /^<\/([a-z0-9]+)/iu.exec(token);
		if (closing !== null) {
			const tag = closing[1]?.toLowerCase();
			if (tag === void 0) continue;
			if (tag === "p" || tag === "li") runs.push({
				text: "\n",
				options: { ...currentOptions() }
			});
			while (stack.length > 1) if (stack.pop()?.tag === tag) break;
			continue;
		}
		const opening = /^<([a-z0-9]+)/iu.exec(token);
		if (opening === null) continue;
		const tag = opening[1]?.toLowerCase();
		if (tag === void 0) continue;
		if (tag === "br") {
			runs.push({
				text: "\n",
				options: { ...currentOptions() }
			});
			continue;
		}
		if (tag === "li") runs.push({
			text: "• ",
			options: { ...currentOptions() }
		});
		const style = /\sstyle=(?:"([^"]*)"|'([^']*)')/iu.exec(token);
		const options = {
			...currentOptions(),
			...inlineStyle(project, style?.[1] ?? style?.[2])
		};
		if (tag === "strong") options.bold = true;
		if (tag === "em") options.italic = true;
		stack.push({
			tag,
			options
		});
	}
	while (runs.at(-1)?.text === "\n") runs.pop();
	return runs;
}
function dash(value) {
	return value === "dash" || value === "dot" ? value : "solid";
}
function border(project, value) {
	const config = record(value);
	if (config === void 0) return void 0;
	const style = dash(config.style);
	return {
		color: colorOptions(project, config.color).color,
		width: number(config.width) ?? 1,
		...style === "solid" ? {} : { dash: style }
	};
}
function horizontalAlign(value, fallback) {
	return value === "center" || value === "right" || value === "justify" ? value : fallback;
}
function verticalAlign(value, fallback) {
	return value === "middle" || value === "bottom" ? value : fallback;
}
function renderText(project, slide, element) {
	const content = record(element.content) ?? {};
	const style = textStyle(project, content);
	const align = Array.isArray(style.align) ? style.align : [];
	const raw = string(content.text) ?? "";
	const runs = /<[^>]+>/u.test(raw) ? richRuns(project, raw) : raw;
	const textColor = colorOptions(project, style.color).color;
	const objectName = string(element.elementId);
	const charSpacing = number(style.letterSpacing);
	const horizontal = horizontalAlign(align[0], "left");
	const vertical = verticalAlign(align[1], "top");
	slide.addText(runs, {
		...frame(element),
		...objectName === void 0 ? {} : { objectName },
		fontFace: fontFace(style.fontFamily, "MiSans"),
		fontSize: number(style.fontSize) ?? 18,
		color: textColor,
		bold: boolean(style.bold) ?? false,
		italic: boolean(style.italic) ?? false,
		align: horizontal,
		valign: vertical,
		margin: 0,
		breakLine: false,
		fit: "shrink",
		rotate: number(element.rotation) ?? 0,
		transparency: Math.round((1 - (number(element.opacity) ?? 1)) * 100),
		...charSpacing === void 0 ? {} : { charSpacing }
	});
}
function solidFill(project, value, opacity = 1) {
	const fill = record(value);
	if (fill === void 0) return void 0;
	if (fill.type === "solid") return colorOptions(project, fill.color, opacity);
	if (fill.type === "gradient" && Array.isArray(fill.stops)) {
		const first = record(fill.stops[0]);
		return first === void 0 ? void 0 : colorOptions(project, first.color, opacity);
	}
}
function shapeType(pptx, value) {
	const name = typeof value === "string" ? value : "rect";
	return pptx.ShapeType[name] ?? pptx.ShapeType.rect;
}
function renderShape(project, pptx, slide, element) {
	const opacity = number(element.opacity) ?? 1;
	const fill = solidFill(project, element.fill, opacity);
	const line = border(project, element.border);
	const objectName = string(element.elementId);
	slide.addShape(shapeType(pptx, element.shapeName), {
		...frame(element),
		...objectName === void 0 ? {} : { objectName },
		rotate: number(element.rotation) ?? 0,
		...fill === void 0 ? { fill: {
			color: "FFFFFF",
			transparency: 100
		} } : { fill },
		line: line === void 0 ? {
			color: "FFFFFF",
			transparency: 100
		} : line
	});
}
function renderLine(project, pptx, slide, element) {
	const points = (string(element.points) ?? "").trim().split(/\s+/u).map((value) => value.split(",").map(Number));
	const reverse = points.length >= 2 && (points.at(-1)?.[0] ?? 0) < (points[0]?.[0] ?? 0);
	const line = border(project, element.border) ?? {
		color: "000000",
		width: 1
	};
	const arrow = Array.isArray(element.arrow) ? element.arrow : [];
	const objectName = string(element.elementId);
	slide.addShape(pptx.ShapeType.line, {
		...frame(element),
		...objectName === void 0 ? {} : { objectName },
		flipH: reverse,
		line: {
			...line,
			...arrow[0] === void 0 || arrow[0] === null ? {} : { beginArrowType: "arrow" },
			...arrow[1] === void 0 || arrow[1] === null ? {} : { endArrowType: "arrow" }
		}
	});
}
function renderImage(project, slide, element) {
	const assetPath = localAssetPath(element.src);
	const asset = assetPath === void 0 ? void 0 : project.source.assets.get(assetPath);
	if (asset === void 0) throw new Error(`PPTD image ${String(element.src)} is unavailable`);
	const objectName = string(element.elementId);
	slide.addImage({
		...frame(element),
		...objectName === void 0 ? {} : { objectName },
		data: `data:${asset.mediaType};base64,${Buffer.from(asset.bytes).toString("base64")}`,
		rotate: number(element.rotation) ?? 0
	});
}
function mergeCellStyle(project, table, row, column, rowCount, columnCount, cell) {
	const tableTheme = record(resolveThemeReference(table.style, themeMap(project, "tableStyles"))) ?? {};
	const baseline = record(tableTheme.cellStyle) ?? {};
	const bodyStyles = Array.isArray(tableTheme.bodyStyles) ? tableTheme.bodyStyles.map(record).filter((item) => item !== void 0) : [];
	const body = row > 0 && row < rowCount - 1 && bodyStyles.length > 0 ? bodyStyles[(row - 1) % bodyStyles.length] ?? {} : {};
	const rowStyle = row === 0 ? record(tableTheme.firstRowStyle) ?? {} : row === rowCount - 1 ? record(tableTheme.lastRowStyle) ?? {} : body;
	const columnStyle = column === 0 ? record(tableTheme.firstColumnStyle) ?? {} : column === columnCount - 1 ? record(tableTheme.lastColumnStyle) ?? {} : {};
	return boolean(tableTheme.rowOverColumn) === false ? {
		...baseline,
		...rowStyle,
		...columnStyle,
		...cell
	} : {
		...baseline,
		...columnStyle,
		...rowStyle,
		...cell
	};
}
function tableBorder(project, value) {
	const none = {
		color: "FFFFFF",
		pt: 0
	};
	const one = (item) => {
		const parsed = border(project, item);
		return parsed === void 0 ? none : {
			color: parsed.color,
			pt: parsed.width,
			...parsed.dash === void 0 ? {} : { dash: parsed.dash }
		};
	};
	if (value === null) return [
		none,
		none,
		none,
		none
	];
	if (Array.isArray(value)) {
		if (value.length === 2) return [
			one(value[0]),
			one(value[1]),
			one(value[0]),
			one(value[1])
		];
		if (value.length === 4) return [
			one(value[0]),
			one(value[1]),
			one(value[2]),
			one(value[3])
		];
	}
	return record(value) === void 0 ? void 0 : one(value);
}
function renderTable(project, slide, element) {
	const rows = element.rows;
	const rowCount = rows.length;
	const columnCount = rows[0]?.length ?? 0;
	const tableRows = rows.map((row, rowIndex) => row.map((rawCell, columnIndex) => {
		const cell = record(rawCell) ?? { text: typeof rawCell === "string" || typeof rawCell === "number" ? String(rawCell) : "" };
		const style = {
			...record(resolveThemeReference(cell.textStyle, themeMap(project, "textStyles"))) ?? {},
			...mergeCellStyle(project, element, rowIndex, columnIndex, rowCount, columnCount, cell)
		};
		const align = Array.isArray(style.align) ? style.align : [];
		const horizontal = horizontalAlign(align[0], "center");
		const vertical = verticalAlign(align[1], "middle");
		const fill = solidFill(project, style.fill);
		const cellBorder = tableBorder(project, style.border);
		const options = {
			fontFace: fontFace(style.fontFamily, "MiSans"),
			fontSize: number(style.fontSize) ?? 10,
			color: colorOptions(project, style.color).color,
			bold: boolean(style.bold) ?? false,
			italic: boolean(style.italic) ?? false,
			align: horizontal,
			valign: vertical,
			margin: .03,
			...fill === void 0 ? {} : { fill },
			...cellBorder === void 0 ? {} : { border: cellBorder }
		};
		return {
			text: plainText(string(cell.text) ?? ""),
			options
		};
	}));
	const bounds = frame(element);
	const colRatios = Array.isArray(element.columnWidths) ? element.columnWidths.map(number).filter((item) => item !== void 0) : [];
	const rowRatios = Array.isArray(element.rowHeights) ? element.rowHeights.map(number).filter((item) => item !== void 0) : [];
	const colW = colRatios.length === columnCount ? colRatios.map((value) => value * bounds.w) : void 0;
	const rowH = rowRatios.length === rowCount ? rowRatios.map((value) => value * bounds.h) : void 0;
	const objectName = string(element.elementId);
	slide.addTable(tableRows, {
		...bounds,
		...objectName === void 0 ? {} : { objectName },
		autoPage: false,
		...colW === void 0 ? {} : { colW },
		...rowH === void 0 ? {} : { rowH },
		border: {
			color: "FFFFFF",
			pt: 0
		},
		margin: 0
	});
}
function legendPosition(value) {
	return {
		bottom: "b",
		left: "l",
		right: "r",
		top: "t",
		topRight: "tr"
	}[string(value) ?? ""] ?? "r";
}
function chartAxisOptions(project, element) {
	const xAxis = Array.isArray(element.xAxis) ? record(element.xAxis[0]) ?? {} : record(element.xAxis) ?? {};
	const yAxis = (Array.isArray(element.yAxis) ? element.yAxis.map(record).filter((item) => item !== void 0) : [record(element.yAxis) ?? {}])[0] ?? {};
	const xLabel = record(xAxis.label) ?? {};
	const yLabel = record(yAxis.label) ?? {};
	const yGrid = record(yAxis.gridLine);
	return {
		...number(xAxis.min) === void 0 ? {} : { catAxisMinVal: number(xAxis.min) },
		...number(xAxis.max) === void 0 ? {} : { catAxisMaxVal: number(xAxis.max) },
		...number(yAxis.min) === void 0 ? {} : { valAxisMinVal: number(yAxis.min) },
		...number(yAxis.max) === void 0 ? {} : { valAxisMaxVal: number(yAxis.max) },
		...number(xLabel.fontSize) === void 0 ? {} : { catAxisLabelFontSize: number(xLabel.fontSize) },
		...number(yLabel.fontSize) === void 0 ? {} : { valAxisLabelFontSize: number(yLabel.fontSize) },
		...number(xLabel.rotate) === void 0 ? {} : { catAxisLabelRotate: number(xLabel.rotate) },
		...string(yAxis.title) === void 0 ? {} : {
			showValAxisTitle: true,
			valAxisTitle: string(yAxis.title)
		},
		...xAxis.gridLine === false ? { catGridLine: { style: "none" } } : {},
		...yAxis.gridLine === false ? { valGridLine: { style: "none" } } : yGrid === void 0 ? {} : { valGridLine: {
			color: colorOptions(project, yGrid.color, 1).color,
			style: dash(yGrid.style)
		} }
	};
}
function renderChart(project, pptx, slide, element, foregroundColor) {
	const data = record(element.data) ?? {};
	const columns = (Array.isArray(data.cols) ? data.cols : []).map((value) => String(value));
	const rows = Array.isArray(data.rows) ? data.rows : [];
	const columnIsNumeric = (column) => {
		if (column === void 0) return false;
		const columnIndex = columns.indexOf(column);
		if (columnIndex < 0) return false;
		const values = rows.map((row) => row[columnIndex]).filter((value) => value !== void 0 && value !== null && value !== "");
		return values.length > 0 && values.every((value) => {
			if (typeof value === "number") return Number.isFinite(value);
			return typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value));
		});
	};
	const series = (Array.isArray(element.series) ? element.series : []).map(record).filter((item) => item !== void 0);
	const types = [];
	const mergeableGroups = /* @__PURE__ */ new Map();
	for (const [index, item] of series.entries()) {
		const encode = record(item.encode) ?? {};
		const chartTypeName = string(item.type) ?? "bar";
		const xColumn = string(encode.x);
		const yColumn = string(encode.y);
		const horizontal = chartTypeName === "bar" && columnIsNumeric(xColumn) && !columnIsNumeric(yColumn);
		const categoryColumn = string(chartTypeName === "pie" ? encode.category : horizontal ? encode.y : encode.x) ?? columns[0] ?? "category";
		const valueColumn = string(chartTypeName === "pie" ? encode.value : horizontal ? encode.x : encode.y) ?? columns[1] ?? "value";
		const categoryIndex = columns.indexOf(categoryColumn);
		const valueIndex = columns.indexOf(valueColumn);
		const labels = rows.map((row) => {
			const value = row[categoryIndex];
			return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : "";
		});
		const values = rows.map((row) => Number(row[valueIndex] ?? 0));
		const type = chartTypeName === "line" ? pptx.ChartType.line : chartTypeName === "pie" && (number(item.innerRadius) ?? 0) > 0 ? pptx.ChartType.doughnut : chartTypeName === "pie" ? pptx.ChartType.pie : pptx.ChartType.bar;
		const fill = chartTypeName === "line" ? item.lineColor : item.fill;
		const chartColors = (Array.isArray(fill) ? fill : [fill]).map((value) => colorOptions(project, value, 1).color);
		const labelsConfig = record(item.dataLabels);
		const showLabels = boolean(labelsConfig?.show) === true;
		const showPercent = labelsConfig?.content === "percentage";
		const dataLabelFontSize = number(labelsConfig?.fontSize);
		const dataLabelColor = labelsConfig?.color === void 0 ? foregroundColor : colorOptions(project, labelsConfig.color).color;
		const groupOptions = {
			...horizontal ? { barDir: "bar" } : chartTypeName === "bar" ? { barDir: "col" } : {},
			...number(item.yAxisIndex) === 1 ? { secondaryValAxis: true } : {},
			...showLabels && !showPercent ? { showValue: true } : {},
			...showLabels && showPercent ? { showPercent: true } : {},
			dataLabelColor,
			...dataLabelFontSize === void 0 ? {} : {
				dataLabelFontSize,
				dataLabelPosition: "outEnd"
			},
			...chartTypeName === "line" ? {
				lineSize: number(item.width) ?? 2,
				lineDataSymbol: "circle"
			} : {},
			...type === pptx.ChartType.doughnut ? { holeSize: Math.round((number(item.innerRadius) ?? .5) * 100) } : {}
		};
		const dataSeries = {
			name: string(item.name) ?? `Series ${index + 1}`,
			labels,
			values
		};
		const mergeable = type !== pptx.ChartType.pie && type !== pptx.ChartType.doughnut;
		const groupKey = `${type}:${JSON.stringify(groupOptions)}`;
		const existing = mergeable ? mergeableGroups.get(groupKey) : void 0;
		if (existing === void 0) {
			const chartGroup = {
				type,
				data: [dataSeries],
				options: {
					...groupOptions,
					chartColors
				}
			};
			types.push(chartGroup);
			if (mergeable) mergeableGroups.set(groupKey, chartGroup);
			continue;
		}
		existing.data.push(dataSeries);
		existing.options.chartColors = [...existing.options.chartColors ?? [], ...chartColors];
	}
	const legend = typeof element.legend === "boolean" ? { show: element.legend } : record(element.legend) ?? {};
	const font = fontFace(element.fontFamily, "MiSans");
	const objectName = string(element.elementId);
	const common = {
		...frame(element),
		...objectName === void 0 ? {} : { objectName },
		showLegend: boolean(legend.show) ?? false,
		legendPos: legendPosition(legend.position),
		legendFontFace: font,
		legendColor: foregroundColor,
		catAxisLabelFontFace: font,
		catAxisLabelColor: foregroundColor,
		catAxisLineColor: foregroundColor,
		valAxisLabelFontFace: font,
		valAxisLabelColor: foregroundColor,
		valAxisLineColor: foregroundColor,
		showTitle: false,
		showValue: false,
		showCatName: false,
		showSerName: false,
		chartArea: {
			border: {
				color: "FFFFFF",
				transparency: 100
			},
			fill: {
				color: "FFFFFF",
				transparency: 100
			}
		},
		plotArea: {
			border: {
				color: "FFFFFF",
				transparency: 100
			},
			fill: {
				color: "FFFFFF",
				transparency: 100
			}
		},
		...chartAxisOptions(project, element)
	};
	slide.addChart(types, common);
}
function renderIcon(project, slide, element) {
	const color = colorOptions(project, element.color).color;
	const objectName = string(element.elementId);
	slide.addText(string(element.name) ?? "●", {
		...frame(element),
		...objectName === void 0 ? {} : { objectName },
		fontFace: "Arial",
		fontSize: 18,
		color,
		margin: 0,
		align: "center",
		valign: "middle",
		fit: "shrink"
	});
}
function renderElement(project, pptx, slide, element, foregroundColor) {
	if (element.elementType === "text") {
		renderText(project, slide, element);
		return;
	}
	if (element.elementType === "shape") {
		renderShape(project, pptx, slide, element);
		return;
	}
	if (element.elementType === "line") {
		renderLine(project, pptx, slide, element);
		return;
	}
	if (element.elementType === "image") {
		renderImage(project, slide, element);
		return;
	}
	if (element.elementType === "table") {
		renderTable(project, slide, element);
		return;
	}
	if (element.elementType === "chart") {
		renderChart(project, pptx, slide, element, foregroundColor);
		return;
	}
	if (element.elementType === "icon") {
		renderIcon(project, slide, element);
		return;
	}
}
/** Render one checked PPTD AST to editable native PowerPoint objects. */
async function renderPptdProject(project) {
	const check = checkPptdProject(project);
	if (check.status === "fail") throw new Error(`PPTD rendering requires a passing check; received ${check.errorCount} errors`);
	const pptx = new PptxGenJS();
	const layoutName = `DSH_PPTD_${project.width}x${project.height}`;
	pptx.defineLayout({
		name: layoutName,
		width: inches(project.width),
		height: inches(project.height)
	});
	pptx.layout = layoutName;
	pptx.author = "DSH PPTD";
	pptx.company = "DeepSeek Harness";
	pptx.subject = "Clean-room PPTD v2 editable rendering";
	pptx.title = project.title;
	const textStyles = themeMap(project, "textStyles");
	const titleStyle = record(textStyles.title) ?? {};
	const bodyStyle = record(textStyles.body) ?? {};
	pptx.theme = {
		headFontFace: fontFace(titleStyle.fontFamily, "MiSans"),
		bodyFontFace: fontFace(bodyStyle.fontFamily, "MiSans")
	};
	for (const page of project.pages) {
		const slide = pptx.addSlide();
		const background = solidFill(project, page.background);
		slide.background = background ?? { color: "FFFFFF" };
		const foregroundColor = readableForeground(background?.color ?? "FFFFFF");
		for (const element of page.elements) renderElement(project, pptx, slide, element, foregroundColor);
		if (page.notes.trim() !== "") slide.addNotes(page.notes);
	}
	const output = await pptx.write({
		outputType: "nodebuffer",
		compression: true
	});
	return {
		bytes: new Uint8Array(output),
		nativeObjectCount: check.nativeObjectCount,
		check
	};
}
function mediaType(file, bytes) {
	const extension = path.extname(file).toLowerCase();
	if (extension === ".png" && bytes[0] === 137 && bytes[1] === 80) return "image/png";
	if ((extension === ".jpg" || extension === ".jpeg") && bytes[0] === 255 && bytes[1] === 216) return "image/jpeg";
	if (extension === ".gif" && Buffer.from(bytes.subarray(0, 3)).toString("ascii") === "GIF") return "image/gif";
	if (extension === ".webp" && Buffer.from(bytes.subarray(8, 12)).toString("ascii") === "WEBP") return "image/webp";
	if (extension === ".svg" && Buffer.from(bytes.subarray(0, 512)).toString("utf8").includes("<svg")) return "image/svg+xml";
}
async function confinedFile(root, relative, maximumBytes) {
	const safe = safeProjectPath(relative);
	if (safe === void 0) throw new Error(`PPTD path is not project-relative: ${relative}`);
	const target = await realpath(path.join(root, ...safe.split("/")));
	if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error(`PPTD path escapes the project root: ${relative}`);
	const metadata = await lstat(target);
	if (!metadata.isFile() || metadata.size > maximumBytes) throw new Error(`PPTD file is invalid or too large: ${relative}`);
	return {
		real: target,
		bytes: await readFile(target)
	};
}
/** Load a confined local PPTD project. Network resources stay disabled. */
async function loadPptdProject(entryPath) {
	const entry = await realpath(path.resolve(entryPath));
	if (!entry.endsWith(".pptd")) throw new Error("PPTD entry must use the .pptd extension");
	const metadata = await lstat(entry);
	if (!metadata.isFile() || metadata.size > MAX_MANIFEST_BYTES) throw new Error("PPTD entry is invalid or too large");
	const root = path.dirname(entry);
	const manifest = await readFile(entry, "utf8");
	const raw = parseYaml(manifest, path.basename(entry), []);
	if (raw === void 0) return parsePptdProject({
		entryName: path.basename(entry),
		manifest,
		pages: /* @__PURE__ */ new Map(),
		assets: /* @__PURE__ */ new Map()
	});
	const refs = Array.isArray(raw.pages) ? raw.pages.slice(0, MAX_PAGES) : [];
	const pages = /* @__PURE__ */ new Map();
	for (const rawRef of refs) {
		const ref = typeof rawRef === "string" ? safeProjectPath(rawRef) : void 0;
		if (ref === void 0) continue;
		const file = await confinedFile(root, ref, MAX_PAGE_BYTES);
		pages.set(ref, Buffer.from(file.bytes).toString("utf8"));
	}
	const partial = parsePptdProject({
		entryName: path.basename(entry),
		manifest,
		pages,
		assets: /* @__PURE__ */ new Map()
	});
	const refsToLoad = /* @__PURE__ */ new Set();
	for (const page of partial.pages) for (const element of page.elements) if (element.elementType === "image") {
		const ref = localAssetPath(element.src);
		if (ref !== void 0) refsToLoad.add(ref);
	}
	const assets = /* @__PURE__ */ new Map();
	let totalBytes = 0;
	for (const ref of refsToLoad) {
		const file = await confinedFile(root, ref, MAX_ASSET_BYTES);
		totalBytes += file.bytes.byteLength;
		if (totalBytes > MAX_TOTAL_ASSET_BYTES) throw new Error("PPTD image resources exceed the aggregate byte limit");
		const type = mediaType(ref, file.bytes);
		if (type === void 0) throw new Error(`PPTD image type or bytes are unsupported: ${ref}`);
		assets.set(ref, {
			path: ref,
			mediaType: type,
			bytes: file.bytes,
			sha256: createHash("sha256").update(file.bytes).digest("hex")
		});
	}
	return parsePptdProject({
		entryName: path.basename(entry),
		manifest,
		pages,
		assets
	});
}
//#endregion
//#region lib/types/bin.js
/** Thin local CLI over the shared clean-room PPTD engine. */
function usage() {
	return [
		"Usage:",
		"  dsh-pptd check <deck.pptd> [--json]",
		"  dsh-pptd inspect <deck.pptd> [--json]",
		"  dsh-pptd render <deck.pptd> --output <deck.pptx> [--force] [--json]",
		"",
		"PPTD and every local resource must stay inside the project directory. Network images are disabled."
	].join("\n");
}
function parseArgs(argv) {
	const positional = [];
	let output;
	let json = false;
	let force = false;
	for (let index = 0; index < argv.length; index += 1) {
		const value = argv[index];
		if (value === void 0) continue;
		if (value === "--json") {
			json = true;
			continue;
		}
		if (value === "--force") {
			force = true;
			continue;
		}
		if (value === "--output" || value === "-o") {
			output = argv[index + 1];
			index += 1;
			continue;
		}
		positional.push(value);
	}
	return {
		...positional[0] === void 0 ? {} : { command: positional[0] },
		...positional[1] === void 0 ? {} : { input: positional[1] },
		...output === void 0 ? {} : { output },
		json,
		force
	};
}
function print(value, json) {
	if (json) {
		process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
		return;
	}
	if (typeof value === "string") process.stdout.write(`${value}\n`);
	else process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
async function writeOutput(target, bytes, force) {
	const resolved = path.resolve(target);
	await mkdir(path.dirname(resolved), { recursive: true });
	if (force) {
		await writeFile(resolved, bytes);
		return;
	}
	const handle = await open(resolved, "wx", 384);
	try {
		await handle.writeFile(bytes);
		await handle.sync();
	} finally {
		await handle.close();
	}
}
async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.command === void 0 || args.input === void 0 || args.command === "--help" || args.command === "-h") {
		print(usage(), false);
		process.exitCode = args.command === "--help" || args.command === "-h" ? 0 : 2;
		return;
	}
	if (![
		"check",
		"inspect",
		"render"
	].includes(args.command)) throw new Error(`Unknown command: ${args.command}\n${usage()}`);
	const project = await loadPptdProject(args.input);
	const checked = checkPptdProject(project);
	if (args.command === "check") {
		print(checked, args.json);
		process.exitCode = checked.status === "fail" ? 1 : 0;
		return;
	}
	if (args.command === "inspect") {
		const elementTypes = {};
		for (const page of project.pages) for (const element of page.elements) {
			const type = typeof element.elementType === "string" ? element.elementType : "unknown";
			elementTypes[type] = (elementTypes[type] ?? 0) + 1;
		}
		print({
			title: project.title,
			size: [project.width, project.height],
			elementTypes,
			check: checked
		}, args.json);
		process.exitCode = checked.status === "fail" ? 1 : 0;
		return;
	}
	if (args.output === void 0) throw new Error("render requires --output <deck.pptx>");
	const rendered = await renderPptdProject(project);
	await writeOutput(args.output, rendered.bytes, args.force);
	print({
		status: rendered.check.status,
		input: path.resolve(args.input),
		output: path.resolve(args.output),
		pageCount: rendered.check.pageCount,
		nativeObjectCount: rendered.nativeObjectCount,
		sizeBytes: rendered.bytes.byteLength,
		digest: rendered.check.digest,
		warnings: rendered.check.warningCount
	}, args.json);
}
main().catch((error) => {
	process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
	process.exitCode = 1;
});
//#endregion
export {};
