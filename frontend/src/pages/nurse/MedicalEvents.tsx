import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Alert,
  Drawer,
  Descriptions,
  message
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import apiService from '../../services/api';
import { MedicalEvent, Student } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const MedicalEventsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MedicalEvent | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [eventsResponse, studentsResponse] = await Promise.all([
        apiService.getMedicalEvents(),
        apiService.getStudents()
      ]);

      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data);
      }

      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 'N/A';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      critical: 'magenta'
    };
    return colors[severity as keyof typeof colors] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'red',
      in_progress: 'blue',
      resolved: 'green',
      referred: 'purple'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const handleCreate = () => {
    setEditingEvent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (event: MedicalEvent) => {
    setEditingEvent(event);
    form.setFieldsValue({
      ...event,
      createdAt: moment(event.createdAt)
    });
    setIsModalVisible(true);
  };

  const handleView = (event: MedicalEvent) => {
    setSelectedEvent(event);
    setIsDetailDrawerVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const eventData = {
        ...values,
        symptoms: values.symptoms ? values.symptoms.split(',').map((s: string) => s.trim()) : [],
        medications_given: values.medications_given ? values.medications_given.split(',').map((s: string) => s.trim()) : []
      };

      if (editingEvent) {
        const response = await apiService.updateMedicalEvent(editingEvent._id, eventData);
        if (response.success) {
          message.success('Cập nhật sự kiện y tế thành công');
          loadData();
        }
      } else {
        const response = await apiService.createMedicalEvent(eventData);
        if (response.success) {
          message.success('Tạo sự kiện y tế thành công');
          loadData();
        }
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu sự kiện y tế');
    }
  };

  const columns: ColumnsType<MedicalEvent> = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf(),
    },
    {
      title: 'Học sinh',
      dataIndex: 'student_id',
      key: 'student_id',
      width: 150,
      render: (studentId: string) => (
        <div>
          <div className="font-medium">{getStudentName(studentId)}</div>
          <Text className="text-xs text-gray-500">ID: {studentId.slice(-6)}</Text>
        </div>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (title: string, record: MedicalEvent) => (
        <div>
          <div className="font-medium">{title}</div>
          <Tag color={getSeverityColor(record.severity)} className="mt-1">
            {record.severity}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'event_type',
      key: 'event_type',
      width: 120,
      render: (type: string) => {
        const typeLabels = {
          accident: 'Tai nạn',
          illness: 'Ốm đau',
          injury: 'Chấn thương',
          emergency: 'Cấp cứu',
          other: 'Khác'
        };
        return <Tag>{typeLabels[type as keyof typeof typeLabels] || type}</Tag>;
      },
      filters: [
        { text: 'Tai nạn', value: 'accident' },
        { text: 'Ốm đau', value: 'illness' },
        { text: 'Chấn thương', value: 'injury' },
        { text: 'Cấp cứu', value: 'emergency' },
        { text: 'Khác', value: 'other' },
      ],
      onFilter: (value, record) => record.event_type === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusLabels = {
          open: 'Mở',
          in_progress: 'Đang xử lý',
          resolved: 'Đã giải quyết',
          referred: 'Chuyển tiếp'
        };
        return (
          <Tag color={getStatusColor(status)}>
            {statusLabels[status as keyof typeof statusLabels] || status}
          </Tag>
        );
      },
      filters: [
        { text: 'Mở', value: 'open' },
        { text: 'Đang xử lý', value: 'in_progress' },
        { text: 'Đã giải quyết', value: 'resolved' },
        { text: 'Chuyển tiếp', value: 'referred' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Theo dõi',
      dataIndex: 'follow_up_required',
      key: 'follow_up_required',
      width: 100,
      render: (followUp: boolean) => (
        <Tag color={followUp ? 'orange' : 'green'}>
          {followUp ? 'Cần theo dõi' : 'Không cần'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record: MedicalEvent) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title="Xem chi tiết"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="m-0">
            <MedicineBoxOutlined className="mr-2" />
            Quản lý Sự kiện Y tế
          </Title>
          <Text type="secondary">
            Ghi nhận và theo dõi các sự kiện y tế trong trường
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          Tạo sự kiện mới
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={events}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: events.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} sự kiện`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingEvent ? 'Chỉnh sửa sự kiện y tế' : 'Tạo sự kiện y tế mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={800}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="student_id"
                label="Học sinh"
                rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn học sinh"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      ?.toLowerCase()
                      ?.includes(input.toLowerCase())
                  }
                >
                  {students.map(student => (
                    <Option key={student._id} value={student._id}>
                      {student.first_name} {student.last_name} - {student.class_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="event_type"
                label="Loại sự kiện"
                rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện' }]}
              >
                <Select placeholder="Chọn loại sự kiện">
                  <Option value="accident">Tai nạn</Option>
                  <Option value="illness">Ốm đau</Option>
                  <Option value="injury">Chấn thương</Option>
                  <Option value="emergency">Cấp cứu</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề sự kiện" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={4} placeholder="Mô tả chi tiết về sự kiện y tế" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="severity"
                label="Mức độ nghiêm trọng"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
              >
                <Select placeholder="Chọn mức độ">
                  <Option value="low">Thấp</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="high">Cao</Option>
                  <Option value="critical">Nghiêm trọng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="open">Mở</Option>
                  <Option value="in_progress">Đang xử lý</Option>
                  <Option value="resolved">Đã giải quyết</Option>
                  <Option value="referred">Chuyển tiếp</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="symptoms"
            label="Triệu chứng"
            help="Nhập các triệu chứng, phân cách bằng dấu phẩy"
          >
            <Input placeholder="Ví dụ: đau đầu, sốt, buồn nôn" />
          </Form.Item>

          <Form.Item
            name="treatment_provided"
            label="Xử trí đã thực hiện"
            rules={[{ required: true, message: 'Vui lòng nhập xử trí' }]}
          >
            <TextArea rows={3} placeholder="Mô tả xử trí đã thực hiện" />
          </Form.Item>

          <Form.Item
            name="medications_given"
            label="Thuốc đã sử dụng"
            help="Nhập tên thuốc, phân cách bằng dấu phẩy"
          >
            <Input placeholder="Ví dụ: Paracetamol, Vitamin C" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="follow_up_required"
                label="Cần theo dõi"
              >
                <Select placeholder="Chọn">
                  <Option value={true}>Có</Option>
                  <Option value={false}>Không</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="parent_notified"
                label="Đã thông báo phụ huynh"
              >
                <Select placeholder="Chọn">
                  <Option value={true}>Đã thông báo</Option>
                  <Option value={false}>Chưa thông báo</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="follow_up_notes"
            label="Ghi chú theo dõi"
          >
            <TextArea rows={2} placeholder="Ghi chú cho việc theo dõi" />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsModalVisible(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingEvent ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title="Chi tiết sự kiện y tế"
        placement="right"
        size="large"
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
      >
        {selectedEvent && (
          <div className="space-y-6">
            <Descriptions title="Thông tin cơ bản" bordered column={1}>
              <Descriptions.Item label="Học sinh">
                <div className="flex items-center space-x-2">
                  <UserOutlined />
                  <span>{getStudentName(selectedEvent.student_id)}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                <div className="flex items-center space-x-2">
                  <ClockCircleOutlined />
                  <span>{moment(selectedEvent.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Loại sự kiện">
                <Tag>{selectedEvent.event_type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ">
                <Tag color={getSeverityColor(selectedEvent.severity)}>
                  {selectedEvent.severity}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedEvent.status)}>
                  {selectedEvent.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Card title="Mô tả chi tiết">
              <Text>{selectedEvent.description}</Text>
            </Card>

            {selectedEvent.symptoms.length > 0 && (
              <Card title="Triệu chứng">
                <Space wrap>
                  {selectedEvent.symptoms.map((symptom, index) => (
                    <Tag key={index}>{symptom}</Tag>
                  ))}
                </Space>
              </Card>
            )}

            <Card title="Xử trí">
              <Text>{selectedEvent.treatment_provided}</Text>
            </Card>

            {selectedEvent.medications_given.length > 0 && (
              <Card title="Thuốc đã sử dụng">
                <Space wrap>
                  {selectedEvent.medications_given.map((med, index) => (
                    <Tag key={index} color="blue">{med}</Tag>
                  ))}
                </Space>
              </Card>
            )}

            {selectedEvent.follow_up_required && (
              <Alert
                message="Cần theo dõi"
                description={selectedEvent.follow_up_notes || 'Sự kiện này cần được theo dõi thêm'}
                type="warning"
                showIcon
              />
            )}

            <div className="flex space-x-2">
              <Button type="primary" onClick={() => handleEdit(selectedEvent)}>
                Chỉnh sửa
              </Button>
              <Button>In báo cáo</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MedicalEventsPage;
