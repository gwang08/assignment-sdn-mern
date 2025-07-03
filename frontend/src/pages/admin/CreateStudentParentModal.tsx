import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  Checkbox,
  message,
  Row,
  Col,
  Button,
} from "antd";
import apiService from "../../services/api";
import { Student, Parent } from "../../types";

const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateStudentParentModal: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadOptions();
    }
  }, [open]);

  const loadOptions = async () => {
    try {
      const [studentRes, parentRes] = await Promise.all([
        apiService.getStudents(),
        apiService.getParents(),
      ]);

      if (studentRes.success && parentRes.success) {
        setStudents(studentRes.data || []);
        setParents(parentRes.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách học sinh / phụ huynh:", err);
      message.error("Không thể tải danh sách học sinh / phụ huynh");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const response = await apiService.createStudentParentRelation({
        studentId: values.studentId,
        parentId: values.parentId,
        relationship: values.relationship,
        is_emergency_contact: values.is_emergency_contact || false,
      });

      if (response.success) {
        message.success("Tạo liên kết thành công");
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(response.message || "Tạo liên kết thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi tạo liên kết:", err);
      message.error("Lỗi hệ thống khi tạo liên kết");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo liên kết học sinh - phụ huynh"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Học sinh"
              name="studentId"
              rules={[{ required: true, message: "Chọn học sinh" }]}
            >
              <Select placeholder="Chọn học sinh">
                {students.map((s) => (
                  <Option key={s._id} value={s._id}>
                    {s.first_name} {s.last_name} - {s.class_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Phụ huynh"
              name="parentId"
              rules={[{ required: true, message: "Chọn phụ huynh" }]}
            >
              <Select placeholder="Chọn phụ huynh">
                {parents.map((p) => (
                  <Option key={p._id} value={p._id}>
                    {p.first_name} {p.last_name} - {p.phone_number}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Mối quan hệ"
          name="relationship"
          rules={[{ required: true, message: "Nhập mối quan hệ" }]}
        >
          <Input placeholder="VD: Bố, Mẹ, Anh, Chị..." />
        </Form.Item>

        <Form.Item
          name="is_emergency_contact"
          valuePropName="checked"
          initialValue={false}
        >
          <Checkbox>Là người liên hệ khẩn cấp</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Tạo liên kết
          </Button>{" "}
          <Button onClick={onClose}>Hủy</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateStudentParentModal;
