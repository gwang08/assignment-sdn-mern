import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Button, 
  Typography, 
  Space,
  List,
  Avatar,
  Calendar,
  Badge,
  Alert
} from 'antd';
import {
  MedicineBoxOutlined,
  TeamOutlined,
  CalendarOutlined,
  AlertOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiService from '../../services/api';
import { MedicalEvent, Campaign, MedicineRequest, DashboardStats } from '../../types';

const { Title, Text } = Typography;

const NurseDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<MedicalEvent[]>([]);
  const [upcomingCampaigns, setUpcomingCampaigns] = useState<Campaign[]>([]);
  const [pendingRequests, setPendingRequests] = useState<MedicineRequest[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const statsResponse = await apiService.getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
        setRecentEvents(statsResponse.data.recent_events);
        setUpcomingCampaigns(statsResponse.data.upcoming_campaigns);
      }

      // Load pending medicine requests
      const requestsResponse = await apiService.getMedicineRequests();
      if (requestsResponse.success && requestsResponse.data) {
        const pending = requestsResponse.data.filter(req => req.status === 'pending');
        setPendingRequests(pending);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts
  const eventTrendData = [
    { name: 'T2', events: 4 },
    { name: 'T3', events: 7 },
    { name: 'T4', events: 5 },
    { name: 'T5', events: 8 },
    { name: 'T6', events: 6 },
    { name: 'T7', events: 3 },
    { name: 'CN', events: 2 }
  ];

  const eventTypeData = [
    { name: 'Tai nạn', value: 35, color: '#ff4d4f' },
    { name: 'Ốm đau', value: 45, color: '#1890ff' },
    { name: 'Khám định kỳ', value: 20, color: '#52c41a' }
  ];

  const eventColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Học sinh',
      dataIndex: 'student_id',
      key: 'student_id',
      render: (studentId: string) => `HS-${studentId.slice(-6)}`
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'event_type',
      key: 'event_type',
      render: (type: string) => {
        const colors = {
          accident: 'red',
          illness: 'blue',
          injury: 'orange',
          emergency: 'magenta',
          other: 'default'
        };
        return <Tag color={colors[type as keyof typeof colors]}>{type}</Tag>;
      }
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const colors = {
          low: 'green',
          medium: 'yellow',
          high: 'orange',
          critical: 'red'
        };
        return <Tag color={colors[severity as keyof typeof colors]}>{severity}</Tag>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          open: 'red',
          in_progress: 'blue',
          resolved: 'green',
          referred: 'purple'
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
      }
    }
  ];

  const getCalendarData = (value: any) => {
    // Sample calendar data
    const today = new Date();
    if (value.date() === today.getDate()) {
      return [
        { type: 'warning', content: '3 ca khám' },
        { type: 'success', content: '2 chiến dịch' }
      ];
    }
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="m-0">Dashboard Y tế</Title>
          <Text type="secondary">Tổng quan hoạt động y tế học đường</Text>
        </div>
        <Button type="primary" onClick={loadDashboardData} loading={loading}>
          Làm mới dữ liệu
        </Button>
      </div>

      {/* Alert for urgent items */}
      {pendingRequests.length > 0 && (
        <Alert
          message={`Có ${pendingRequests.length} yêu cầu thuốc đang chờ duyệt`}
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary">
              Xem ngay
            </Button>
          }
          closable
        />
      )}

      {/* Key Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng học sinh"
              value={stats?.total_students || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<TeamOutlined />}
              suffix={
                <span className="text-sm">
                  <ArrowUpOutlined className="text-green-500" /> 2.3%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Sự kiện y tế"
              value={stats?.total_medical_events || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<MedicineBoxOutlined />}
              suffix={
                <span className="text-sm">
                  <ArrowDownOutlined className="text-red-500" /> 1.2%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Chiến dịch đang diễn ra"
              value={stats?.active_campaigns || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Yêu cầu thuốc chờ duyệt"
              value={stats?.pending_medicine_requests || 0}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Xu hướng sự kiện y tế (7 ngày qua)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={eventTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="events" stroke="#1890ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân loại sự kiện y tế">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {eventTypeData.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <Text>{item.name}</Text>
                  </div>
                  <Text strong>{item.value}%</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities and Calendar */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Sự kiện y tế gần đây" extra={<Button type="link">Xem tất cả</Button>}>
            <Table
              dataSource={recentEvents}
              columns={eventColumns}
              pagination={{ pageSize: 5 }}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Lịch công việc">
            <Calendar
              fullscreen={false}
              cellRender={(value) => {
                const listData = getCalendarData(value);
                return (
                  <ul className="events">
                    {listData.map((item, index) => (
                      <li key={index}>
                        <Badge status={item.type as any} text={item.content} />
                      </li>
                    ))}
                  </ul>
                );
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions and Upcoming Campaigns */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Thao tác nhanh">
            <Space direction="vertical" className="w-full" size="middle">
              <Button block icon={<MedicineBoxOutlined />} type="primary">
                Tạo sự kiện y tế mới
              </Button>
              <Button block icon={<CalendarOutlined />}>
                Lên lịch chiến dịch
              </Button>
              <Button block icon={<UserOutlined />}>
                Cập nhật hồ sơ sức khỏe
              </Button>
              <Button block icon={<CheckCircleOutlined />}>
                Duyệt yêu cầu thuốc
              </Button>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={16}>
          <Card title="Chiến dịch sắp tới" extra={<Button type="link">Xem tất cả</Button>}>
            <List
              dataSource={upcomingCampaigns}
              renderItem={(campaign) => (
                <List.Item
                  actions={[
                    <Button type="link" key="view">Xem chi tiết</Button>,
                    <Button type="link" key="edit">Chỉnh sửa</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<CalendarOutlined />} 
                        className={
                          campaign.campaign_type === 'vaccination' ? 'bg-blue-500' :
                          campaign.campaign_type === 'health_check' ? 'bg-green-500' : 'bg-purple-500'
                        }
                      />
                    }
                    title={campaign.title}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">{campaign.description}</Text>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <ClockCircleOutlined className="text-gray-400" />
                            <Text className="text-sm">
                              {new Date(campaign.start_date).toLocaleDateString('vi-VN')}
                            </Text>
                          </div>
                          <Tag color={
                            campaign.status === 'active' ? 'green' :
                            campaign.status === 'draft' ? 'blue' : 'default'
                          }>
                            {campaign.status}
                          </Tag>
                        </div>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NurseDashboard;
