import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import {
	listDuties,
	createDuty,
	updateDuty,
	deleteDuty,
	api
} from "../src/api";
import { randomBytes } from "node:crypto";
import { Duty } from "../src/schemas";

function uniqueName(prefix = "duty") {
	const rnd = randomBytes(6).toString("hex");
	return `${prefix}-${Date.now()}-${rnd}`;
}

async function eventually<T>(
	fn: () => Promise<T>,
	opts: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<T> {
	const timeoutMs = opts.timeoutMs ?? 5000;
	const intervalMs = opts.intervalMs ?? 100;
	const start = Date.now();
	let lastErr: unknown;
	while (Date.now() - start < timeoutMs) {
		try {
			return await fn();
		} catch (e) {
			lastErr = e;
			await new Promise((r) => setTimeout(r, intervalMs));
		}
	}
	throw lastErr || new Error("eventually() timed out");
}

describe("Duties API (E2E)", () => {
	const createdIds: string[] = [];
	let createdId = "";
	const originalName = uniqueName("create");
	const updatedName = uniqueName("updated");

	beforeAll(() => {
		const base = api.defaults?.baseURL ?? "";
		expect(
			typeof base === "string" && base.length > 0
		).toBe(true);
	});

	afterAll(async () => {
		for (const id of createdIds) {
			await deleteDuty(id);
		}
	});

	it("creates a duty", async () => {
		const duty = await createDuty(originalName);

		expect(duty).toBeTruthy();
		expect(typeof duty.id).toBe("string");
		expect(duty.id.length).toBeGreaterThan(0);
		expect(duty.name).toBe(originalName);

		createdId = duty.id;
		createdIds.push(createdId);
	});

	it("lists duties with pagination and contains the created duty", async () => {
		const page = 1;
		const pageSize = 50;

		const res = await eventually(() => listDuties(page, pageSize), {
			timeoutMs: 8000,
			intervalMs: 150,
		});

		expect(res).toHaveProperty("items");
		expect(Array.isArray(res.items)).toBe(true);
		expect(res.items.length).toBeLessThanOrEqual(pageSize);

		const found = res.items.find((d: Duty) => d.id === createdId);
		expect(found).toBeTruthy();
		expect(found?.name).toBe(originalName);
	});

	it("updates the duty name", async () => {
		const updated = await updateDuty(createdId, updatedName);
		expect(updated.id).toBe(createdId);
		expect(updated.name).toBe(updatedName);

		const res = await eventually(() => listDuties(1, 50), {
			timeoutMs: 8000,
			intervalMs: 150,
		});
		const found = res.items.find((d: Duty) => d.id === createdId);
		expect(found).toBeTruthy();
		expect(found?.name).toBe(updatedName);
	});

	it("respects pageSize and page boundaries", async () => {
		const res10 = await listDuties(1, 10);
		expect(res10.items.length).toBeLessThanOrEqual(10);

		if (res10.total && res10.total > 10) {
			const res2 = await listDuties(2, 10);
			const ids1 = new Set(res10.items.map((d: Duty) => d.id));
			const overlap = res2.items.filter((d: Duty) => ids1.has(d.id));
			expect(overlap.length).toBe(0);
		}
	});

	it("deletes the duty and it no longer appears in listings", async () => {
		await deleteDuty(createdId);

		const idx = createdIds.indexOf(createdId);
		if (idx >= 0) createdIds.splice(idx, 1);

		const res = await eventually(() => listDuties(1, 100), {
			timeoutMs: 8000,
			intervalMs: 150,
		});
		const stillThere = res.items.find((d: Duty) => d.id === createdId);
		expect(stillThere).toBeFalsy();
	});
});
