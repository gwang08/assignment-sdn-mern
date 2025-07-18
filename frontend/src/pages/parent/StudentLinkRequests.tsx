import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Tag,
  Typography,
  message,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Statistic,
  Avatar,
  Descriptions,
  Divider,
} from 'antd';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  UserAddOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { Student } from '../../types';
import apiService from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface StudentLinkRequest {
  _id: string;
  student: Student;
  parent: string;
  relationship: string;
  is_emergency_contact: boolean;
  is_active: boolean;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const StudentLinkRequests: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [linkRequests, setLinkRequests] = useState<StudentLinkRequest[]>([]);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StudentLinkRequest | null>(null);
  const [requestForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load existing link requests
      const requestsResponse = await apiService.getLinkRequests();
      if (requestsResponse.success && requestsResponse.data) {
        setLinkRequests(requestsResponse.data);
      }

      // For creating new requests, we might need to load all available students
      // This would typically come from an admin endpoint to search students
      // For now, we'll use the existing linked students as reference
      
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (values: any) => {
    try {
      const requestData = {
        studentId: values.studentId, // This should be student_id (e.g., SE1701), not MongoDB ObjectId
        relationship: values.relationship,
        is_emergency_contact: values.is_emergency_contact || false,
        notes: values.notes || ''
      };

      const response = await apiService.requestStudentLink(requestData);

      if (response.success) {
        toast.success('Yêu cầu liên kết đã được gửi thành công!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setIsRequestModalVisible(false);
        requestForm.resetFields();
        loadData(); // Reload to show new request
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusText = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Đã từ chối'
    };
    return statusText[status as keyof typeof statusText] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      approved: <CheckCircleOutlined />,
      rejected: <CloseCircleOutlined />
    };
    return icons[status as keyof typeof icons] || <ClockCircleOutlined />;
  };

  const getRelationshipText = (relationship: string) => {
    const relationshipText = {
      'Father': 'Bố',
      'Mother': 'Mẹ',
      'Guardian': 'Người giám hộ',
      'Grandfather': 'Ông',
      'Grandmother': 'Bà',
      'Uncle': 'Chú/Bác',
      'Aunt': 'Cô/Dì',
      'Other': 'Khác'
    };
    return relationshipText[relationship as keyof typeof relationshipText] || relationship;
  };

  const columns = [
    {
      title: 'Học sinh',
      key: 'student',
      width: 200,
      render: (_: any, record: StudentLinkRequest) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.student.first_name} {record.student.last_name}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Lớp: {record.student.class_name}
            </Text>
            {record.student.student_id && (
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  MSHS: {record.student.student_id}
                </Text>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Mối quan hệ',
      dataIndex: 'relationship',
      key: 'relationship',
      width: 120,
      render: (relationship: string, record: StudentLinkRequest) => (
        <div>
          <Tag color="blue">{getRelationshipText(relationship)}</Tag>
          {record.is_emergency_contact && (
            <div style={{ marginTop: '4px' }}>
              <Tag color="red" icon={<PhoneOutlined />} style={{ fontSize: '11px' }}>
                Liên hệ khẩn cấp
              </Tag>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <Text style={{ fontSize: '13px' }}>
          {moment(date).format('DD/MM/YYYY')}
        </Text>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_: any, record: StudentLinkRequest) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => {
            setSelectedRequest(record);
            setIsDetailModalVisible(true);
          }}
        >
          Chi tiết
        </Button>
      )
    }
  ];

  const renderRequestDetail = () => {
    if (!selectedRequest) return null;

    return (
      <Modal
        title="Chi tiết yêu cầu liên kết"
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedRequest(null);
        }}
        width={700}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        <div style={{ padding: '16px 0' }}>
          {/* Student Info Section */}
          <Card 
            title="Thông tin học sinh" 
            size="small" 
            style={{ marginBottom: '16px' }}
            extra={
              <Tag 
                color={getStatusColor(selectedRequest.status)} 
                icon={getStatusIcon(selectedRequest.status)}
                style={{ fontSize: '13px', padding: '6px 12px', borderRadius: '6px' }}
              >
                {getStatusText(selectedRequest.status)}
              </Tag>
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar size={48} icon={<UserOutlined />} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                  {selectedRequest.student.first_name} {selectedRequest.student.last_name}
                </div>
                <div style={{ color: '#666', marginBottom: '2px' }}>
                  Lớp: {selectedRequest.student.class_name}
                </div>
                <div style={{ color: '#666', fontSize: '13px' }}>
                  MSHS: {selectedRequest.student.student_id || 'Chưa có'}
                </div>
              </div>
            </div>
          </Card>

          {/* Relationship Info */}
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={12}>
              <Card title="Mối quan hệ" size="small">
                <div style={{ textAlign: 'center' }}>
                  <Tag color="blue" style={{ fontSize: '13px', padding: '4px 12px' }}>
                    {getRelationshipText(selectedRequest.relationship)}
                  </Tag>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Liên hệ khẩn cấp" size="small">
                <div style={{ textAlign: 'center' }}>
                  {selectedRequest.is_emergency_contact ? (
                    <Tag color="red" icon={<PhoneOutlined />} style={{ fontSize: '13px', padding: '4px 12px' }}>
                      Có
                    </Tag>
                  ) : (
                    <Tag color="default" style={{ fontSize: '13px', padding: '4px 12px' }}>
                      Không
                    </Tag>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Time Info */}
          <Descriptions 
            bordered 
            size="small" 
            column={2}
            style={{ marginBottom: '16px' }}
          >
            <Descriptions.Item label="Ngày tạo">
              {moment(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật cuối">
              {moment(selectedRequest.updatedAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái hoạt động" span={2}>
              {selectedRequest.is_active ? (
                <Tag color="green">Đang hoạt động</Tag>
              ) : (
                <Tag color="default">Không hoạt động</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>

          {/* Notes Section */}
          {selectedRequest.notes && (
            <Card title="Ghi chú" size="small">
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f9f9f9', 
                borderRadius: '6px',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {selectedRequest.notes}
              </div>
            </Card>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Liên kết học sinh</Title>
          <Text type="secondary">Quản lý yêu cầu liên kết với học sinh</Text>
        </div>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setIsRequestModalVisible(true)}
        >
          Yêu cầu liên kết mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng yêu cầu"
              value={linkRequests.length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={linkRequests.filter(r => r.status === 'pending').length}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={linkRequests.filter(r => r.status === 'approved').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Liên hệ khẩn cấp"
              value={linkRequests.filter(r => r.is_emergency_contact && r.status === 'approved').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<PhoneOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content - Full Width Table */}
      <Card title="Danh sách yêu cầu liên kết">
        <style>
          {`
            .ant-table-tbody > tr:hover > td,
            .ant-table-tbody > tr:hover {
              background-color: #ffffff !important;
            }
            .ant-table-tbody > tr > td {
              background-color: #ffffff !important;
            }
          `}
        </style>
        <Table
          columns={columns}
          dataSource={linkRequests}
          rowKey="_id"
          loading={loading}
          size="middle"
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`
          }}
        />
      </Card>

      {/* Create Request Modal */}
      <Modal
        title="Tạo yêu cầu liên kết học sinh"
        open={isRequestModalVisible}
        onCancel={() => {
          setIsRequestModalVisible(false);
          requestForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={requestForm}
          onFinish={handleCreateRequest}
          layout="vertical"
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="studentId"
            label="Mã số học sinh (MSHS)"
            rules={[{ required: true, message: 'Vui lòng nhập mã số học sinh' }]}
          >
            <Input 
              placeholder="Nhập mã số học sinh (VD: SE1701)"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="relationship"
            label="Mối quan hệ"
            rules={[{ required: true, message: 'Vui lòng chọn mối quan hệ' }]}
          >
            <Select placeholder="Chọn mối quan hệ với học sinh">
              <Option value="Father">Bố</Option>
              <Option value="Mother">Mẹ</Option>
              <Option value="Guardian">Người giám hộ</Option>
              <Option value="Grandfather">Ông</Option>
              <Option value="Grandmother">Bà</Option>
              <Option value="Uncle">Chú/Bác</Option>
              <Option value="Aunt">Cô/Dì</Option>
              <Option value="Other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="is_emergency_contact"
            label="Liên hệ khẩn cấp"
            valuePropName="checked"
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Ghi chú thêm về mối quan hệ (nếu có)"
            />
          </Form.Item>

          <Divider />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={() => setIsRequestModalVisible(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Gửi yêu cầu
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Request Detail Modal */}
      {renderRequestDetail()}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default StudentLinkRequests;
