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
} from 'antd';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  MedicineBoxOutlined,
  PlusOutlined,
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
const { Option } = Select;

const ParentMedicineRequests: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MedicineRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<MedicineRequest | null>(null);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', notes: '' }]);
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
        medicines: medicines.filter(med => med.name && med.dosage && med.frequency)
      };

      if (requestData.medicines.length === 0) {
        toast.error('Vui lòng điền thông tin ít nhất một loại thuốc', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      const response = await apiService.createMedicineRequestForStudent(values.student_id, requestData);
      
      if (response.success) {
        toast.success('Gửi yêu cầu thuốc thành công!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setIsModalVisible(false);
        setMedicines([{ name: '', dosage: '', frequency: '', notes: '' }]);
        form.resetFields();
        loadData(); // Reload data to refresh the list
      }
    } catch (error) {
      console.error('Error creating medicine request:', error);
      toast.error('Có lỗi xảy ra khi gửi yêu cầu thuốc. Vui lòng thử lại!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleUpdateRequest = async (values: any) => {
    if (!editingRequest) return;

    try {
      // Note: Currently there's no update API for medicine requests in parent endpoints
      // Parent can only create new requests, not update existing ones
      toast.info('Không thể chỉnh sửa yêu cầu đã gửi. Vui lòng tạo yêu cầu mới nếu cần.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setIsModalVisible(false);
      setEditingRequest(null);
      setMedicines([{ name: '', dosage: '', frequency: '', notes: '' }]);
      form.resetFields();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật yêu cầu thuốc. Vui lòng thử lại!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', notes: '' }]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length > 1) {
      const newMedicines = medicines.filter((_, i) => i !== index);
      setMedicines(newMedicines);
    }
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    const newMedicines = [...medicines];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setMedicines(newMedicines);
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
      width: 200,
      render: (_: any, record: MedicineRequest) => {
        if (record.medicines && record.medicines.length > 0) {
          return (
            <div>
              {record.medicines.map((med, idx) => (
                <div key={idx} style={{ marginBottom: '4px' }}>
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>{med.name}</div>
                  <Text style={{ fontSize: '12px', color: '#666' }}>
                    {med.dosage} - {med.frequency}
                  </Text>
                </div>
              ))}
            </div>
          );
        }
        const medicineName = record.medicine_name || 'N/A';
        return (
          <div style={{ fontWeight: 500, fontSize: '14px' }}>{medicineName}</div>
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
      width: 120,
      render: (_: any, record: MedicineRequest) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
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
            setMedicines([{ name: '', dosage: '', frequency: '', notes: '' }]);
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

      {/* Main Content - Full Width Table */}
      <Card title="Danh sách yêu cầu">
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

      {/* Create/Edit Request Modal */}
      <Modal
        title={editingRequest ? 'Chỉnh sửa yêu cầu thuốc' : 'Tạo yêu cầu thuốc mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRequest(null);
          setMedicines([{ name: '', dosage: '', frequency: '', notes: '' }]);
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

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <Text strong>Danh sách thuốc</Text>
              <Button type="dashed" onClick={addMedicine} icon={<PlusOutlined />}>
                Thêm thuốc
              </Button>
            </div>
            
            {medicines.map((medicine, index) => (
              <Card 
                key={index} 
                size="small" 
                style={{ marginBottom: '12px' }}
                title={`Thuốc ${index + 1}`}
                extra={
                  medicines.length > 1 && (
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => removeMedicine(index)}
                    />
                  )
                }
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Tên thuốc"
                      required
                    >
                      <Input 
                        placeholder="Nhập tên thuốc" 
                        value={medicine.name}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Liều dùng"
                      required
                    >
                      <Input 
                        placeholder="Ví dụ: 1 viên" 
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Tần suất sử dụng"
                      required
                    >
                      <Input 
                        placeholder="Ví dụ: 2 lần/ngày" 
                        value={medicine.frequency}
                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Ghi chú"
                    >
                      <Input 
                        placeholder="Ghi chú thêm" 
                        value={medicine.notes}
                        onChange={(e) => updateMedicine(index, 'notes', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Ngày bắt đầu"
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày bắt đầu' },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (value.isBefore(moment(), 'day')) {
                        return Promise.reject(new Error('Ngày bắt đầu không được trong quá khứ'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < moment().startOf('day')}
                  onChange={() => {
                    // Clear end date validation when start date changes
                    form.validateFields(['end_date']);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="Ngày kết thúc"
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày kết thúc' },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const startDate = form.getFieldValue('start_date');
                      if (startDate && value.isBefore(startDate, 'day')) {
                        return Promise.reject(new Error('Ngày kết thúc không được trước ngày bắt đầu'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  disabledDate={(current) => {
                    const startDate = form.getFieldValue('start_date');
                    if (startDate) {
                      return current && (current < moment().startOf('day') || current < startDate.startOf('day'));
                    }
                    return current && current < moment().startOf('day');
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

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

export default ParentMedicineRequests;
