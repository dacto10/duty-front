import { useCallback, useEffect, useReducer, useState } from "react";
import { Button, Table, Space, Typography, App as AntApp, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { listDuties, createDuty, updateDuty, deleteDuty } from "../api";
import { dutyReducer, initialFetchState } from "../state";
import { DutyFormModal } from "../components/DutyFormModal";
import { usePath } from "../hooks/usePath";
import type { Duty } from "../schemas";

export default function DutiesPage() {
	const { message } = AntApp.useApp();

	const [state, dispatch] = useReducer(dutyReducer, initialFetchState);

	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState<Duty | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const { page, pageSize, setPage, setPageSize } = usePath();

	const load = useCallback(async () => {
		try {
			dispatch({ type: "LOAD_START" });
			const data = await listDuties(page, pageSize);

			if (data.totalPages < page) setPage(data.totalPages);

			dispatch({ type: "LOAD_SUCCESS", payload: data });
		} catch (e) {
			dispatch({ type: "LOAD_ERROR", payload: (e as Error)?.message || "Failed to load" });
			message.error((e as Error)?.message || "Failed to load");
		}
	}, [page, pageSize, setPage, message]);

	useEffect(() => {
		load();
	}, [load]);

	const openCreate = () => { setEditing(null); setModalOpen(true); };
	const openEdit = (d: Duty) => { setEditing(d); setModalOpen(true); };
	const closeModal = () => { setModalOpen(false); setEditing(null); };

	const handleSubmit = async (dto: { name: string }) => {
		setSubmitting(true);
		try {
			if (editing) {
				await updateDuty(editing.id, dto.name);
				message.success("Duty updated");
			} else {
				await createDuty(dto.name);
				message.success("Duty created");
			}
			closeModal();
			await load();
		} catch (e) {
			message.error((e as Error)?.message || "Operation failed");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteDuty(id);
			message.success("Duty deleted");
			await load();
		} catch (e) {
			message.error((e as Error)?.message || "Delete failed");
		}
	};

	const columns: ColumnsType<Duty> = [
		{ title: "Name", dataIndex: "name", key: "name" },
		{
			title: "Actions",
			key: "actions",
			width: 120,
			render: (_v, record) => (
				<Space>
					<Button
						icon={<EditOutlined />}
						size="small"
						onClick={() => openEdit(record)}
						aria-label={`edit-${record.id}`}
					/>
					<Popconfirm
						title="Delete duty?"
						okText="Delete"
						onConfirm={() => handleDelete(record.id)}
					>
						<Button
							danger
							icon={<DeleteOutlined />}
							size="small"
							aria-label={`delete-${record.id}`}
						/>
					</Popconfirm>
				</Space>
			)
		}
	];

	const data = state.data?.items ?? [];
	const total = state.data?.total ?? 0;

	return (
		<div style={{ padding: 24 }}>
			<Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}>
				<Typography.Title level={3} style={{ margin: 0 }}>
					Duties
				</Typography.Title>
				<Space>
					<Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
					<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
						New Duty
					</Button>
				</Space>
			</Space>

			<Table<Duty>
				rowKey={(r: Duty) => r.id}
				loading={state.loading}
				columns={columns}
				dataSource={data}
				pagination={{
					current: page,
					pageSize,
					total,
					onChange: (p: number, ps: number) => {
						if (ps !== pageSize) setPageSize(ps);
						if (p !== page) setPage(p);
					},
					showSizeChanger: true,
					pageSizeOptions: [3, 5, 10, 20, 50].map(String)
				}}
			/>

			<DutyFormModal
				open={modalOpen}
				initial={editing}
				onCancel={closeModal}
				onSubmit={handleSubmit}
				submitting={submitting}
				title={editing ? "Edit Duty" : "Create Duty"}
				confirmText={editing ? "Update" : "Create"}
			/>
		</div>
	);
}
