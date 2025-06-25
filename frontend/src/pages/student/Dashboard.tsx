import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Typography, 
  Space,
  List,
  Avatar,
  Alert,
  Timeline,
  Descriptions
} from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  HeartOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { MedicalEvent, Campaign, HealthProfile } from '../../types';

const { Title, Text } = Typography;

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalEvent[]>([]);
  const [upcomingCampaigns, setUpcomingCampaigns] = useState<Campaign[]>([]);
  const [medicineRequests, setMedicineRequests] = useState<any[]>([]);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Load student's health profile
      try {
        if (user?._id) {
          const profileResponse = await apiService.getHealthProfile(user._id);
          if (profileResponse.success && profileResponse.data) {
            setHealthProfile(profileResponse.data);
          }
        }
      } catch (error) {
        console.log('No health profile found for student');
      }

      // Load medical events/history
      try {
        const eventsResponse = await apiService.getMedicalEvents();
        if (eventsResponse.success && eventsResponse.data) {
          // Filter events for current student
          const studentEvents = eventsResponse.data.filter(event => event.student_id === user?._id);
          setMedicalHistory(studentEvents);
        }
      } catch (error) {
        console.log('No medical events found');
        setMedicalHistory([]);
      }

      // Load upcoming campaigns
      try {
        const campaignsResponse = await apiService.getCampaigns();
        if (campaignsResponse.success && campaignsResponse.data) {
          const activeCampaigns = campaignsResponse.data.filter(campaign => campaign.status === 'active');
          setUpcomingCampaigns(activeCampaigns);
        }
      } catch (error) {
        console.log('No campaigns found');
        setUpcomingCampaigns([]);
      }

      // Load medicine requests (placeholder for now)
      setMedicineRequests([]);

    } catch (error) {
      console.error('Error loading student dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Khám định kỳ': 'blue',
      'Tiêm chủng': 'green',
      'Khám bệnh': 'orange',
      'Cấp cứu': 'red',
      'Tư vấn': 'purple',
      'Khác': 'default'
    };
    return colors[type] || 'default';
  };

  const getCampaignStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Đang diễn ra': 'green',
      'Sắp diễn ra': 'blue',
      'Đã kết thúc': 'default'
    };
    return colors[status] || 'default';
  };

  const medicalEventColumns = [
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'event_type',
      key: 'event_type',
      render: (type: string) => <Tag color={getEventTypeColor(type)}>{type}</Tag>
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getEventTypeColor(status)}>{status}</Tag>
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>
          <UserOutlined className="mr-2" />
          Bảng điều khiển học sinh
        </Title>
        <Text type="secondary">
          Chào mừng {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'bạn'}! Theo dõi thông tin sức khỏe và các hoạt động y tế.
        </Text>
      </div>

      {/* Overview Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hồ sơ sức khỏe"
              value={healthProfile ? 1 : 0}
              prefix={<HeartOutlined />}
              suffix="/ 1"
              valueStyle={{ color: healthProfile ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Lịch sử khám"
              value={medicalHistory.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chiến dịch tham gia"
              value={upcomingCampaigns.length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Yêu cầu thuốc"
              value={medicineRequests.length}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Health Profile */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <HeartOutlined />
                <span>Hồ sơ sức khỏe</span>
              </Space>
            }
            loading={loading}
          >
            {healthProfile ? (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Tình trạng thị lực">
                  {healthProfile.vision_status || 'Chưa xác định'}
                </Descriptions.Item>
                <Descriptions.Item label="Tình trạng thính lực">
                  {healthProfile.hearing_status || 'Chưa cập nhật'}
                </Descriptions.Item>
                <Descriptions.Item label="Dị ứng">
                  {healthProfile.allergies && healthProfile.allergies.length > 0 ? (
                    <div>
                      {healthProfile.allergies.map((allergy: string, index: number) => (
                        <Tag key={index} color="red">{allergy}</Tag>
                      ))}
                    </div>
                  ) : (
                    'Không có dị ứng'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Tiền sử bệnh">
                  {healthProfile.medical_history && healthProfile.medical_history.length > 0 ? 
                    healthProfile.medical_history.join(', ') : 
                    'Không có tiền sử bệnh đặc biệt'
                  }
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Alert
                message="Chưa có hồ sơ sức khỏe"
                description="Bạn chưa có hồ sơ sức khỏe. Vui lòng liên hệ phụ huynh hoặc y tá để tạo hồ sơ."
                type="warning"
                icon={<ExclamationCircleOutlined />}
              />
            )}
          </Card>
        </Col>

        {/* Upcoming Campaigns */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                <span>Chiến dịch y tế</span>
              </Space>
            }
            loading={loading}
          >
            {upcomingCampaigns.length > 0 ? (
              <List
                size="small"
                dataSource={upcomingCampaigns.slice(0, 5)}
                renderItem={(campaign) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<CalendarOutlined />} />}
                      title={campaign.title}
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary">{campaign.description}</Text>
                          <Space>
                            <Tag color={getCampaignStatusColor(campaign.status)}>
                              {campaign.status}
                            </Tag>
                            <Text type="secondary">
                              {new Date(campaign.start_date).toLocaleDateString('vi-VN')} - 
                              {new Date(campaign.end_date).toLocaleDateString('vi-VN')}
                            </Text>
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Alert
                message="Không có chiến dịch nào"
                description="Hiện tại không có chiến dịch y tế nào đang diễn ra."
                type="info"
              />
            )}
          </Card>
        </Col>

        {/* Medical History */}
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                <span>Lịch sử khám bệnh</span>
              </Space>
            }
            loading={loading}
          >
            {medicalHistory.length > 0 ? (
              <Table
                dataSource={medicalHistory}
                columns={medicalEventColumns}
                pagination={{ pageSize: 5 }}
                rowKey="id"
                size="small"
              />
            ) : (
              <Alert
                message="Chưa có lịch sử khám bệnh"
                description="Bạn chưa có lịch sử khám bệnh nào được ghi nhận."
                type="info"
              />
            )}
          </Card>
        </Col>

        {/* Medicine Requests */}
        {medicineRequests.length > 0 && (
          <Col xs={24}>
            <Card 
              title={
                <Space>
                  <MedicineBoxOutlined />
                  <span>Yêu cầu thuốc</span>
                </Space>
              }
              loading={loading}
            >
              <Timeline>
                {medicineRequests.map((request, index) => (
                  <Timeline.Item
                    key={index}
                    color={request.status === 'approved' ? 'green' : request.status === 'pending' ? 'blue' : 'red'}
                    dot={
                      request.status === 'approved' ? <CheckCircleOutlined /> :
                      request.status === 'pending' ? <ClockCircleOutlined /> :
                      <ExclamationCircleOutlined />
                    }
                  >
                    <div>
                      <Text strong>{request.medicineName}</Text>
                      <br />
                      <Text type="secondary">
                        Số lượng: {request.quantity} - 
                        Trạng thái: <Tag color={
                          request.status === 'approved' ? 'green' : 
                          request.status === 'pending' ? 'blue' : 'red'
                        }>
                          {request.status === 'approved' ? 'Đã duyệt' :
                           request.status === 'pending' ? 'Đang chờ' : 'Từ chối'}
                        </Tag>
                      </Text>
                      <br />
                      <Text type="secondary">
                        Ngày yêu cầu: {new Date(request.requestDate).toLocaleDateString('vi-VN')}
                      </Text>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default StudentDashboard;
