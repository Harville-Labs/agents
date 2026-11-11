import { WatcherQueryError } from "./errors.ts";
function raw(value: unknown): string {
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}
export function missing(path: string, value?: unknown): never {
	throw new WatcherQueryError({
		kind: "missing-key",
		retryable: true,
		detail:
			value === undefined
				? `missing ${path}`
				: `invalid ${path}: ${raw(value)}`,
		...(value === undefined ? {} : { rawValue: raw(value) }),
	});
}
function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function record(value: unknown, path: string): Record<string, unknown> {
	if (!isRecord(value)) missing(path, value);
	return value;
}
export function list(value: unknown, path: string): readonly unknown[] {
	if (!Array.isArray(value)) missing(path, value);
	return value;
}
export function at(value: unknown, path: readonly string[]): unknown {
	let current = value;
	for (const key of path) {
		const object = record(current, path.join("."));
		if (!(key in object)) missing(path.join("."));
		current = object[key];
	}
	return current;
}
export function string(value: unknown, path: string): string {
	if (typeof value !== "string") missing(path, value);
	return value;
}
export const optionalString = (value: unknown, path: string): string | null =>
	value === null ? null : string(value, path);
export function enumValue<const V extends readonly string[]>(
	value: unknown,
	values: V,
	path: string,
): V[number] {
	if (typeof value === "string")
		for (const candidate of values) if (candidate === value) return candidate;
	return missing(path, value);
}
export const nullableEnum = <const V extends readonly string[]>(
	value: unknown,
	values: V,
	path: string,
): V[number] | null => (value === null ? null : enumValue(value, values, path));
