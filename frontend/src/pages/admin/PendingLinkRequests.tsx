import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  message,
  Tag,
  Space,
  Button,
  Modal,
  Input,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import apiService from "../../services/api";
import { StudentParentRelation } from "../../types";

const { Title } = Typography;
const { TextArea } = Input;

const PendingLinkRequests: React.FC = () => {
  const [requests, setRequests] = useState<StudentParentRelation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"approved" | "rejected" | null>(null);
  const [notes, setNotes] = useState(""); 
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPendingLinkRequests();
      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        message.error(response.message || "Không thể tải yêu cầu liên kết.");
      }
    } catch (error) {
      console.error("Lỗi tải yêu cầu liên kết:", error);
      message.error("Lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (requestId: string, status: "approved" | "rejected") => {
    setSelectedRequestId(requestId);
    setSelectedStatus(status);
    setNotes(""); 
    setModalVisible(true);
  };

  const handleRespond = async () => {
    if (!selectedRequestId || !selectedStatus) return;

    try {
      const res = await apiService.respondToLinkRequest(selectedRequestId, selectedStatus, notes); 
      if (res.success) {
        message.success(`Đã ${selectedStatus === "approved" ? "phê duyệt" : "từ chối"} yêu cầu`);
        fetchPendingRequests();
        setModalVisible(false);
      } else {
        message.error(res.message || "Thao tác thất bại.");
      }
    } catch (err) {
      console.error("Lỗi xử lý yêu cầu:", err);
      message.error("Lỗi khi xử lý yêu cầu.");
    }
  };

  const columns: ColumnsType<StudentParentRelation> = [
    {
      title: "Học sinh",
      key: "student",
      render: (_, record) =>
        `${record.student.first_name} ${record.student.last_name}`,
    },
    {
      title: "Lớp",
      dataIndex: ["student", "class_name"],
      key: "class_name",
    },
    {
      title: "Phụ huynh",
      key: "parent",
      render: (_, record) =>
        `${record.parent.first_name} ${record.parent.last_name}`,
    },
    {
      title: "Email PH",
      dataIndex: ["parent", "email"],
      key: "email",
    },
    {
      title: "SĐT PH",
      dataIndex: ["parent", "phone_number"],
      key: "phone_number",
    },
    {
      title: "Mối quan hệ",
      dataIndex: "relationship",
      key: "relationship",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: () => <Tag color="orange">Đang chờ</Tag>,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => openConfirmModal(record._id, "approved")}
          >
            Duyệt
          </Button>
          <Button
            danger
            onClick={() => openConfirmModal(record._id, "rejected")}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title level={3}>Yêu cầu liên kết chờ duyệt</Title>
      <Table
        columns={columns}
        dataSource={requests}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`Xác nhận ${selectedStatus === "approved" ? "duyệt" : "từ chối"} yêu cầu`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleRespond}
        okText={selectedStatus === "approved" ? "Duyệt" : "Từ chối"}
        okButtonProps={{ danger: selectedStatus === "rejected" }}
      >
        <p>Ghi chú (tùy chọn):</p>
        <TextArea
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Nhập ghi chú cho phụ huynh..."
          rows={4}
        />
      </Modal>
    </div>
  );
};

export default PendingLinkRequests;
