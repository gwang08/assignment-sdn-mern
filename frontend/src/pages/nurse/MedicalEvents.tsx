// Fixed MedicalEventsPage.tsx - Corrected enum mapping

import {
  CheckOutlined,
  EditOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import moment from "moment";
import React, { useEffect, useState } from "react";
import nurseService from "../../services/api/nurseService";
import {
  eventTypeMap,
  MedicalEventNurse,
  severityMap,
  statusMap,
  Student,
} from "../../types";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const MedicalEventsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<MedicalEventNurse[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEventNurse | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MedicalEventNurse | null>(
    null
  );
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    event_type: undefined,
    severity: undefined,
    status: undefined,
  });
  const [isResolveModalVisible, setIsResolveModalVisible] = useState(false);
  const [resolvingEvent, setResolvingEvent] =
    useState<MedicalEventNurse | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsResponse, studentsResponse] = await Promise.all([
        nurseService.getMedicalEvents(),
        nurseService.getStudents(),
      ]);

      if (eventsResponse.success && eventsResponse.data) {
        // Map lại dữ liệu để thêm field student_id
        const mappedEvents = eventsResponse.data.map((event: any) => ({
          ...event,
          student_id: event.student, // ← thêm dòng này để bảng hiển thị đúng
        }));
        setEvents(mappedEvents);
      }

      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);
      }
    } catch (err) {
      message.error("Có lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (studentId: string) => {
    const s = students.find((s) => s._id === studentId);
    return s ? `${s.first_name} ${s.last_name}` : "N/A";
  };

  const getSeverityColor = (severity: string) =>
    ({ Low: "green", Medium: "orange", High: "red", Emergency: "magenta" }[
      severity
    ] || "default");

  const getStatusColor = (status: string) =>
    ({
      Open: "red",
      "In Progress": "blue",
      Resolved: "green",
      "Referred to Hospital": "purple",
    }[status] || "default");

  const handleCreate = () => {
    setEditingEvent(null);
    form.resetFields();
    form.setFieldsValue({
      parent_notified: false,
      follow_up_required: false,
    });

    setIsModalVisible(true);
  };

  const handleEdit = (event: MedicalEventNurse) => {
    setEditingEvent(event);
    form.setFieldsValue({
      ...event,
      symptoms: event.symptoms.join(", "),
      medications_given:
        event.medications_administered?.map((m) => m.name).join(", ") || "",
      treatment_provided: event.treatment_notes,
      parent_notified: event.parent_notified?.status ?? false,
      follow_up_required: event.follow_up_required ?? true,
    });
    setIsModalVisible(true);
  };

  const handleView = (event: MedicalEventNurse) => {
    setSelectedEvent(event);
    setIsDetailDrawerVisible(true);
  };

  const handleSubmit = async (values: any) => {
    const eventData = {
      studentId: values.student_id,
      event_type: values.event_type,
      description: values.description,
      severity: values.severity,
      symptoms: values.symptoms?.split(",").map((s: string) => s.trim()) || [],
      treatment_notes: values.treatment_provided,
      medications_administered:
        values.medications_given?.split(",").map((name: string) => ({
          name: name.trim(),
          dosage: "",
          time: new Date(),
        })) || [],
      parent_notified: values.parent_notified || false,
      follow_up_required: values.follow_up_required,
      follow_up_notes: values.follow_up_notes || "",
    };

    try {
      const response = editingEvent
        ? await nurseService.updateMedicalEvent(editingEvent._id, eventData)
        : await nurseService.createMedicalEvent(eventData);

      // Check HTTP status code or just assume success if no error thrown
      message.success(
        editingEvent ? "Cập nhật thành công" : "Tạo mới thành công"
      );
      setIsModalVisible(false);
      form.resetFields();
      loadData(); // reload table
    } catch (err) {
      message.error("Có lỗi khi lưu");
    }
  };

  const handleResolve = (event: MedicalEventNurse) => {
    setResolvingEvent(event);
    setIsResolveModalVisible(true);
  };

  const columns: ColumnsType<MedicalEventNurse> = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Học sinh",
      dataIndex: "student_id",
      render: (id) => <>{getStudentName(id)}</>,
    },
    {
      title: "Loại sự kiện",
      dataIndex: "event_type",
      render: (type: string) =>
        ({
          Accident: "Tai nạn",
          Fever: "Sốt",
          Injury: "Chấn thương",
          Epidemic: "Dịch bệnh",
          Other: "Khác",
        }[type] || type),
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      align: "center",
      render: (s) => (
        <Tag color={getSeverityColor(s)}>{severityMap[s] || s}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (s) => <Tag color={getStatusColor(s)}>{statusMap[s] || s}</Tag>,
    },

    {
      title: "Thao tác",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.status === "Resolved"}
          />
          <Button
            icon={<CheckOutlined />}
            onClick={() => handleResolve(record)}
            disabled={record.status === "Resolved"}
            type="default"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={3}>
          <MedicineBoxOutlined /> Quản lý Sự kiện Y tế
        </Title>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap", // Cho responsive
          gap: 8,
        }}
      >
        {/* Bên trái: Nút Tạo mới */}
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo mới
        </Button>

        {/* Bên phải: Bộ lọc + Xoá bộ lọc */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <Select
            allowClear
            placeholder="Lọc theo loại sự kiện"
            value={filters.event_type}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, event_type: value }))
            }
            style={{ width: 180 }}
          >
            <Option value="Accident">Tai nạn</Option>
            <Option value="Fever">Sốt</Option>
            <Option value="Injury">Chấn thương</Option>
            <Option value="Epidemic">Dịch bệnh</Option>
            <Option value="Other">Khác</Option>
          </Select>

          <Select
            allowClear
            placeholder="Lọc theo mức độ"
            value={filters.severity}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, severity: value }))
            }
            style={{ width: 160 }}
          >
            <Option value="Low">Thấp</Option>
            <Option value="Medium">Trung bình</Option>
            <Option value="High">Cao</Option>
            <Option value="Emergency">Khẩn cấp</Option>
          </Select>

          <Select
            allowClear
            placeholder="Lọc theo trạng thái"
            value={filters.status}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
            style={{ width: 200 }}
          >
            <Option value="Open">Mở</Option>
            <Option value="In Progress">Đang xử lý</Option>
            <Option value="Resolved">Đã giải quyết</Option>
            <Option value="Referred to Hospital">Chuyển bệnh viện</Option>
          </Select>

          <Button
            onClick={() =>
              setFilters({
                event_type: undefined,
                severity: undefined,
                status: undefined,
              })
            }
          >
            Xoá bộ lọc
          </Button>
        </div>
      </div>

      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={events.filter((event) => {
          const { event_type, severity, status } = filters;
          return (
            (!event_type || event.event_type === event_type) &&
            (!severity || event.severity === severity) &&
            (!status || event.status === status)
          );
        })}
      />

      <Modal
        open={isModalVisible}
        title={editingEvent ? "Chỉnh sửa sự kiện" : "Tạo mới sự kiện"}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="student_id"
            label="Học sinh"
            rules={[{ required: true }]}
          >
            <Select placeholder="Lựa chọn học sinh">
              {students.map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.first_name} {s.last_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="event_type"
            label="Loại sự kiện"
            rules={[{ required: true }]}
          >
            <Select placeholder="Lựa chọn sự kiện">
              <Option value="Accident">Tai nạn</Option>
              <Option value="Fever">Sốt</Option>
              <Option value="Injury">Chấn thương</Option>
              <Option value="Epidemic">Dịch bệnh</Option>
              <Option value="Other">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true }]}
          >
            <TextArea rows={3} placeholder="Nhập mô tả" />
          </Form.Item>
          <Form.Item
            name="severity"
            label="Mức độ"
            rules={[{ required: true }]}
          >
            <Select placeholder="Lựa chọn mức độ">
              <Option value="Low">Thấp</Option>
              <Option value="Medium">Trung bình</Option>
              <Option value="High">Cao</Option>
              <Option value="Emergency">Khẩn cấp</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select placeholder="Lựa chọn trạng thái">
              <Option value="Open">Mở</Option>
              <Option value="In Progress">Đang xử lý</Option>
              <Option value="Resolved">Đã giải quyết</Option>
              <Option value="Referred to Hospital">Chuyển bệnh viện</Option>
            </Select>
          </Form.Item>
          <Form.Item name="symptoms" label="Triệu chứng">
            <Input placeholder="Ví dụ: sốt, ho, đau đầu" />
          </Form.Item>
          <Form.Item
            name="treatment_provided"
            label="Xử trí"
            rules={[{ required: true }]}
          >
            <TextArea rows={2} placeholder="Nhập cách xử trí" />
          </Form.Item>
          <Form.Item name="medications_given" label="Thuốc đã dùng">
            <Input placeholder="Paracetamol, Vitamin C" />
          </Form.Item>
          <Form.Item name="follow_up_required" label="Cần theo dõi">
            <Select placeholder="Có/Không">
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>
          <Form.Item name="parent_notified" label="Thông báo phụ huynh">
            <Select placeholder="Đã thông báo/Chưa thông báo">
              <Option value={true}>Đã thông báo</Option>
              <Option value={false}>Chưa thông báo</Option>
            </Select>
          </Form.Item>
          <Form.Item name="follow_up_notes" label="Ghi chú theo dõi">
            <TextArea rows={2} placeholder="Ghi chú" />
          </Form.Item>
          <div className="flex gap-2 justify-end">
            <Button
              style={{ marginRight: 10 }}
              onClick={() => setIsModalVisible(false)}
            >
              Hủy
            </Button>
            <Button htmlType="submit" type="primary" className="ml-2">
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>

      <Drawer
        title="Chi tiết sự kiện"
        open={isDetailDrawerVisible}
        onClose={() => setIsDetailDrawerVisible(false)}
        size="large"
      >
        {selectedEvent && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Học sinh">
              {getStudentName(selectedEvent.student_id)}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {moment(selectedEvent.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Loại sự kiện">
              {eventTypeMap[selectedEvent.event_type] ||
                selectedEvent.event_type}
            </Descriptions.Item>
            <Descriptions.Item label="Mức độ">
              {severityMap[selectedEvent.severity] || selectedEvent.severity}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              {statusMap[selectedEvent.status] || selectedEvent.status}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {selectedEvent.description}
            </Descriptions.Item>
            <Descriptions.Item label="Xử trí">
              {selectedEvent.treatment_notes}
            </Descriptions.Item>
            <Descriptions.Item label="Triệu chứng">
              {selectedEvent.symptoms?.length > 0
                ? selectedEvent.symptoms.join(", ")
                : "Chưa có"}
            </Descriptions.Item>
            <Descriptions.Item label="Thuốc đã sử dụng">
              {selectedEvent.medications_administered
                ?.map((m) => m.name)
                .join(", ") || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Cần theo dõi">
              {selectedEvent.follow_up_required ? "Có" : "Không"}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú theo dõi">
              {selectedEvent.follow_up_notes || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Đã thông báo phụ huynh">
              {selectedEvent.parent_notified?.status ? "Có" : "Chưa"}
            </Descriptions.Item>
            {selectedEvent.parent_notified?.time && (
              <Descriptions.Item label="Thời gian thông báo">
                {moment(selectedEvent.parent_notified.time).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
      <Modal
        open={isResolveModalVisible}
        title="Xác nhận giải quyết"
        onCancel={() => setIsResolveModalVisible(false)}
        onOk={async () => {
          if (!resolvingEvent) return;
          try {
            await nurseService.resolveMedicalEvent(resolvingEvent._id, {
              treatment_notes: resolvingEvent.treatment_notes,
            });
            message.success("Đã đánh dấu sự kiện là đã giải quyết");
            setIsResolveModalVisible(false);
            loadData();
          } catch (err) {
            message.error("Có lỗi xảy ra");
          }
        }}
      >
        {resolvingEvent && (
          <div>
            <p>
              Bạn có chắc chắn muốn đánh dấu sự kiện này là{" "}
              <b style={{ color: "green" }}>Đã giải quyết</b>?
            </p>
            <p>
              <b>Học sinh:</b> {getStudentName(resolvingEvent.student_id)}
            </p>
            <p>
              <b>Mô tả:</b> {resolvingEvent.description}
            </p>
            <p>
              <b>Triệu chứng:</b>{" "}
              {resolvingEvent.symptoms?.length > 0
                ? resolvingEvent.symptoms.join(", ")
                : "Không có"}
            </p>
            <p>
              <b>Thời gian:</b>{" "}
              {moment(resolvingEvent.createdAt).format("DD/MM/YYYY HH:mm")}
            </p>
            <p style={{ fontStyle: "italic", color: "gray" }}>
              Sau khi xác nhận, sự kiện sẽ không thể chỉnh sửa và hoàn tác.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalEventsPage;
