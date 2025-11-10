import type { FetchState, FetchAction } from "../utils";

export const initialFetchState: FetchState = {
	loading: false,
	error: null,
	data: null
};

export function dutyReducer(state: FetchState, action: FetchAction): FetchState {
	switch (action.type) {
		case "LOAD_START":
			return { ...state, loading: true, error: null };
		case "LOAD_SUCCESS":
			return { ...state, loading: false, data: action.payload, error: null };
		case "LOAD_ERROR":
			return { ...state, loading: false, error: action.payload };
		default:
			return state;
	}
}
