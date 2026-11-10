import type * as T from "./types.ts";
export class WatcherQueryError extends Error {
	readonly failure: T.QueryFailure;
	constructor(failure: T.QueryFailure) {
		super(failure.detail);
		this.name = "WatcherQueryError";
		this.failure = failure;
	}
}
export class ChecksUnavailable extends WatcherQueryError {
	constructor(detail: string) {
		super({ kind: "checks-unavailable", retryable: true, detail });
		this.name = "ChecksUnavailable";
	}
}
