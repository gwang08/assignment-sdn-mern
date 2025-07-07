import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import moment from "moment";
import React, { useEffect, useState } from "react";
import apiService from "../../services/api";
import { MedicineRequest } from "../../types";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const MedicineRequestsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<MedicineRequest | null>(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [processingRequest, setProcessingRequest] =
    useState<MedicineRequest | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState<{
    status?: string;
    dateRange?: [moment.Moment, moment.Moment];
  }>({});

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async (formValues?: any) => {
    try {
      setLoading(true);

      // Cập nhật bộ lọc nếu có
      if (formValues) {
        setFilters(formValues);
      }

      const data = await apiService.getNurseMedicineRequests();
      let filteredData = data ?? [];

      // Áp dụng lọc theo status
      if (formValues?.status) {
        filteredData = filteredData.filter(
          (req) => req.status === formValues.status
        );
      }

      // Áp dụng lọc theo ngày tạo
      if (formValues?.dateRange?.[0] && formValues?.dateRange?.[1]) {
        const [start, end] = formValues.dateRange;
        filteredData = filteredData.filter((req) => {
          const created = moment(req.createdAt);
          return created.isBetween(
            start.startOf("day"),
            end.endOf("day"),
            null,
            "[]"
          );
        });
      }

      setRequests(filteredData);
    } catch (error) {
      console.error("Error loading medicine requests:", error);
      setRequests([]);
      message.error("Có lỗi xảy ra khi tải danh sách yêu cầu thuốc");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = (request: MedicineRequest) => {
    setProcessingRequest(request);
    form.setFieldsValue({
      status: request.status || undefined,
      notes: request.notes || "",
    });
    setIsStatusModalVisible(true);
  };

  const handleUpdateStatus = async (values: any) => {
    if (!processingRequest) return;

    try {
      const response = await apiService.updateMedicineRequestStatus(
        processingRequest._id,
        values
      );

      if (response.success) {
        message.success("Cập nhật trạng thái thành công");
        setIsStatusModalVisible(false);
        form.resetFields();
        loadRequests();
      } else {
        message.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    loadRequests();
  };

  const getStatusTag = (status?: string) => {
    const statusConfig = {
      pending: {
        color: "orange",
        text: "Chờ duyệt",
        icon: <ClockCircleOutlined />,
      },
      approved: {
        color: "green",
        text: "Đã duyệt",
        icon: <CheckCircleOutlined />,
      },
      rejected: {
        color: "red",
        text: "Từ chối",
        icon: <CloseCircleOutlined />,
      },
      completed: {
        color: "blue",
        text: "Hoàn thành",
        icon: <CheckCircleOutlined />,
      },
    };
    const config = statusConfig[
      (status || "pending") as keyof typeof statusConfig
    ] || {
      color: "default",
      text: status || "Không xác định",
      icon: <ExclamationCircleOutlined />,
    };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const columns: ColumnsType<MedicineRequest> = [
    {
      title: "Mã yêu cầu",
      dataIndex: "_id",
      key: "_id",
      align: "center",
      render: (id: string) => id.slice(-8).toUpperCase(),
    },
    {
      title: "Tên thuốc",
      key: "medicine_name",
      render: (_, record) => {
        const medicine = record.medicines?.[0];
        return (
          <div>
            <strong>{medicine?.name ?? "N/A"}</strong>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {medicine?.dosage ?? "N/A"} - {medicine?.frequency ?? "N/A"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Học sinh",
      key: "student",
      render: (_, record) => {
        const student = record.student;
        return student ? (
          <div>
            <div>
              {student.first_name} {student.last_name}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {student.class_name}
            </div>
          </div>
        ) : (
          <div>ID: {record.student_id?.slice(-6).toUpperCase() ?? "N/A"}</div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date: string) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => setSelectedRequest(record)}
            title="Xem chi tiết"
          />
          {(!record.status || record.status === "pending") && (
            <Button
              type="primary"
              onClick={() => handleProcessRequest(record)}
              title="Xử lý yêu cầu"
            >
              Xử lý
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const pendingCount = requests?.filter((r) => r.status === "pending").length;
  const approvedCount = requests?.filter((r) => r.status === "approved").length;
  const rejectedCount = requests?.filter((r) => r.status === "rejected").length;

  return (
    <div className="p-6">
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {pendingCount}
              </div>
              <div className="text-gray-600">Chờ duyệt</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {approvedCount}
              </div>
              <div className="text-gray-600">Đã duyệt</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {rejectedCount}
              </div>
              <div className="text-gray-600">Từ chối</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {requests.length}
              </div>
              <div className="text-gray-600">Tổng cộng</div>
            </div>
          </Card>
        </Col>
      </Row>
      <Card className="mb-4">
        <Form
          layout="inline"
          onFinish={loadRequests}
          initialValues={{
            status: "",
          }}
        >
          <Form.Item name="dateRange" label="Khoảng ngày">
            <RangePicker format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select style={{ width: 160 }} allowClear placeholder="Tất cả">
              <Option value="pending">Chờ duyệt</Option>
              <Option value="approved">Đã duyệt</Option>
              <Option value="rejected">Từ chối</Option>
              <Option value="completed">Hoàn thành</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="button" onClick={() => handleClearFilters()}>
              Xóa lọc
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} yêu cầu`,
          }}
        />
      </Card>

      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập nhật trạng thái yêu cầu"
        open={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        footer={null}
        width={600}
      >
        {processingRequest && (
          <div style={{ marginBottom: 16 }}>
            <p>
              <strong>Học sinh:</strong> {processingRequest.student?.first_name}{" "}
              {processingRequest.student?.last_name} (
              {processingRequest.student?.class_name})
            </p>
            <p>
              <strong>Thời gian sử dụng:</strong>{" "}
              {moment(processingRequest.startDate).format("DD/MM/YYYY")} -{" "}
              {moment(processingRequest.endDate).format("DD/MM/YYYY")}
            </p>
            <p>
              <strong>Thuốc:</strong>
              <ul style={{ paddingLeft: 20 }}>
                {processingRequest?.medicines &&
                  processingRequest.medicines.length > 0 && (
                    <p>
                      <strong>Thuốc:</strong>
                      <ul style={{ paddingLeft: 20 }}>
                        {processingRequest.medicines.map((med, idx) => (
                          <li key={idx}>
                            <strong>{med.name}</strong>: {med.dosage},{" "}
                            {med.frequency}
                            {med.notes && (
                              <>
                                {" "}
                                — <em>{med.notes}</em>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </p>
                  )}
              </ul>
            </p>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleUpdateStatus}>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="approved">Duyệt</Option>
              <Option value="rejected">Từ chối</Option>
              <Option value="completed">Hoàn thành</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú (tùy chọn)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => setIsStatusModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        title="Chi tiết yêu cầu thuốc"
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        size="large"
      >
        {selectedRequest && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Mã yêu cầu">
              {selectedRequest._id.slice(-8).toUpperCase()}
            </Descriptions.Item>
            <Descriptions.Item label="Học sinh">
              {selectedRequest.student
                ? `${selectedRequest.student.first_name} ${selectedRequest.student.last_name}`
                : `ID: ${selectedRequest.student_id?.slice(-6).toUpperCase()}`}
            </Descriptions.Item>
            <Descriptions.Item label="Lớp">
              {selectedRequest.student?.class_name || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {moment(selectedRequest.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedRequest.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Thuốc yêu cầu">
              {selectedRequest.medicines?.length ? (
                <ul style={{ paddingLeft: 20 }}>
                  {selectedRequest.medicines.map((med, idx) => (
                    <li key={idx}>
                      <strong>{med.name}</strong>: {med.dosage} —{" "}
                      {med.frequency}
                      {med.notes && (
                        <>
                          {" "}
                          — <em>{med.notes}</em>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                "Không có"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {selectedRequest.notes || "Không có"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default MedicineRequestsPage;
