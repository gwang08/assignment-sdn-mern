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
  Statistic,
  Space,
  Tabs,
  List,
  Radio,
  Descriptions,
  
} from 'antd';
import {
  CalendarOutlined,
  HeartOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { Campaign, Student } from '../../types';
import apiService from '../../services/api';

const { Title, Text } = Typography;


interface CampaignConsent {
  _id: string;
  campaign_id: string;
  student_id: string;
  parent_id: string;
  consent_status: 'pending' | 'approved' | 'rejected';
  consent_date?: string;
  notes?: string;
}



const ParentCampaigns: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isConsentModalVisible, setIsConsentModalVisible] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<CampaignConsent | null>(null);
  const [consentForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [campaignsResponse, studentsResponse] = await Promise.all([
        apiService.getParentCampaigns(),
        apiService.getParentStudents()
      ]);

      if (campaignsResponse.success && campaignsResponse.data) {
        setCampaigns(campaignsResponse.data);
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

  const handleConsentSubmit = async (values: any) => {
    try {
      if (!selectedConsent) return;

      const consentData = {
        status: values.consent_status,
        notes: values.notes || ''
      };

      const response = await apiService.updateCampaignConsent(
        selectedConsent.student_id,
        selectedConsent.campaign_id,
        consentData
      );

      if (response.success) {
        message.success('Cập nhật đồng ý thành công');
        setIsConsentModalVisible(false);
        consentForm.resetFields();
        setSelectedConsent(null);
        loadData(); // Reload data to refresh consents
      }
    } catch (error) {
      console.error('Error updating consent:', error);
      message.error('Có lỗi xảy ra khi cập nhật đồng ý');
    }
  };



   

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'green',
      upcoming: 'blue',
      draft: 'blue',
      completed: 'gray',
      cancelled: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusText = {
      active: 'Đang diễn ra',
      upcoming: 'Sắp diễn ra',
      draft: 'Sắp diễn ra',
      completed: 'Đã hoàn thành',
      cancelled: 'Đã hủy'
    };
    return statusText[status as keyof typeof statusText] || status;
  };

  const getCampaignTypeIcon = (type: string) => {
    const icons = {
      vaccination: <MedicineBoxOutlined />,
      health_check: <HeartOutlined />,
      screening: <FileTextOutlined />,
      other: <CalendarOutlined />
    };
    return icons[type as keyof typeof icons] || <CalendarOutlined />;
  };

  const getCampaignTypeText = (type: string) => {
    const typeText = {
      vaccination: 'Tiêm chủng',
      health_check: 'Kiểm tra sức khỏe',
      screening: 'Tầm soát',
      other: 'Khác'
    };
    return typeText[type as keyof typeof typeText] || type;
  };



  const handleViewCampaignDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDetailModalVisible(true);
  };

  const handleConsentAction = (campaignId: string, studentId: string) => {
    const campaign = campaigns.find(c => c._id === campaignId);
    
    if (campaign) {
      // Create a new consent object for this action
      const consent = {
        _id: `${campaignId}-${studentId}`,
        campaign_id: campaignId,
        student_id: studentId,
        parent_id: 'current-parent',
        consent_status: 'pending' as const,
        notes: ''
      };
      
      setSelectedConsent(consent);
      setIsConsentModalVisible(true);
      consentForm.setFieldsValue({
        consent_status: 'approved',
        notes: ''
      });
    }
  };

  const getMyStudentCampaigns = () => {
    // For now, show all campaigns as backend provides campaigns relevant to this parent
    // In a real system, this filtering would be done on the backend
    return campaigns;
  };

  const getPendingConsents = () => {
    // Return campaigns that require consent and are active
    return campaigns.filter(campaign => 
      campaign.requires_consent && 
      campaign.status === 'active'
    );
  };

  const columns = [
    {
      title: 'Chiến dịch',
      key: 'campaign',
      width: 280,
      render: (_: any, record: Campaign) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar 
            size="small"
            icon={getCampaignTypeIcon(record.campaign_type)} 
            style={{ 
              backgroundColor: record.campaign_type === 'vaccination' ? '#1890ff' : 
                             record.campaign_type === 'health_check' ? '#52c41a' : '#fa8c16' 
            }} 
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', marginBottom: '2px' }}>
              {record.title}
            </div>
            <Tag color="blue" style={{ fontSize: '11px', padding: '0 4px', height: '18px', lineHeight: '18px' }}>
              {getCampaignTypeText(record.campaign_type)}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Lớp',
      dataIndex: 'target_classes',
      key: 'target_classes',
      width: 100,
      render: (classes: string[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
          {(classes || ['Tất cả']).map(cls => (
            <Tag 
              key={cls} 
              color="geekblue" 
              style={{ fontSize: '11px', padding: '0 4px', height: '18px', lineHeight: '18px', margin: '1px' }}
            >
              {cls}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: 'Thời gian',
      key: 'duration',
      width: 130,
      render: (_: any, record: Campaign) => (
        <div style={{ fontSize: '13px' }}>
          <div style={{ fontWeight: 500 }}>{moment(record.start_date).format('DD/MM/YYYY')}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            đến {moment(record.end_date).format('DD/MM/YYYY')}
          </Text>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ margin: 0 }}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Đồng ý',
      key: 'consent',
      width: 110,
      render: (_: any, record: Campaign) => (
        <div>
          {record.requires_consent ? (
            <div>
              <Tag 
                color="orange" 
                style={{ 
                  fontSize: '11px', 
                  padding: '0 4px', 
                  height: '18px', 
                  lineHeight: '18px',
                  margin: 0, 
                  marginBottom: '2px' 
                }}
              >
                Cần đồng ý
              </Tag>
              {record.consent_deadline && (
                <div style={{ fontSize: '11px', color: '#666', lineHeight: '14px' }}>
                  Hạn: {moment(record.consent_deadline).format('DD/MM')}
                </div>
              )}
            </div>
          ) : (
            <Tag 
              color="green" 
              style={{ 
                fontSize: '11px', 
                padding: '0 4px', 
                height: '18px', 
                lineHeight: '18px',
                margin: 0 
              }}
            >
              Không cần
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_: any, record: Campaign) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewCampaignDetail(record)}
          >
            Chi tiết
          </Button>
          {record.requires_consent && record.status === 'active' && students.length > 0 && (
            <Button
              type="default"
              size="small"
              onClick={() => handleConsentAction(record._id, students[0]._id)}
              style={{ fontSize: '12px' }}
            >
              Đồng ý
            </Button>
          )}
        </Space>
      )
    }
  ];

  const renderCampaignDetail = () => {
    if (!selectedCampaign) return null;

    const tabItems = [
      {
        key: '1',
        label: 'Thông tin chung',
        children: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Descriptions bordered>
              <Descriptions.Item label="Tên chiến dịch" span={3}>
                {selectedCampaign.title}
              </Descriptions.Item>
              <Descriptions.Item label="Loại chiến dịch">
                <Tag color="blue">{getCampaignTypeText(selectedCampaign.campaign_type)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedCampaign.status)}>
                  {getStatusText(selectedCampaign.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cần đồng ý">
                {selectedCampaign.requires_consent ? (
                  <Tag color="orange">Có</Tag>
                ) : (
                  <Tag color="green">Không</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian bắt đầu">
                {moment(selectedCampaign.start_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian kết thúc">
                {moment(selectedCampaign.end_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              {selectedCampaign.consent_deadline && (
                <Descriptions.Item label="Hạn đồng ý">
                  {moment(selectedCampaign.consent_deadline).format('DD/MM/YYYY')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Lớp tham gia" span={2}>
                {(selectedCampaign.target_classes || ['Tất cả']).map(cls => (
                  <Tag key={cls} color="geekblue">{cls}</Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={3}>
                <div style={{ padding: '8px', backgroundColor: '#f6f6f6', borderRadius: '4px' }}>
                  {selectedCampaign.description}
                </div>
              </Descriptions.Item>
              {selectedCampaign.instructions && (
                <Descriptions.Item label="Hướng dẫn" span={3}>
                  <div style={{ padding: '8px', backgroundColor: '#fff7e6', borderRadius: '4px' }}>
                    {selectedCampaign.instructions}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )
      },
      {
        key: '2',
        label: 'Con em tham gia',
        children: (
          <div>
            <List
              dataSource={students} // Show all students as campaigns are already filtered by backend
              renderItem={(student) => (
                <List.Item
                  actions={
                    selectedCampaign.requires_consent && selectedCampaign.status === 'active' ? [
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => handleConsentAction(selectedCampaign._id, student._id)}
                      >
                        Đồng ý tham gia
                      </Button>
                    ] : []
                  }
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={`${student.first_name} ${student.last_name}`}
                    description={`Lớp: ${student.class_name}`}
                  />
                </List.Item>
              )}
            />
            {students.length === 0 && (
              <Text type="secondary">Không có con em nào trong hệ thống</Text>
            )}
          </div>
        )
      }
    ];

    return (
      <Modal
        title={selectedCampaign.title}
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedCampaign(null);
        }}
        width={800}
        footer={null}
      >
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Modal>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Chiến dịch y tế</Title>
          <Text type="secondary">Theo dõi các chiến dịch y tế của trường</Text>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng chiến dịch"
              value={getMyStudentCampaigns().length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đang diễn ra"
              value={getMyStudentCampaigns().filter(c => c.status === 'active').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Cần đồng ý"
              value={getPendingConsents().length}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={getMyStudentCampaigns().filter(c => c.status === 'completed').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Danh sách chiến dịch">
            <Table
              columns={columns}
              dataSource={getMyStudentCampaigns()}
              rowKey="_id"
              loading={loading}
              scroll={{ x: 1000 }}
              size="middle"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chiến dịch`
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Cần xử lý">
            <List
              dataSource={campaigns.filter(campaign => 
                campaign.requires_consent && 
                campaign.status === 'active'
              ).slice(0, 5)}
              renderItem={(campaign) => {
                return (
                  <List.Item
                    actions={[
                      students.length > 0 && (
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={() => handleConsentAction(campaign._id, students[0]._id)}
                        >
                          Phản hồi
                        </Button>
                      )
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={getCampaignTypeIcon(campaign.campaign_type)}
                          style={{ backgroundColor: '#fa8c16' }}
                        />
                      }
                      title={campaign.title}
                      description={
                        <div>
                          <div>Cần đồng ý cho con em tham gia</div>
                          <Tag color="orange">Chờ đồng ý</Tag>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
            {campaigns.filter(campaign => 
              campaign.requires_consent && 
              campaign.status === 'active'
            ).length === 0 && (
              <Text type="secondary">Không có chiến dịch nào cần phản hồi</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Campaign Detail Modal */}
      {renderCampaignDetail()}

      {/* Consent Modal */}
      <Modal
        title="Phản hồi tham gia chiến dịch"
        open={isConsentModalVisible}
        onCancel={() => {
          setIsConsentModalVisible(false);
          setSelectedConsent(null);
          consentForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        {selectedConsent && (
          <Form
            form={consentForm}
            onFinish={handleConsentSubmit}
            layout="vertical"
            style={{ marginTop: '16px' }}
          >
            <Form.Item
              name="consent_status"
              label="Quyết định"
              rules={[{ required: true, message: 'Vui lòng chọn quyết định' }]}
            >
              <Radio.Group>
                <Radio value="approved">Đồng ý tham gia</Radio>
                <Radio value="rejected">Không đồng ý</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="notes"
              label="Ghi chú"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Ghi chú thêm (nếu có)"
              />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={() => setIsConsentModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Gửi phản hồi
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ParentCampaigns;
