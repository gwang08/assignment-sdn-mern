import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
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
  DatePicker
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  EditOutlined,

} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import apiService from '../../services/api';
import { User, Student } from '../../types';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
  const [isMedicalStaffModalVisible, setIsMedicalStaffModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  const [studentForm] = Form.useForm();
  const [medicalStaffForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, studentsResponse] = await Promise.all([
        apiService.getUsers(),
        apiService.getStudents()
      ]);

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }
      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = () => {
    setEditingStudent(null);
    studentForm.resetFields();
    setIsStudentModalVisible(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    studentForm.setFieldsValue({
      ...student,
      date_of_birth: student.dateOfBirth ? moment(student.dateOfBirth) : null
    });
    setIsStudentModalVisible(true);
  };

  const handleCreateMedicalStaff = () => {
    medicalStaffForm.resetFields();
    setIsMedicalStaffModalVisible(true);
  };

  const handleSubmitStudent = async (values: any) => {
    try {
      const studentData = {
        ...values,
        date_of_birth: values.date_of_birth?.toDate(),
      };

      let response;
      if (editingStudent) {
        // Update logic would go here if API supports it
        message.info('Cập nhật học sinh chưa được hỗ trợ');
        return;
      } else {
        response = await apiService.createStudent(studentData);
      }

      if (response.success) {
        message.success('Tạo học sinh thành công');
        setIsStudentModalVisible(false);
        studentForm.resetFields();
        loadData();
      } else {
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting student:', error);
      message.error('Có lỗi xảy ra khi lưu thông tin học sinh');
    }
  };

  const handleSubmitMedicalStaff = async (values: any) => {
    try {
      const response = await apiService.createMedicalStaff(values);
      
      if (response.success) {
        message.success('Tạo nhân viên y tế thành công');
        setIsMedicalStaffModalVisible(false);
        medicalStaffForm.resetFields();
        loadData();
      } else {
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting medical staff:', error);
      message.error('Có lỗi xảy ra khi lưu thông tin nhân viên y tế');
    }
  };

  const getRoleTag = (role: string) => {
    const roleConfig = {
      super_admin: { color: 'red', text: 'Super Admin' },
      student_manager: { color: 'orange', text: 'Quản lý học sinh' },
      nurse: { color: 'green', text: 'Y tá' },
      doctor: { color: 'blue', text: 'Bác sĩ' },
      healthcare_assistant: { color: 'cyan', text: 'Trợ lý y tế' },
      parent: { color: 'purple', text: 'Phụ huynh' },
      student: { color: 'geekblue', text: 'Học sinh' }
    };
    const config = roleConfig[role as keyof typeof roleConfig] || { color: 'default', text: role };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const userColumns: ColumnsType<User> = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Họ và tên',
      key: 'fullname',
      render: (_, record: User) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => getRoleTag(role),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => moment(date).format('DD/MM/YYYY'),
    },
  ];

  const studentColumns: ColumnsType<Student> = [
    {
      title: 'Mã học sinh',
      dataIndex: 'student_id',
      key: 'student_id',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Họ và tên',
      key: 'fullname',
      render: (_, record: Student) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: 'Lớp',
      dataIndex: 'class_name',
      key: 'class_name',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => {
        const genderMap = { male: 'Nam', female: 'Nữ', other: 'Khác' };
        return genderMap[gender as keyof typeof genderMap] || gender;
      },
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
      render: (date: string) => date ? moment(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record: Student) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditStudent(record)}
            title="Chỉnh sửa"
          />
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

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={users.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Học sinh"
              value={students.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Nhân viên y tế"
              value={users.filter(u => ['nurse', 'doctor', 'healthcare_assistant'].includes(u.role)).length}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Phụ huynh"
              value={users.filter(u => u.role === 'parent').length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Người dùng" key="users">
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                Học sinh
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={handleCreateStudent}
                  size="small"
                  style={{ marginLeft: 8 }}
                >
                  Thêm
                </Button>
              </span>
            }
            key="students"
          >
            <Table
              columns={studentColumns}
              dataSource={students}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                Nhân viên y tế
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={handleCreateMedicalStaff}
                  size="small"
                  style={{ marginLeft: 8 }}
                >
                  Thêm
                </Button>
              </span>
            }
            key="medical-staff"
          >
            <Table
              columns={userColumns}
              dataSource={users.filter(u => ['nurse', 'doctor', 'healthcare_assistant'].includes(u.role))}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Student Modal */}
      <Modal
        title={editingStudent ? 'Chỉnh sửa học sinh' : 'Tạo học sinh mới'}
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
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Vui lòng nhập username' }]}
              >
                <Input placeholder="Nhập username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="student_id"
                label="Mã học sinh"
                rules={[{ required: true, message: 'Vui lòng nhập mã học sinh' }]}
              >
                <Input placeholder="Nhập mã học sinh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="Họ"
                rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
              >
                <Input placeholder="Nhập họ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
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
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="class_name"
                label="Lớp"
                rules={[{ required: true, message: 'Vui lòng nhập lớp' }]}
              >
                <Input placeholder="Nhập lớp" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
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
                name="date_of_birth"
                label="Ngày sinh"
              >
                <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày sinh" />
              </Form.Item>
            </Col>
          </Row>

          {!editingStudent && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingStudent ? 'Cập nhật' : 'Tạo học sinh'}
              </Button>
              <Button onClick={() => setIsStudentModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
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
                rules={[{ required: true, message: 'Vui lòng nhập username' }]}
              >
                <Input placeholder="Nhập username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="nurse">Y tá</Option>
                  <Option value="doctor">Bác sĩ</Option>
                  <Option value="healthcare_assistant">Trợ lý y tế</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="Họ"
                rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
              >
                <Input placeholder="Nhập họ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
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
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone_number"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Khoa"
              >
                <Input placeholder="Nhập khoa" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="specialization"
                label="Chuyên môn"
              >
                <Input placeholder="Nhập chuyên môn" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

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
    </div>
  );
};

export default AdminDashboard;
