import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function useBrowserLocation() {
	const get = () => ({
		pathname:
			typeof window !== "undefined" ? window.location.pathname : "/",
		search:
			typeof window !== "undefined" ? window.location.search : "",
	});

	const [loc, setLoc] = useState(get);

	useEffect(() => {
		const onPop = () => setLoc(get());
		window.addEventListener("popstate", onPop);
		return () => window.removeEventListener("popstate", onPop);
	}, []);

	return [loc, setLoc] as const;
}

function useNavigateShim(setLoc: (l: { pathname: string; search: string }) => void) {
	const lastUrl = useRef<string>("");

	return useCallback(
		(
			to: { pathname: string; search?: string },
			opts?: { replace?: boolean }
		) => {
			const search = to.search ?? "";
			const url = `${to.pathname}${search}`;

			if (typeof window === "undefined") return;

			if (opts?.replace) {
				window.history.replaceState({}, "", url);
			} else {
				window.history.pushState({}, "", url);
			}

			if (lastUrl.current !== url) {
				lastUrl.current = url;
				setLoc({ pathname: to.pathname, search });
			}
		},
		[setLoc]
	);
}

export function usePath() {
	const [location, setLocation] = useBrowserLocation();
	const navigate = useNavigateShim(setLocation);

	const params = useMemo(
		() => new URLSearchParams(location.search),
		[location.search]
	);

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || "10");

	const setQuery = useCallback(
		(entries: Record<string, string | number | null>) => {
			const next = new URLSearchParams(location.search);

			for (const [k, v] of Object.entries(entries)) {
				if (v === null) next.delete(k);
				else next.set(k, String(v));
			}

			navigate(
				{ pathname: location.pathname, search: `?${next.toString()}` },
				{ replace: false }
			);
		},
		[location.pathname, location.search, navigate]
	);

	const setPage = useCallback((p: number) => setQuery({ page: p }), [setQuery]);
	
	const setPageSize = useCallback(
		(s: number) => setQuery({ pageSize: s, page: 1 }),
		[setQuery]
	);

	return useMemo(
		() => ({ page, pageSize, setPage, setPageSize, setQuery }),
		[page, pageSize, setPage, setPageSize, setQuery]
	);
}
