import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Tag,
  Typography,
  Avatar,
  message,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Statistic,
  Space,

  List,
  Popconfirm
} from 'antd';
import {
  MedicineBoxOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { Student, MedicineRequest } from '../../types';
import apiService from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ParentMedicineRequests: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MedicineRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<MedicineRequest | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [requestsResponse, studentsResponse] = await Promise.all([
        apiService.getParentMedicineRequests(),
        apiService.getParentStudents()
      ]);

      if (requestsResponse.success && requestsResponse.data) {
        setRequests(requestsResponse.data);
      }

      if (studentsResponse.success && studentsResponse.data) {
        // API trả về mảng các object với format: { student: {...}, relationship: "...", is_emergency_contact: ... }
        const studentData = studentsResponse.data.map((item: any) => item.student);
        setStudents(studentData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      completed: 'blue'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusText = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Bị từ chối',
      completed: 'Hoàn thành'
    };
    return statusText[status as keyof typeof statusText] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      approved: <CheckCircleOutlined />,
      rejected: <ExclamationCircleOutlined />,
      completed: <CheckCircleOutlined />
    };
    return icons[status as keyof typeof icons] || <ClockCircleOutlined />;
  };

  const getStudentName = (request: MedicineRequest) => {
    if (request.student) {
      return `${request.student.first_name} ${request.student.last_name}`;
    }
    return 'N/A';
  };

  const getStudentClass = (request: MedicineRequest) => {
    if (request.student) {
      return request.student.class_name;
    }
    return 'N/A';
  };

  const handleCreateRequest = async (values: any) => {
    try {
      const requestData = {
        startDate: values.start_date.format('YYYY-MM-DD'),
        endDate: values.end_date.format('YYYY-MM-DD'),
        medicines: [{
          name: values.medicine_name,
          dosage: values.dosage,
          frequency: values.frequency,
          notes: values.instructions
        }]
      };

      const response = await apiService.createMedicineRequestForStudent(values.student_id, requestData);
      
      if (response.success) {
        message.success('Gửi yêu cầu thuốc thành công');
        setIsModalVisible(false);
        form.resetFields();
        loadData(); // Reload data to refresh the list
      }
    } catch (error) {
      console.error('Error creating medicine request:', error);
      message.error('Có lỗi xảy ra khi gửi yêu cầu thuốc');
    }
  };

  const handleUpdateRequest = async (values: any) => {
    if (!editingRequest) return;

    try {
      // Note: Currently there's no update API for medicine requests in parent endpoints
      // Parent can only create new requests, not update existing ones
      message.info('Không thể chỉnh sửa yêu cầu đã gửi. Vui lòng tạo yêu cầu mới nếu cần.');
      setIsModalVisible(false);
      setEditingRequest(null);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật yêu cầu thuốc');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      // Note: Currently there's no delete API for medicine requests in parent endpoints
      // Parent cannot delete requests once submitted
      message.info('Không thể xóa yêu cầu đã gửi. Vui lòng liên hệ y tế trường nếu cần hủy.');
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa yêu cầu thuốc');
    }
  };

  const handleEditRequest = (request: MedicineRequest) => {
    setEditingRequest(request);
    form.setFieldsValue({
      ...request,
      start_date: moment(request.start_date),
      end_date: moment(request.end_date)
    });
    setIsModalVisible(true);
  };

  const handleViewDetail = (request: MedicineRequest) => {
    setSelectedRequest(request);
    setIsDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Học sinh',
      key: 'student',
      width: 160,
      render: (_: any, record: MedicineRequest) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: '14px', lineHeight: '18px' }}>
                {getStudentName(record)}
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>{getStudentClass(record)}</Text>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Tên thuốc',
      key: 'medicine_name',
      width: 150,
      render: (_: any, record: MedicineRequest) => {
        const medicineName = record.medicine_name || 
          (record.medicines && record.medicines.length > 0 ? record.medicines[0].name : 'N/A');
        return (
          <div style={{ fontWeight: 500, fontSize: '14px' }}>{medicineName}</div>
        );
      }
    },
    {
      title: 'Liều dùng',
      key: 'dosage',
      width: 100,
      render: (_: any, record: MedicineRequest) => {
        const dosage = record.dosage || 
          (record.medicines && record.medicines.length > 0 ? record.medicines[0].dosage : 'N/A');
        return (
          <div style={{ fontSize: '13px' }}>{dosage}</div>
        );
      }
    },
    {
      title: 'Tần suất',
      key: 'frequency',
      width: 100,
      render: (_: any, record: MedicineRequest) => {
        const frequency = record.frequency || 
          (record.medicines && record.medicines.length > 0 ? record.medicines[0].frequency : 'N/A');
        return (
          <div style={{ fontSize: '13px' }}>{frequency}</div>
        );
      }
    },
    {
      title: 'Thời gian',
      key: 'duration',
      width: 130,
      render: (_: any, record: MedicineRequest) => {
        const startDate = record.start_date || record.startDate;
        const endDate = record.end_date || record.endDate;
        return (
          <div style={{ fontSize: '13px' }}>
            <div style={{ fontWeight: 500 }}>
              {startDate ? moment(startDate).format('DD/MM/YYYY') : 'N/A'}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              đến {endDate ? moment(endDate).format('DD/MM/YYYY') : 'N/A'}
            </Text>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_: any, record: MedicineRequest) => {
        const status = record.status || 'pending';
        return (
          <Tag 
            icon={getStatusIcon(status)} 
            color={getStatusColor(status)}
            style={{ fontSize: '11px', padding: '0 4px' }}
          >
            {getStatusText(status)}
          </Tag>
        );
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (date: string) => (
        <div style={{ fontSize: '13px' }}>
          {moment(date).format('DD/MM/YYYY')}
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_: any, record: MedicineRequest) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {(!record.status || record.status === 'pending') && (
            <>
              <Button
                type="default"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEditRequest(record)}
              >
                Sửa
              </Button>
              <Popconfirm
                title="Bạn có chắc muốn xóa yêu cầu này?"
                onConfirm={() => handleDeleteRequest(record._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button
                  type="default"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                >
                  Xóa
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ];

  const renderRequestDetail = () => {
    if (!selectedRequest) return null;

    const status = selectedRequest.status || 'pending';
    const medicineName = selectedRequest.medicine_name || 
      (selectedRequest.medicines && selectedRequest.medicines.length > 0 ? selectedRequest.medicines[0].name : 'N/A');

    return (
      <Modal
        title={`Chi tiết yêu cầu thuốc - ${medicineName}`}
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedRequest(null);
        }}
        width={600}
        footer={null}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Trạng thái: </Text>
                <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
                  {getStatusText(status)}
                </Tag>
              </div>
              <Text type="secondary">
                Tạo: {moment(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm')}
              </Text>
            </div>
          </Card>

          <Card title="Thông tin học sinh" size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div>
                <div style={{ fontWeight: 500 }}>
                  {getStudentName(selectedRequest)}
                </div>
                <Text type="secondary">{getStudentClass(selectedRequest)}</Text>
              </div>
            </div>
          </Card>

          <Card title="Thông tin thuốc" size="small">
            {selectedRequest.medicines && selectedRequest.medicines.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedRequest.medicines.map((medicine, index) => (
                  <div key={index} style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                    <div><Text strong>Tên thuốc:</Text> {medicine.name}</div>
                    <div><Text strong>Liều dùng:</Text> {medicine.dosage}</div>
                    <div><Text strong>Tần suất:</Text> {medicine.frequency}</div>
                    {medicine.notes && <div><Text strong>Ghi chú:</Text> {medicine.notes}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><Text strong>Tên thuốc:</Text> {selectedRequest.medicine_name || 'N/A'}</div>
                <div><Text strong>Liều dùng:</Text> {selectedRequest.dosage || 'N/A'}</div>
                <div><Text strong>Tần suất:</Text> {selectedRequest.frequency || 'N/A'}</div>
                <div><Text strong>Thời gian điều trị:</Text> {selectedRequest.duration || 'N/A'}</div>
              </div>
            )}
            
            <div style={{ marginTop: '12px' }}>
              <Text strong>Thời gian sử dụng:</Text> {' '}
              {selectedRequest.start_date || selectedRequest.startDate ? 
                moment(selectedRequest.start_date || selectedRequest.startDate).format('DD/MM/YYYY') : 'N/A'} - {' '}
              {selectedRequest.end_date || selectedRequest.endDate ? 
                moment(selectedRequest.end_date || selectedRequest.endDate).format('DD/MM/YYYY') : 'N/A'}
            </div>
          </Card>

          {selectedRequest.instructions && (
            <Card title="Hướng dẫn sử dụng" size="small">
              <div style={{ padding: '8px', backgroundColor: '#f6f6f6', borderRadius: '4px' }}>
                {selectedRequest.instructions}
              </div>
            </Card>
          )}

          {selectedRequest.notes && (
            <Card title="Ghi chú" size="small">
              <div style={{ padding: '8px', backgroundColor: '#f6f6f6', borderRadius: '4px' }}>
                {selectedRequest.notes}
              </div>
            </Card>
          )}

          {selectedRequest.approved_by && (
            <Card title="Thông tin duyệt" size="small">
              <div style={{ 
                padding: '8px', 
                backgroundColor: '#f0f5ff', 
                borderRadius: '4px' 
              }}>
                <Text strong>Được duyệt bởi:</Text> {selectedRequest.approved_by}<br />
                {selectedRequest.approved_at && (
                  <>
                    <Text strong>Thời gian duyệt:</Text> {moment(selectedRequest.approved_at).format('DD/MM/YYYY HH:mm')}
                  </>
                )}
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
          <Title level={2} style={{ margin: 0 }}>Yêu cầu gửi thuốc</Title>
          <Text type="secondary">Quản lý yêu cầu gửi thuốc cho trường</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingRequest(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Tạo yêu cầu mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng yêu cầu"
              value={requests.length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={requests.filter(r => !r.status || r.status === 'pending').length}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={requests.filter(r => r.status === 'approved').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={requests.filter(r => r.status === 'completed').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Requests Summary */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Danh sách yêu cầu">
            <Table
              columns={columns}
              dataSource={requests}
              rowKey="_id"
              loading={loading}
              scroll={{ x: 1000 }}
              size="middle"
              pagination={{
                total: requests.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Yêu cầu gần đây">
            <List
              dataSource={requests.slice(0, 5)}
              renderItem={(request) => {
                const status = request.status || 'pending';
                const medicineName = request.medicine_name || 
                  (request.medicines && request.medicines.length > 0 ? request.medicines[0].name : 'N/A');
                return (
                  <List.Item
                    actions={[
                      <Button type="link" size="small" onClick={() => handleViewDetail(request)}>
                        Xem
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={getStatusIcon(status)} 
                          style={{ backgroundColor: getStatusColor(status) }}
                        />
                      }
                      title={medicineName}
                      description={
                        <div>
                          <div>{getStudentName(request)}</div>
                          <Tag color={getStatusColor(status)}>
                            {getStatusText(status)}
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Create/Edit Request Modal */}
      <Modal
        title={editingRequest ? 'Chỉnh sửa yêu cầu thuốc' : 'Tạo yêu cầu thuốc mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRequest(null);
          form.resetFields();
        }}
        width={600}
        footer={null}
      >
        <Form
          form={form}
          onFinish={editingRequest ? handleUpdateRequest : handleCreateRequest}
          layout="vertical"
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="student_id"
            label="Chọn con em"
            rules={[{ required: true, message: 'Vui lòng chọn con em' }]}
          >
            <Select placeholder="Chọn con em">
              {students.map(student => (
                <Option key={student._id} value={student._id}>
                  {student.first_name} {student.last_name} - {student.class_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="medicine_name"
                label="Tên thuốc"
                rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
              >
                <Input placeholder="Nhập tên thuốc" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dosage"
                label="Liều dùng"
                rules={[{ required: true, message: 'Vui lòng nhập liều dùng' }]}
              >
                <Input placeholder="Ví dụ: 500mg" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="frequency"
                label="Tần suất sử dụng"
                rules={[{ required: true, message: 'Vui lòng nhập tần suất' }]}
              >
                <Input placeholder="Ví dụ: 2 lần/ngày" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Thời gian điều trị"
                rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
              >
                <Input placeholder="Ví dụ: 7 ngày" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Ngày bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="Ngày kết thúc"
                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="instructions"
            label="Hướng dẫn sử dụng"
            rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn' }]}
          >
            <TextArea rows={3} placeholder="Nhập hướng dẫn chi tiết về cách sử dụng thuốc" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú thêm"
          >
            <TextArea rows={2} placeholder="Ghi chú thêm (nếu có)" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={() => setIsModalVisible(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingRequest ? 'Cập nhật' : 'Tạo yêu cầu'}
            </Button>
          </div>
        </Form>
      </Modal>

      {renderRequestDetail()}
    </div>
  );
};

export default ParentMedicineRequests;
