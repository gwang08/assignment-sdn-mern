import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  Table,
  Tag,
  Typography,
  List,
  Avatar,
  message,
  Modal,
  Form,
  Input,
  Select,
  DatePicker
} from 'antd';
import {
  TeamOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  UserOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import apiService from '../../services/api';
import { Student, MedicineRequest, Campaign } from '../../types';
import { getCampaignType, getCampaignStatus, getCampaignStartDate, getCampaignRequiresConsent } from '../../utils/campaignUtils';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ParentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [medicineRequests, setMedicineRequests] = useState<MedicineRequest[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [studentsResponse, requestsResponse, campaignsResponse] = await Promise.all([
        apiService.getParentStudents(),
        apiService.getParentMedicineRequests(),
        apiService.getParentCampaigns()
      ]);

      if (studentsResponse.success && studentsResponse.data) {
        // API trả về mảng các object với format: { student: {...}, relationship: "...", is_emergency_contact: ... }
        const studentData = studentsResponse.data.map((item: any) => item.student);
        setStudents(studentData);
      }

      if (requestsResponse.success && requestsResponse.data) {
        setMedicineRequests(requestsResponse.data);
      }

      if (campaignsResponse.success && campaignsResponse.data) {
        setCampaigns(campaignsResponse.data);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMedicineRequest = async (values: any) => {
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
        setIsRequestModalVisible(false);
        form.resetFields();
        loadDashboardData();
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi gửi yêu cầu thuốc');
      }
    } catch (error) {
      console.error('Error creating medicine request:', error);
      message.error('Có lỗi xảy ra khi gửi yêu cầu thuốc');
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

  const requestColumns = [
    {
      title: 'Học sinh',
      key: 'student',
      render: (_: any, record: MedicineRequest) => {
        if (record.student) {
          return `${record.student.first_name} ${record.student.last_name}`;
        }
        const student = students.find(s => s._id === record.student_id);
        return student ? `${student.first_name} ${student.last_name}` : 'N/A';
      }
    },
    {
      title: 'Tên thuốc',
      key: 'medicine_name',
      render: (_: any, record: MedicineRequest) => {
        return record.medicine_name || 
          (record.medicines && record.medicines.length > 0 ? record.medicines[0].name : 'N/A');
      }
    },
    {
      title: 'Liều dùng',
      key: 'dosage',
      render: (_: any, record: MedicineRequest) => {
        return record.dosage || 
          (record.medicines && record.medicines.length > 0 ? record.medicines[0].dosage : 'N/A');
      }
    },
    {
      title: 'Tần suất',
      key: 'frequency',
      render: (_: any, record: MedicineRequest) => {
        return record.frequency || 
          (record.medicines && record.medicines.length > 0 ? record.medicines[0].frequency : 'N/A');
      }
    },
    {
      title: 'Thời gian',
      key: 'duration',
      render: (_: any, record: MedicineRequest) => {
        const startDate = record.start_date || record.startDate;
        const endDate = record.end_date || record.endDate;
        return (
          <div>
            <div>{startDate ? moment(startDate).format('DD/MM/YYYY') : 'N/A'}</div>
            <Text style={{ fontSize: '12px', color: '#888' }}>
              đến {endDate ? moment(endDate).format('DD/MM/YYYY') : 'N/A'}
            </Text>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: MedicineRequest) => {
        const status = record.status || 'pending';
        return (
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Dashboard Phụ huynh</Title>
          <Text type="secondary">Theo dõi sức khỏe con em</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsRequestModalVisible(true)}
        >
          Gửi thuốc cho trường
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Con em"
              value={students.length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Yêu cầu thuốc"
              value={medicineRequests.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Chiến dịch hiện tại"
              value={campaigns.filter(c => {
                const status = getCampaignStatus(c);
                return status === 'active';
              }).length}
              valueStyle={{ color: '#722ed1' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Cần xử lý"
              value={medicineRequests.filter(r => !r.status || r.status === 'pending').length + 
                     campaigns.filter(c => {
                       const status = getCampaignStatus(c);
                       const requiresConsent = getCampaignRequiresConsent(c);
                       return status === 'active' && requiresConsent;
                     }).length}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Students Cards */}
      <Card title="Con em của tôi">
        <Row gutter={[16, 16]}>
          {students.map(student => (
            <Col xs={24} sm={12} lg={8} key={student._id}>
              <Card hoverable style={{ height: '100%' }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', margin: '0 auto' }} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      {student.first_name} {student.last_name}
                    </Title>
                    <Text type="secondary">{student.class_name}</Text>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Sức khỏe:</Text>
                      <Tag color="green">Tốt</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Thuốc:</Text>
                      <Text>{medicineRequests.filter(r => 
                        (r.student_id === student._id || (r.student && r.student._id === student._id)) && 
                        r.status === 'approved'
                      ).length}</Text>
                    </div>
                  </div>
                  <Button type="primary" block>
                    Xem chi tiết
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Medicine Requests and Campaigns */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Yêu cầu gửi thuốc" extra={<Button type="link">Xem tất cả</Button>}>
            <Table
              dataSource={medicineRequests}
              columns={requestColumns}
              pagination={{ pageSize: 5 }}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Chiến dịch y tế cần xử lý">
            <List
              dataSource={campaigns.filter(c => {
                const status = getCampaignStatus(c);
                const requiresConsent = getCampaignRequiresConsent(c);
                return status === 'active' && requiresConsent;
              })}
              renderItem={(campaign) => (
                <List.Item
                  actions={[
                    <Button type="primary" size="small">Đồng ý</Button>,
                    <Button size="small">Từ chối</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<CalendarOutlined />} 
                        style={{
                          backgroundColor: getCampaignType(campaign) === 'Vaccination' ? '#1890ff' :
                                          getCampaignType(campaign) === 'Checkup' ? '#52c41a' : '#722ed1'
                        }}
                      />
                    }
                    title={campaign.title}
                    description={
                      <div>
                        <Text type="secondary">{campaign.description || 'Không có mô tả'}</Text>
                        <br />
                        <Text style={{ fontSize: '14px' }}>
                          Ngày: {moment(getCampaignStartDate(campaign)).format('DD/MM/YYYY')}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Card title="Hoạt động gần đây">
        <List
          dataSource={[
            {
              title: 'Yêu cầu gửi thuốc Paracetamol cho Nguyễn Văn A đã được duyệt',
              time: '2 giờ trước',
              type: 'success'
            },
            {
              title: 'Chiến dịch tiêm vaccine HPV đã bắt đầu - Cần xác nhận đồng ý',
              time: '1 ngày trước',
              type: 'warning'
            },
            {
              title: 'Kết quả kiểm tra sức khỏe định kỳ của Nguyễn Văn A đã có',
              time: '3 ngày trước',
              type: 'info'
            }
          ]}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={
                      item.type === 'success' ? <CheckCircleOutlined /> :
                      item.type === 'warning' ? <ExclamationCircleOutlined /> : <ClockCircleOutlined />
                    }
                    className={
                      item.type === 'success' ? 'bg-green-500' :
                      item.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    }
                  />
                }
                title={item.title}
                description={item.time}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Medicine Request Modal */}
      <Modal
        title="Gửi yêu cầu thuốc cho trường"
        open={isRequestModalVisible}
        onCancel={() => {
          setIsRequestModalVisible(false);
          form.resetFields();
        }}
        width={600}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleCreateMedicineRequest}
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
                <Input placeholder="Ví dụ: 1 viên" />
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
            <Button onClick={() => setIsRequestModalVisible(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Gửi yêu cầu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ParentDashboard;
