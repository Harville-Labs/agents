import type * as T from "./types.ts";
export interface Remote extends T.Repository {
	readonly host: string;
}
export function parseRemote(value: string): Remote | null {
	let normalized = value.trim();
	const scp = /^[\w.-]+@([\w.-]+):(?!\/)(.+)$/.exec(normalized);
	if (scp !== null) normalized = `ssh://git@${scp[1]}/${scp[2]}`;
	try {
		const url = new URL(normalized);
		const parts = url.pathname
			.replace(/\.git$/, "")
			.split("/")
			.filter(Boolean);
		const ssh = url.protocol === "ssh:" && url.username === "git";
		if (
			!(ssh || (url.protocol === "https:" && !url.username && !url.port)) ||
			url.password ||
			url.search ||
			url.hash ||
			parts.length < 2 ||
			(url.hostname === "github.com" && parts.length !== 2)
		)
			return null;
		return {
			host: url.hostname,
			owner: parts.slice(0, -1).join("/"),
			repo: parts[parts.length - 1],
		};
	} catch {
		return null;
	}
}
export function detectForge(args: {
	readonly forge: T.ForgeKind | null;
	readonly hostname: string | null;
	readonly remote: Remote | null;
}): T.Forge {
	const remoteHost = args.remote?.host ?? null;
	const kind =
		args.forge ??
		(args.hostname !== null ||
		(remoteHost !== null && remoteHost !== "github.com")
			? "gitlab"
			: "github");
	if (kind === "github") return { kind, host: "github.com" };
	const fromRemote =
		remoteHost !== null && remoteHost !== "github.com" ? remoteHost : null;
	return { kind, host: args.hostname ?? fromRemote ?? "gitlab.com" };
}
