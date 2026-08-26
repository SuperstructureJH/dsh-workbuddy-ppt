import path from "node:path";
import { cp, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { unzipSync } from "fflate";
import process from "node:process";
//#region lib/types/runtime-staging.js
/** Safely stage operator-supplied WorkBuddy artifacts into the Office PPT plugin runtime root. */
function usage() {
	throw new Error([
		"Usage: node lib/stage-workbuddy-runtime.js",
		"  --destination <absolute office-ppt runtime root>",
		"  --slidep <absolute @tencent/slidep package root>",
		"  --editor-engine <absolute @tencent/tencent-docs-ai-engine package root>",
		"  --skill-zip <absolute tencent-pptx-skill.zip>"
	].join("\n"));
}
function parseArguments(argv) {
	const values = /* @__PURE__ */ new Map();
	for (let index = 0; index < argv.length; index += 2) {
		const key = argv[index];
		const value = argv[index + 1];
		if (key === void 0 || value === void 0 || !key.startsWith("--")) usage();
		values.set(key, value);
	}
	const destination = values.get("--destination");
	const slidep = values.get("--slidep");
	const editorEngine = values.get("--editor-engine");
	const skillZip = values.get("--skill-zip");
	if (destination === void 0 || slidep === void 0 || editorEngine === void 0 || skillZip === void 0) usage();
	for (const [name, value] of Object.entries({
		destination,
		slidep,
		editorEngine,
		skillZip
	})) if (!path.isAbsolute(value)) throw new Error(`${name} must be an absolute path`);
	return {
		destination,
		slidep,
		editorEngine,
		skillZip
	};
}
async function packageIdentity(root, expected) {
	const parsed = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
	if (parsed.name !== expected || typeof parsed.version !== "string") throw new Error(`${root} is not a valid ${expected} package`);
	return {
		name: parsed.name,
		version: parsed.version
	};
}
function safeArchivePath(name) {
	const normalized = name.replaceAll("\\", "/");
	if (normalized.startsWith("/") || normalized.split("/").some((segment) => segment === "..")) throw new Error(`skill archive entry escapes its root: ${name}`);
	return normalized;
}
async function extractSkill(zipPath, destination) {
	const archive = unzipSync(await readFile(zipPath));
	const files = Object.entries(archive);
	if (files.length > 128) throw new Error("Tencent PPT skill archive exceeds 128 entries");
	let expandedBytes = 0;
	for (const [rawName, bytes] of files) {
		const name = safeArchivePath(rawName);
		expandedBytes += bytes.byteLength;
		if (expandedBytes > 8 * 1024 * 1024) throw new Error("Tencent PPT skill archive exceeds 8 MiB expanded");
		if (name.endsWith("/")) continue;
		const target = path.join(destination, name);
		await mkdir(path.dirname(target), {
			recursive: true,
			mode: 448
		});
		await writeFile(target, bytes, { mode: 384 });
	}
	await stat(path.join(destination, "tencent-pptx", "SKILL.md"));
	await stat(path.join(destination, "tencent-pptx", "references", "create-from-scratch.md"));
	await stat(path.join(destination, "tencent-pptx", "references", "create-from-material.md"));
}
/**
* Stage one complete, platform-specific runtime and print a machine-readable receipt.
* @param argv - Command arguments containing absolute artifact and destination paths.
*/
async function stageWorkBuddyRuntime(argv) {
	const input = parseArguments(argv);
	if (path.parse(input.destination).root === path.resolve(input.destination)) throw new Error("destination must name a dedicated Office PPT runtime directory");
	const slidep = await packageIdentity(input.slidep, "@tencent/slidep");
	const engine = await packageIdentity(input.editorEngine, "@tencent/tencent-docs-ai-engine");
	const platform = `${process.platform}-${process.arch}`;
	const engineSource = path.join(input.editorEngine, "bin", platform);
	await stat(path.join(input.slidep, "dist", "slidep-start.js"));
	await stat(path.join(input.slidep, "dist", "slidep-validate.js"));
	await stat(path.join(input.slidep, "node_modules"));
	await stat(path.join(engineSource, process.platform === "win32" ? "editor_sdk.exe" : "editor_sdk"));
	await mkdir(path.dirname(input.destination), {
		recursive: true,
		mode: 448
	});
	const temporary = `${input.destination}.staging-${process.pid}`;
	const backup = `${input.destination}.backup-${process.pid}`;
	await rm(temporary, {
		recursive: true,
		force: true
	});
	await rm(backup, {
		recursive: true,
		force: true
	});
	await mkdir(temporary, {
		recursive: true,
		mode: 448
	});
	await cp(input.slidep, path.join(temporary, "slidep"), {
		recursive: true,
		force: false
	});
	await cp(engineSource, path.join(temporary, "tencent-docs-ai-engine", "bin", platform), {
		recursive: true,
		force: false,
		filter: (source) => path.basename(source) !== "editor_sdk.log"
	});
	await extractSkill(input.skillZip, path.join(temporary, "skills"));
	const zipBytes = await readFile(input.skillZip);
	const skillSha256 = createHash("sha256").update(zipBytes).digest("hex");
	await writeFile(path.join(temporary, "manifest.json"), `${JSON.stringify({
		schemaVersion: 1,
		platform,
		slidep,
		editorEngine: engine,
		skillSha256,
		stagedAt: (/* @__PURE__ */ new Date()).toISOString(),
		redistribution: "Runtime artifacts were supplied by the local operator and remain outside the source package."
	}, null, 2)}\n`, { mode: 384 });
	let replacing = false;
	try {
		await stat(input.destination);
		replacing = true;
	} catch (error) {
		if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
	}
	if (replacing) try {
		if (JSON.parse(await readFile(path.join(input.destination, "manifest.json"), "utf8")).schemaVersion !== 1) throw new Error("unsupported runtime manifest");
	} catch (error) {
		throw new Error(`destination exists without a plugin-owned runtime manifest: ${input.destination}`, { cause: error });
	}
	if (replacing) await rename(input.destination, backup);
	try {
		await rename(temporary, input.destination);
	} catch (error) {
		if (replacing) await rename(backup, input.destination);
		throw error;
	}
	if (replacing) await rm(backup, {
		recursive: true,
		force: true
	});
	process.stdout.write(`${JSON.stringify({
		ok: true,
		destination: input.destination,
		slidepVersion: slidep.version,
		editorEngineVersion: engine.version,
		skillSha256
	})}\n`);
}
//#endregion
export { stageWorkBuddyRuntime };
