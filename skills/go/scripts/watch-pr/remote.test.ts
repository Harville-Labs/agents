import { describe, expect, it } from "bun:test";
import { detectForge, parseRemote } from "./remote.ts";

describe("origin remote parsing", () => {
	it("reads GitHub ssh and https remotes", () => {
		for (const remote of [
			"git@github.com:owner/repo.git",
			"ssh://git@github.com/owner/repo.git",
			"https://github.com/owner/repo",
		])
			expect(parseRemote(remote)).toEqual({
				host: "github.com",
				owner: "owner",
				repo: "repo",
			});
	});

	it("keeps every GitLab namespace segment in the owner", () => {
		expect(parseRemote("git@gitlab.com:group/sub/project.git")).toEqual({
			host: "gitlab.com",
			owner: "group/sub",
			repo: "project",
		});
		expect(
			parseRemote("https://gitlab.example.test/group/sub/deeper/project.git"),
		).toEqual({
			host: "gitlab.example.test",
			owner: "group/sub/deeper",
			repo: "project",
		});
	});

	it("reads a self-hosted ssh remote on a custom port", () => {
		expect(
			parseRemote("ssh://git@gitlab.example.test:2222/group/project.git"),
		).toEqual({ host: "gitlab.example.test", owner: "group", repo: "project" });
	});

	it("rejects remotes without a namespace or with credentials", () => {
		expect(parseRemote("https://github.com/repo")).toBeNull();
		expect(parseRemote("https://token@gitlab.com/group/project")).toBeNull();
		expect(parseRemote("not a remote")).toBeNull();
	});

	it("rejects a nested path on github.com", () => {
		expect(parseRemote("https://github.com/owner/repo/extra")).toBeNull();
	});
});

describe("forge detection", () => {
	it("honors an explicit forge over the remote host", () => {
		expect(
			detectForge({ forge: "gitlab", hostname: "code.example.test", remote: null }),
		).toEqual({ kind: "gitlab", host: "code.example.test" });
	});

	it("detects GitLab from a gitlab remote host", () => {
		expect(
			detectForge({
				forge: null,
				hostname: null,
				remote: { host: "gitlab.example.test", owner: "g", repo: "p" },
			}),
		).toEqual({ kind: "gitlab", host: "gitlab.example.test" });
	});

	it("treats any host other than github.com as GitLab", () => {
		expect(
			detectForge({
				forge: null,
				hostname: null,
				remote: { host: "code.example.test", owner: "g", repo: "p" },
			}),
		).toEqual({ kind: "gitlab", host: "code.example.test" });
		expect(
			detectForge({ forge: null, hostname: "code.example.test", remote: null }),
		).toEqual({ kind: "gitlab", host: "code.example.test" });
	});

	it("defaults to github.com", () => {
		expect(detectForge({ forge: null, hostname: null, remote: null })).toEqual({
			kind: "github",
			host: "github.com",
		});
		expect(detectForge({ forge: "gitlab", hostname: null, remote: null })).toEqual(
			{ kind: "gitlab", host: "gitlab.com" },
		);
	});
});
