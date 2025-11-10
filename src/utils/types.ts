import type { Duty } from "../schemas";

export type Paginated<T> = {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export type FetchState = {
	loading: boolean;
	error: string | null;
	data: Paginated<Duty> | null;
};

export type FetchAction =
	| { type: "LOAD_START" }
	| { type: "LOAD_SUCCESS"; payload: Paginated<Duty> }
	| { type: "LOAD_ERROR"; payload: string };
