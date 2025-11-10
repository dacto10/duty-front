import type { Duty } from "../schemas";
import type { Paginated } from "../utils";
import { api } from "./client";

export async function listDuties(page: number, pageSize: number): Promise<Paginated<Duty>> {
	const res = await api.get<Paginated<Duty>>("/duties", { params: { page, pageSize } });

	return res.data;
}

export async function createDuty(name: string): Promise<Duty> {
	const res = await api.post<Duty>("/duties", { name });

	return res.data;
}

export async function updateDuty(id: string, name: string): Promise<Duty> {
	const res = await api.put<Duty>(`/duties/${id}`, { name });

	return res.data;
}

export async function deleteDuty(id: string): Promise<void> {
	await api.delete(`/duties/${id}`);
}
