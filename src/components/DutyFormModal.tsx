import { useEffect, useState } from "react";
import { Modal, Form, Input } from "antd";
import { ZDutyDTO, type DutyDTO } from "../schemas";

type Props = {
	open: boolean;
	initial?: { name: string } | null;
	onCancel: () => void;
	onSubmit: (dto: DutyDTO) => Promise<void> | void;
	confirmText?: string;
	title?: string;
	submitting?: boolean;
};

export function DutyFormModal({
	open,
	initial,
	onCancel,
	onSubmit,
	confirmText = "Save",
	title = "Duty",
	submitting = false
}: Props) {
	const [form] = Form.useForm<DutyDTO>();
	const [zodError, setZodError] = useState<string | null>(null);

	useEffect(() => {
		form.resetFields();
		if (initial) form.setFieldsValue({ name: initial.name });
	}, [open, initial, form]);

	const handleOk = async () => {
		const values = await form.validateFields().catch(() => null);
		if (!values) return;

		const parsed = ZDutyDTO.safeParse(values);
		if (!parsed.success) {
			const msg = parsed.error.issues.map(i => i.message).join(", ");
			setZodError(msg);
			return;
		}
		setZodError(null);
		await onSubmit(parsed.data);
	};

	return (
		<Modal
			open={open}
			title={title}
			okText={confirmText}
			onCancel={onCancel}
			onOk={handleOk}
			confirmLoading={submitting}
			destroyOnClose
		>
			<Form form={form} layout="vertical" initialValues={{ name: "" }}>
				<Form.Item
					label="Name"
					name="name"
					rules={[
						{ required: true, message: "Name is required" },
						{ max: 255, message: "Max 255 characters" }
					]}
				>
					<Input placeholder="Enter duty name" />
				</Form.Item>
				{zodError ? <div style={{ color: "crimson" }}>{zodError}</div> : null}
			</Form>
		</Modal>
	);
}
