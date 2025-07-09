import { PlusOutlined } from "@ant-design/icons";
import { Button, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiService from "../../services/api/adminService";
import { StudentParentRelation } from "../../types";
import CreateStudentParentModal from "./CreateStudentParentModal";
import "./StudentParentRelations.css";

const { Title } = Typography;

const StudentParentRelations: React.FC = () => {
  const [relations, setRelations] = useState<StudentParentRelation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRelations();
  }, []);

  const loadRelations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStudentParentRelations();
      if (response.success && response.data) {
        setRelations(response.data);
      } else {
        toast.error(response.message || "Không thể tải dữ liệu quan hệ.");
      }
    } catch (error) {
      console.error("Lỗi khi tải quan hệ phụ huynh – học sinh:", error);
      toast.error("Lỗi hệ thống.");
    } finally {
      setLoading(false);
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
      title: "Email",
      dataIndex: ["parent", "email"],
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: ["parent", "phone_number"],
      key: "phone_number",
    },
    {
      title: "Mối quan hệ",
      dataIndex: "relationship",
      key: "relationship",
    },
    {
      title: "Liên hệ khẩn cấp",
      dataIndex: "is_emergency_contact",
      key: "is_emergency_contact",
      render: (value: boolean) => (value ? "✔️" : "❌"),
    },
  ];

  return (
    <div className="p-6">
      <div className="student-parent-header">
        <Title level={3}>Danh sách quan hệ Phụ huynh - Học sinh</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowCreateModal(true)}
        >
          Tạo liên kết
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={relations}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <CreateStudentParentModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadRelations();
        }}
      />
    </div>
  );
};

export default StudentParentRelations;
