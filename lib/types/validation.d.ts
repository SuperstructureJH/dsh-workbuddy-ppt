/** Persistent-state and loopback RPC validation. */
import { z } from 'zod';
import { OfficeSlideId, OfficeTemplateId, type OfficeCreateInput, type OfficePptSceneInput, type OfficePptState, type OfficeSlide, type OfficeTemplate, type OfficeTemplatePageZone, type OfficeUpdateSlideInput, type OfficeUploadInput, type OfficeWorkBuddyCreateInput } from './protocol.ts';
/** Strict persisted template schema. */
export declare const templateSchema: z.ZodPipe<z.ZodPreprocess<z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<OfficeTemplateId, string>>;
    name: z.ZodString;
    description: z.ZodString;
    origin: z.ZodEnum<{
        "built-in": "built-in";
        extracted: "extracted";
    }>;
    aspectRatio: z.ZodEnum<{
        wide: "wide";
        standard: "standard";
    }>;
    titleFontFace: z.ZodString;
    bodyFontFace: z.ZodString;
    palette: z.ZodObject<{
        background: z.ZodString;
        surface: z.ZodString;
        text: z.ZodString;
        muted: z.ZodString;
        accent: z.ZodString;
        secondary: z.ZodString;
    }, z.core.$strict>;
    previewTitle: z.ZodString;
    previewSubtitle: z.ZodString;
    source: z.ZodOptional<z.ZodObject<{
        fileName: z.ZodString;
        sha256: z.ZodString;
        slideCount: z.ZodNumber;
        averageTextBlocks: z.ZodNumber;
        averageCharacters: z.ZodNumber;
        visualGrammar: z.ZodEnum<{
            "blue-professional": "blue-professional";
            "editorial-forest": "editorial-forest";
            signal: "signal";
            "orange-data": "orange-data";
        }>;
        recommendedDensity: z.ZodEnum<{
            light: "light";
            balanced: "balanced";
            dense: "dense";
        }>;
        designSummary: z.ZodString;
        layoutPatterns: z.ZodArray<z.ZodObject<{
            family: z.ZodEnum<{
                data: "data";
                cover: "cover";
                statement: "statement";
                "single-column": "single-column";
                "two-column": "two-column";
                grid: "grid";
                "image-led": "image-led";
            }>;
            slideCount: z.ZodNumber;
            sampleSlideNumbers: z.ZodArray<z.ZodNumber>;
            titlePosition: z.ZodEnum<{
                left: "left";
                center: "center";
                right: "right";
                top: "top";
            }>;
            bodyColumns: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
            density: z.ZodEnum<{
                light: "light";
                balanced: "balanced";
                dense: "dense";
            }>;
            averageTextFrames: z.ZodNumber;
            averageMediaFrames: z.ZodNumber;
        }, z.core.$strict>>;
        pageReferences: z.ZodArray<z.ZodObject<{
            slideNumber: z.ZodNumber;
            sourceTitle: z.ZodString;
            family: z.ZodEnum<{
                data: "data";
                cover: "cover";
                statement: "statement";
                "single-column": "single-column";
                "two-column": "two-column";
                grid: "grid";
                "image-led": "image-led";
            }>;
            titlePosition: z.ZodEnum<{
                left: "left";
                center: "center";
                right: "right";
                top: "top";
            }>;
            bodyColumns: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
            density: z.ZodEnum<{
                light: "light";
                balanced: "balanced";
                dense: "dense";
            }>;
            features: z.ZodArray<z.ZodEnum<{
                image: "image";
                table: "table";
                chart: "chart";
                statement: "statement";
                timeline: "timeline";
                process: "process";
                comparison: "comparison";
                matrix: "matrix";
                kpi: "kpi";
            }>>;
            recommendedRoles: z.ZodArray<z.ZodEnum<{
                cover: "cover";
                timeline: "timeline";
                process: "process";
                comparison: "comparison";
                matrix: "matrix";
                agenda: "agenda";
                section: "section";
                overview: "overview";
                evidence: "evidence";
                closing: "closing";
            }>>;
            structureSummary: z.ZodString;
            zones: z.ZodArray<z.ZodPipe<z.ZodObject<{
                kind: z.ZodEnum<{
                    title: "title";
                    text: "text";
                    shape: "shape";
                    line: "line";
                    image: "image";
                    table: "table";
                    chart: "chart";
                }>;
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
                shape: z.ZodOptional<z.ZodEnum<{
                    line: "line";
                    rect: "rect";
                    ellipse: "ellipse";
                    roundRect: "roundRect";
                    other: "other";
                }>>;
                fill: z.ZodOptional<z.ZodString>;
                stroke: z.ZodOptional<z.ZodString>;
                textRole: z.ZodOptional<z.ZodEnum<{
                    title: "title";
                    text: "text";
                }>>;
                textColor: z.ZodOptional<z.ZodString>;
                backgroundFill: z.ZodOptional<z.ZodString>;
                fontFace: z.ZodOptional<z.ZodString>;
                fontSize: z.ZodOptional<z.ZodNumber>;
                fontWeight: z.ZodOptional<z.ZodEnum<{
                    bold: "bold";
                    normal: "normal";
                }>>;
                textAlign: z.ZodOptional<z.ZodEnum<{
                    left: "left";
                    center: "center";
                    right: "right";
                }>>;
            }, z.core.$strict>, z.ZodTransform<OfficeTemplatePageZone, {
                kind: "title" | "text" | "shape" | "line" | "image" | "table" | "chart";
                x: number;
                y: number;
                width: number;
                height: number;
                shape?: "line" | "rect" | "ellipse" | "roundRect" | "other" | undefined;
                fill?: string | undefined;
                stroke?: string | undefined;
                textRole?: "title" | "text" | undefined;
                textColor?: string | undefined;
                backgroundFill?: string | undefined;
                fontFace?: string | undefined;
                fontSize?: number | undefined;
                fontWeight?: "bold" | "normal" | undefined;
                textAlign?: "left" | "center" | "right" | undefined;
            }>>>;
            primaryVisual: z.ZodOptional<z.ZodObject<{
                kind: z.ZodEnum<{
                    shape: "shape";
                    image: "image";
                    table: "table";
                    chart: "chart";
                }>;
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
                areaRatio: z.ZodNumber;
            }, z.core.$strict>>;
            simplification: z.ZodOptional<z.ZodObject<{
                instruction: z.ZodString;
                minimumLayoutLandmarkRetention: z.ZodNumber;
            }, z.core.$strict>>;
            jsxReference: z.ZodString;
        }, z.core.$strict>>;
        extractedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>>, z.ZodTransform<OfficeTemplate, {
    id: OfficeTemplateId;
    name: string;
    description: string;
    origin: "built-in" | "extracted";
    aspectRatio: "wide" | "standard";
    titleFontFace: string;
    bodyFontFace: string;
    palette: {
        background: string;
        surface: string;
        text: string;
        muted: string;
        accent: string;
        secondary: string;
    };
    previewTitle: string;
    previewSubtitle: string;
    source?: {
        fileName: string;
        sha256: string;
        slideCount: number;
        averageTextBlocks: number;
        averageCharacters: number;
        visualGrammar: "blue-professional" | "editorial-forest" | "signal" | "orange-data";
        recommendedDensity: "light" | "balanced" | "dense";
        designSummary: string;
        layoutPatterns: {
            family: "data" | "cover" | "statement" | "single-column" | "two-column" | "grid" | "image-led";
            slideCount: number;
            sampleSlideNumbers: number[];
            titlePosition: "left" | "center" | "right" | "top";
            bodyColumns: 0 | 2 | 1 | 3;
            density: "light" | "balanced" | "dense";
            averageTextFrames: number;
            averageMediaFrames: number;
        }[];
        pageReferences: {
            slideNumber: number;
            sourceTitle: string;
            family: "data" | "cover" | "statement" | "single-column" | "two-column" | "grid" | "image-led";
            titlePosition: "left" | "center" | "right" | "top";
            bodyColumns: 0 | 2 | 1 | 3;
            density: "light" | "balanced" | "dense";
            features: ("image" | "table" | "chart" | "statement" | "timeline" | "process" | "comparison" | "matrix" | "kpi")[];
            recommendedRoles: ("cover" | "timeline" | "process" | "comparison" | "matrix" | "agenda" | "section" | "overview" | "evidence" | "closing")[];
            structureSummary: string;
            zones: OfficeTemplatePageZone[];
            jsxReference: string;
            primaryVisual?: {
                kind: "shape" | "image" | "table" | "chart";
                x: number;
                y: number;
                width: number;
                height: number;
                areaRatio: number;
            } | undefined;
            simplification?: {
                instruction: string;
                minimumLayoutLandmarkRetention: number;
            } | undefined;
        }[];
        extractedAt: string;
    } | undefined;
}>>;
/** Strict declarative scene accepted by the independent PPT checker and compiler. */
export declare const pptSceneInputSchema: z.ZodType<OfficePptSceneInput>;
/** Strict persisted slide schema with a legacy-layout migration. */
export declare const slideSchema: z.ZodPipe<z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<OfficeSlideId, string>>;
    role: z.ZodOptional<z.ZodEnum<{
        cover: "cover";
        timeline: "timeline";
        process: "process";
        comparison: "comparison";
        matrix: "matrix";
        agenda: "agenda";
        section: "section";
        overview: "overview";
        evidence: "evidence";
        closing: "closing";
    }>>;
    layout: z.ZodUnion<readonly [z.ZodEnum<{
        "cover.hero": "cover.hero";
        "agenda.simple": "agenda.simple";
        "section.statement": "section.statement";
        "overview.kpi": "overview.kpi";
        "data.chart-insight": "data.chart-insight";
        "history.timeline": "history.timeline";
        "product.matrix": "product.matrix";
        "comparison.two-column": "comparison.two-column";
        "process.steps": "process.steps";
        "closing.summary": "closing.summary";
    }>, z.ZodEnum<{
        content: "content";
        cover: "cover";
        section: "section";
    }>]>;
    title: z.ZodString;
    bullets: z.ZodArray<z.ZodString>;
    notes: z.ZodString;
    sourceRefs: z.ZodArray<z.ZodString>;
}, z.core.$strict>, z.ZodTransform<OfficeSlide, {
    id: OfficeSlideId;
    layout: "content" | "cover" | "section" | "cover.hero" | "agenda.simple" | "section.statement" | "overview.kpi" | "data.chart-insight" | "history.timeline" | "product.matrix" | "comparison.two-column" | "process.steps" | "closing.summary";
    title: string;
    bullets: string[];
    notes: string;
    sourceRefs: string[];
    role?: "cover" | "timeline" | "process" | "comparison" | "matrix" | "agenda" | "section" | "overview" | "evidence" | "closing" | undefined;
}>>;
/** Strict session-state schema. */
export declare const stateSchema: z.ZodType<OfficePptState>;
/** Strict first-revision input schema. */
export declare const createInputSchema: z.ZodType<OfficeCreateInput>;
/** Strict WorkBuddy project input before runtime-specific byte ceilings and static-JSX checks. */
export declare const workbuddyCreateInputSchema: z.ZodType<OfficeWorkBuddyCreateInput>;
/** Strict focused-edit input schema. */
export declare const updateSlideInputSchema: z.ZodType<OfficeUpdateSlideInput>;
/** Strict browser-upload schema. */
export declare const uploadInputSchema: z.ZodType<OfficeUploadInput>;
/**
 * Decode strict base64 and reject partial or non-canonical input.
 * @param value - Canonical base64 text.
 * @returns Decoded bytes.
 */
export declare function decodeBase64(value: string): Uint8Array;
//# sourceMappingURL=validation.d.ts.map