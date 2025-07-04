import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Tabs,
  Tag,
  DatePicker,
} from "antd";
import { PlusOutlined, EditOutlined, StopOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import moment from "moment";
import apiService from "../../services/api/adminService";
import { Student, MedicalStaff } from "../../types";
import StudentParentRelations from "./StudentParentRelations";
import PendingLinkRequests from "./PendingLinkRequests";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [medicalStaff, setMedicalStaff] = useState<MedicalStaff[]>([]);
  const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
  const [isMedicalStaffModalVisible, setIsMedicalStaffModalVisible] =
    useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingMedicalStaff, setEditingMedicalStaff] =
    useState<MedicalStaff | null>(null);
  const [activeTab, setActiveTab] = useState("students");
  const [studentToDeactivate, setStudentToDeactivate] =
    useState<Student | null>(null);
  const [medicalStaffToDeactivate, setMedicalStaffToDeactivate] =
    useState<MedicalStaff | null>(null);
  const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
  const [
    deactivateMedicalStaffModalVisible,
    setDeactivateMedicalStaffModalVisible,
  ] = useState(false);
  const [studentForm] = Form.useForm();
  const [medicalStaffForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [studentsResponse, medicalStaffResponse] = await Promise.all([
        apiService.getStudents(),
        apiService.getMedicalStaff(),
      ]);

      if (studentsResponse.success && studentsResponse.data) {
        const normalizedStudents = (studentsResponse.data as any[]).map(
          (s) => ({
            ...s,
            isActive: s.is_active,
          })
        );
        setStudents(normalizedStudents);
      }

      if (medicalStaffResponse.success && medicalStaffResponse.data) {
        const normalizedMedicalStaff = (medicalStaffResponse.data as any[]).map(
          (staff) => ({
            ...staff,
            isActive: staff.is_active,
          })
        );
        setMedicalStaff(normalizedMedicalStaff);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Student management functions
  const handleCreateStudent = () => {
    setEditingStudent(null);
    studentForm.resetFields();
    setIsStudentModalVisible(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    studentForm.setFieldsValue({
      ...student,
      dateOfBirth: student.dateOfBirth ? moment(student.dateOfBirth) : null,
    });
    setIsStudentModalVisible(true);
  };
  const handleSubmitStudent = async (values: any) => {
    try {
      const { username, password, student_id, ...restValues } = values;

      const studentData = {
        ...restValues,
        dateOfBirth: values.dateOfBirth?.toDate(),
      };

      let response;
      const isEditing = !!editingStudent;

      if (isEditing) {
        response = await apiService.updateStudent(
          editingStudent._id,
          studentData
        );
      } else {
        response = await apiService.createStudent(studentData);
      }

      if (response.success) {
        message.success(
          isEditing ? "Cập nhật học sinh thành công" : "Tạo học sinh thành công"
        );
        setIsStudentModalVisible(false);
        studentForm.resetFields();
        setEditingStudent(null);
        loadData();
      } else {
        message.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error submitting student:", error);
      message.error("Có lỗi xảy ra khi lưu thông tin học sinh");
    }
  };
  const handleDeactivateStudent = async (studentId: string) => {
    try {
      const response = await apiService.deactivateStudent(studentId);
      if (response.success) {
        message.success("Đã vô hiệu hóa học sinh");
        loadData();
      } else {
        message.error(response.message || "Thao tác thất bại");
      }
    } catch (error) {
      console.error("Error deactivating student:", error);
      message.error("Lỗi khi vô hiệu hóa học sinh");
    }
  };
  // Medical staff management functions
  const handleCreateMedicalStaff = () => {
    medicalStaffForm.resetFields();
    setIsMedicalStaffModalVisible(true);
  };

  const handleEditMedicalStaff = (staff: MedicalStaff) => {
    setEditingMedicalStaff(staff);
    medicalStaffForm.setFieldsValue({
      ...staff,
      dateOfBirth: staff.dateOfBirth ? moment(staff.dateOfBirth) : null,
    });
    setIsMedicalStaffModalVisible(true);
  };

  const handleSubmitMedicalStaff = async (values: any) => {
    try {
      const staffData = {
        ...values,
        role: "medicalStaff",
        dateOfBirth: values.dateOfBirth?.toDate(),
      };

      let response;
      const isEditing = !!editingMedicalStaff;

      if (isEditing) {
        response = await apiService.updateMedicalStaff(
          editingMedicalStaff._id,
          staffData
        );
      } else {
        response = await apiService.createMedicalStaff(staffData);
      }

      if (response.success) {
        message.success(
          isEditing
            ? "Cập nhật nhân viên thành công"
            : "Tạo nhân viên thành công"
        );
        setIsMedicalStaffModalVisible(false);
        medicalStaffForm.resetFields();
        setEditingMedicalStaff(null);
        loadData();
      } else {
        message.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error submitting medical staff:", error);
      message.error("Có lỗi xảy ra khi lưu thông tin nhân viên y tế");
    }
  };

  const handleDeactivateMedicalStaff = async (staffId: string) => {
    try {
      const response = await apiService.deactivateMedicalStaff(staffId);
      if (response.success) {
        message.success("Đã vô hiệu hóa nhân viên y tế");
        loadData();
      } else {
        message.error(response.message || "Thao tác thất bại");
      }
    } catch (error) {
      console.error("Error deactivating staff:", error);
      message.error("Lỗi khi vô hiệu hóa nhân viên y tế");
    }
  };

  const validateBirthDate = (minAge: number) => {
    return (_: any, value: moment.Moment) => {
      if (!value) return Promise.resolve();

      const today = moment();
      const birthDate = value.clone();

      // Tính tuổi thật dựa trên ngày tháng năm
      let age = today.year() - birthDate.year();
      if (
        today.month() < birthDate.month() ||
        (today.month() === birthDate.month() && today.date() < birthDate.date())
      ) {
        age--;
      }

      if (birthDate.isAfter(today)) {
        return Promise.reject("Ngày sinh không được vượt quá ngày hiện tại");
      }

      if (age < minAge) {
        return Promise.reject(`Tuổi phải từ ${minAge} trở lên`);
      }

      return Promise.resolve();
    };
  };

  // const getRoleTag = (role: string) => {
  //   const roleConfig = {
  //     super_admin: { color: "red", text: "Super Admin" },
  //     student_manager: { color: "orange", text: "Quản lý học sinh" },
  //     nurse: { color: "green", text: "Y tá" },
  //     doctor: { color: "blue", text: "Bác sĩ" },
  //     healthcare_assistant: { color: "cyan", text: "Trợ lý y tế" },
  //     parent: { color: "purple", text: "Phụ huynh" },
  //     student: { color: "geekblue", text: "Học sinh" },
  //   };
  //   const config = roleConfig[role as keyof typeof roleConfig] || {
  //     color: "default",
  //     text: role,
  //   };
  //   return <Tag color={config.color}>{config.text}</Tag>;
  // };

  const studentColumns: ColumnsType<Student> = [
    {
      title: "Mã học sinh",
      dataIndex: "student_id",
      key: "student_id",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Họ và tên",
      key: "fullname",
      render: (_, record: Student) =>
        `${record.first_name} ${record.last_name}`,
    },
    {
      title: "Lớp",
      dataIndex: "class_name",
      key: "class_name",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender: string) => {
        const genderMap = { male: "Nam", female: "Nữ", other: "Khác" };
        return genderMap[gender as keyof typeof genderMap] || gender;
      },
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date: string) =>
        date ? moment(date).format("DD/MM/YYYY") : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Vô hiệu hóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record: Student) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditStudent(record)}
            title="Chỉnh sửa"
          />
          {record.is_active && (
            <Button
              icon={<StopOutlined />}
              danger
              title="Vô hiệu hóa"
              onClick={() => {
                setStudentToDeactivate(record);
                setDeactivateModalVisible(true);
              }}
            />
          )}
        </Space>
      ),
    },
  ];
  const medicalStaffColumns: ColumnsType<MedicalStaff> = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Họ và tên",
      key: "fullname",
      render: (_, record: MedicalStaff) =>
        `${record.first_name} ${record.last_name}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "SĐT",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender: string) => {
        const genderMap = { male: "Nam", female: "Nữ", other: "Khác" };
        return genderMap[gender as keyof typeof genderMap] || gender;
      },
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date: string) =>
        date ? moment(date).format("DD/MM/YYYY") : "-",
    },
    {
      title: "Vai trò",
      dataIndex: "staff_role",
      key: "staff_role",
      render: (staffRole: string) => {
        const roleMap: Record<string, string> = {
          Nurse: "Y tá",
          Doctor: "Bác sĩ",
          "Healthcare Assistant": "Trợ lý y tế",
        };
        return <Tag color="blue">{roleMap[staffRole] || staffRole}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Vô hiệu hóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record: MedicalStaff) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditMedicalStaff(record)}
            title="Chỉnh sửa"
          />
          {record.is_active && (
            <Button
              icon={<StopOutlined />}
              danger
              title="Vô hiệu hóa"
              onClick={() => {
                setMedicalStaffToDeactivate(record);
                setDeactivateMedicalStaffModalVisible(true);
              }}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Title level={2}>Admin Dashboard</Title>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Học sinh" key="students">
            {/* Moved inside here */}
            <Row justify="space-between" align="middle" className="mb-4">
              <Col>
                <Title level={3}>Danh sách Học sinh</Title>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateStudent}
                >
                  Thêm Học Sinh
                </Button>
              </Col>
            </Row>

            <Table
              columns={studentColumns}
              dataSource={students}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Nhân viên y tế" key="medical-staff">
            <Row justify="space-between" align="middle" className="mb-4">
              <Col>
                <Title level={3}>Danh sách Nhân viên y tế</Title>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateMedicalStaff}
                >
                  Thêm Nhân Viên
                </Button>
              </Col>
            </Row>

            <Table
              columns={medicalStaffColumns}
              dataSource={medicalStaff}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Quan hệ PH-HS" key="relations">
            <StudentParentRelations />
          </TabPane>
          <TabPane tab="Yêu cầu liên kết" key="pending-links">
            <PendingLinkRequests />
          </TabPane>
        </Tabs>
      </Card>

      {/* Student Modal */}
      <Modal
        title={editingStudent ? "Chỉnh sửa học sinh" : "Tạo học sinh mới"}
        open={isStudentModalVisible}
        onCancel={() => setIsStudentModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={studentForm}
          layout="vertical"
          onFinish={handleSubmitStudent}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="class_name"
                label="Lớp"
                rules={[{ required: true, message: "Vui lòng nhập lớp" }]}
              >
                <Input placeholder="Nhập lớp" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="Họ"
                rules={[{ required: true, message: "Vui lòng nhập họ" }]}
              >
                <Input placeholder="Nhập họ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Tên"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input placeholder="Nhập tên" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh" },
                  { validator: validateBirthDate(18) },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingStudent ? "Cập nhật" : "Tạo học sinh"}
              </Button>
              <Button onClick={() => setIsStudentModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận vô hiệu hóa"
        open={deactivateModalVisible}
        onCancel={() => setDeactivateModalVisible(false)}
        onOk={async () => {
          if (studentToDeactivate) {
            await handleDeactivateStudent(studentToDeactivate._id);
            setDeactivateModalVisible(false);
          }
        }}
        okText="Vô hiệu hóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn vô hiệu hóa học sinh{" "}
          <strong>
            {studentToDeactivate?.first_name} {studentToDeactivate?.last_name}
          </strong>
          ?
        </p>
      </Modal>

      {/* Medical Staff Modal */}
      <Modal
        title="Tạo nhân viên y tế mới"
        open={isMedicalStaffModalVisible}
        onCancel={() => setIsMedicalStaffModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={medicalStaffForm}
          layout="vertical"
          onFinish={handleSubmitMedicalStaff}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Vui lòng nhập username" }]}
              >
                <Input placeholder="Nhập username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="staff_role"
                label="Vai trò"
                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="Nurse">Y tá</Option>
                  <Option value="Doctor">Bác sĩ</Option>
                  <Option value="Healthcare Assistant">Trợ lý y tế</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="Họ"
                rules={[{ required: true, message: "Vui lòng nhập họ" }]}
              >
                <Input placeholder="Nhập họ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Tên"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input placeholder="Nhập tên" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone_number"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh" },
                  { validator: validateBirthDate(22) },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
            </Col>
          </Row>

          {!editingMedicalStaff && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Tạo nhân viên
              </Button>
              <Button onClick={() => setIsMedicalStaffModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Xác nhận vô hiệu hóa"
        open={deactivateMedicalStaffModalVisible}
        onCancel={() => setDeactivateMedicalStaffModalVisible(false)}
        onOk={async () => {
          if (medicalStaffToDeactivate) {
            await handleDeactivateMedicalStaff(medicalStaffToDeactivate._id);
            setDeactivateMedicalStaffModalVisible(false);
          }
        }}
        okText="Vô hiệu hóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn vô hiệu hóa nhân viên{" "}
          <strong>
            {medicalStaffToDeactivate?.first_name}{" "}
            {medicalStaffToDeactivate?.last_name}
          </strong>
          ?
        </p>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
