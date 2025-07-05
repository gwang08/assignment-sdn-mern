import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Alert,
  Badge,
  Progress,
  Descriptions,
  Modal,
  Result
} from 'antd';
import {
  SafetyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { Campaign, CampaignConsent, CampaignResult } from '../../types';

const { Title, Text, Paragraph } = Typography;

const StudentCampaigns: React.FC = () => {
  const { user } = useAuth();
  const [, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [consents, setConsents] = useState<CampaignConsent[]>([]);
  const [results, setResults] = useState<CampaignResult[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    loadCampaignData();
  }, []);

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      
      // Load campaigns
      const campaignsResponse = await apiService.getCampaigns();
      if (campaignsResponse.success && campaignsResponse.data) {
        setCampaigns(campaignsResponse.data);
      }

      // Load consents and results (these would need to be implemented in API)
      // For now, we'll use empty arrays
      setConsents([]);
      setResults([]);
      
    } catch (error) {
      console.error('Error loading campaign data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCampaignStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'draft': 'default',
      'active': 'processing',
      'completed': 'success',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  const getCampaignStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'draft': 'Bản nháp',
      'active': 'Đang diễn ra',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return labels[status] || status;
  };

  const getCampaignTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'vaccination': 'blue',
      'health_check': 'green',
      'screening': 'orange',
      'other': 'purple'
    };
    return colors[type] || 'default';
  };

  const getCampaignTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'vaccination': 'Tiêm chủng',
      'health_check': 'Khám sức khỏe',
      'screening': 'Sàng lọc',
      'other': 'Khác'
    };
    return labels[type] || type;
  };

  const isEligibleForCampaign = (campaign: Campaign) => {
    // Check if student's class is in target classes
    const studentUser = user as any;
    if (studentUser?.class_name && campaign.target_classes) {
      return campaign.target_classes.includes(studentUser.class_name);
    }
    return true; // Default to eligible if no class restriction
  };

  const getCampaignProgress = (campaign: Campaign) => {
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  const getConsentStatus = (campaignId: string) => {
    const consent = consents.find(c => c.campaign === campaignId && c.student === user?._id);
    return consent;
  };

  const getParticipationResult = (campaignId: string) => {
    const result = results.find(r => r.campaign === campaignId && r.student === user?._id);
    return result;
  };

  const showCampaignDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailModalVisible(true);
  };

  const renderCampaignCard = (campaign: Campaign) => {
    const isEligible = isEligibleForCampaign(campaign);
    const progress = getCampaignProgress(campaign);
    const consent = getConsentStatus(campaign._id);
    const result = getParticipationResult(campaign._id);

    return (
      <Card
        key={campaign._id}
        className="mb-4"
        actions={[
          <Button 
            type="link" 
            icon={<InfoCircleOutlined />}
            onClick={() => showCampaignDetail(campaign)}
          >
            Chi tiết
          </Button>
        ]}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <Title level={4} className="mb-2">
              {campaign.title}
            </Title>
            <Paragraph className="text-gray-600 mb-2" ellipsis={{ rows: 2 }}>
              {campaign.description}
            </Paragraph>
          </div>
          <div className="ml-4">
            <Badge
              status={getCampaignStatusColor(campaign.status) as any}
              text={getCampaignStatusLabel(campaign.status)}
            />
          </div>
        </div>

        <div className="mb-3">
          <Space wrap>
            <Tag color={getCampaignTypeColor(campaign.campaign_type)} icon={<SafetyOutlined />}>
              {getCampaignTypeLabel(campaign.campaign_type)}
            </Tag>
            
            {!isEligible && (
              <Tag color="red" icon={<ExclamationCircleOutlined />}>
                Không áp dụng cho lớp của bạn
              </Tag>
            )}
            
            {consent && (
              <Tag 
                color={consent.status === 'Approved' ? 'green' : consent.status === 'Declined' ? 'red' : 'orange'} 
                icon={consent.status === 'Approved' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              >
                {consent.status === 'Approved' ? 'Đã đồng ý tham gia' : consent.status === 'Declined' ? 'Đã từ chối tham gia' : 'Chờ phản hồi'}
              </Tag>
            )}
            
            {result && (
              <Tag 
                color={result.checkupDetails ? 'green' : 'orange'} 
                icon={<CheckCircleOutlined />}
              >
                {result.checkupDetails ? 'Đã tham gia' : 'Chưa tham gia'}
              </Tag>
            )}
          </Space>
        </div>

        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <Text strong>Tiến độ chiến dịch</Text>
            <Text>{progress}%</Text>
          </div>
          <Progress 
            percent={progress} 
            strokeColor={
              progress === 100 ? '#52c41a' : 
              progress > 50 ? '#1890ff' : '#faad14'
            }
            showInfo={false}
          />
        </div>

        <div className="text-sm text-gray-500">
          <Space split={<span>•</span>}>
            <span>
              <CalendarOutlined className="mr-1" />
              {new Date(campaign.start_date).toLocaleDateString('vi-VN')} - 
              {new Date(campaign.end_date).toLocaleDateString('vi-VN')}
            </span>
            {campaign.target_classes && campaign.target_classes.length > 0 && (
              <span>
                <TeamOutlined className="mr-1" />
                Lớp: {campaign.target_classes.join(', ')}
              </span>
            )}
          </Space>
        </div>

        {campaign.requires_consent && !consent && isEligible && campaign.status === 'active' && (
          <Alert
            message="Cần sự đồng ý của phụ huynh"
            description="Chiến dịch này cần có sự đồng ý của phụ huynh. Vui lòng nhắc nhở phụ huynh đăng nhập và xác nhận tham gia."
            type="warning"
            showIcon
            className="mt-3"
          />
        )}
      </Card>
    );
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');
  const upcomingCampaigns = campaigns.filter(c => c.status === 'draft' && new Date(c.start_date) > new Date());

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>
          <SafetyOutlined className="mr-2" />
          Chiến dịch y tế
        </Title>
        <Text type="secondary">
          Theo dõi các chiến dịch y tế tại trường và tình trạng tham gia của bạn
        </Text>
      </div>

      {campaigns.length > 0 ? (
        <div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {activeCampaigns.length}
                </div>
                <Text type="secondary">Đang diễn ra</Text>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {completedCampaigns.length}
                </div>
                <Text type="secondary">Đã hoàn thành</Text>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {upcomingCampaigns.length}
                </div>
                <Text type="secondary">Sắp diễn ra</Text>
              </div>
            </Card>
          </div>

          {/* Active Campaigns */}
          {activeCampaigns.length > 0 && (
            <Card title="Chiến dịch đang diễn ra" className="mb-4">
              {activeCampaigns.map(campaign => renderCampaignCard(campaign))}
            </Card>
          )}

          {/* Upcoming Campaigns */}
          {upcomingCampaigns.length > 0 && (
            <Card title="Chiến dịch sắp diễn ra" className="mb-4">
              {upcomingCampaigns.map(campaign => renderCampaignCard(campaign))}
            </Card>
          )}

          {/* Completed Campaigns */}
          {completedCampaigns.length > 0 && (
            <Card title="Chiến dịch đã hoàn thành">
              {completedCampaigns.map(campaign => renderCampaignCard(campaign))}
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <Result
            icon={<SafetyOutlined />}
            title="Chưa có chiến dịch y tế nào"
            subTitle="Hiện tại chưa có chiến dịch y tế nào được tổ chức tại trường."
          />
        </Card>
      )}

      {/* Campaign Detail Modal */}
      <Modal
        title={selectedCampaign?.title}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCampaign && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Loại chiến dịch" span={2}>
                <Tag color={getCampaignTypeColor(selectedCampaign.campaign_type)}>
                  {getCampaignTypeLabel(selectedCampaign.campaign_type)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge
                  status={getCampaignStatusColor(selectedCampaign.status) as any}
                  text={getCampaignStatusLabel(selectedCampaign.status)}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Cần đồng ý phụ huynh">
                <Tag color={selectedCampaign.requires_consent ? 'orange' : 'green'}>
                  {selectedCampaign.requires_consent ? 'Có' : 'Không'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">
                {new Date(selectedCampaign.start_date).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">
                {new Date(selectedCampaign.end_date).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              {selectedCampaign.consent_deadline && (
                <Descriptions.Item label="Hạn đồng ý" span={2}>
                  {new Date(selectedCampaign.consent_deadline).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Lớp tham gia" span={2}>
                {selectedCampaign.target_classes && selectedCampaign.target_classes.length > 0 ? 
                  selectedCampaign.target_classes.join(', ') : 'Tất cả các lớp'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {selectedCampaign.description}
              </Descriptions.Item>
              <Descriptions.Item label="Hướng dẫn" span={2}>
                {selectedCampaign.instructions}
              </Descriptions.Item>
            </Descriptions>

            {/* Participation Status */}
            <div className="mt-4">
              <Title level={4}>Tình trạng tham gia của bạn</Title>
              <div className="bg-gray-50 p-4 rounded">
                {isEligibleForCampaign(selectedCampaign) ? (
                  <div>
                    <Text className="text-green-600">
                      <CheckCircleOutlined className="mr-2" />
                      Bạn đủ điều kiện tham gia chiến dịch này.
                    </Text>
                    
                    {selectedCampaign.requires_consent && (
                      <div className="mt-2">
                        {getConsentStatus(selectedCampaign._id) ? (
                          <Text className="text-green-600">
                            <CheckCircleOutlined className="mr-2" />
                            Phụ huynh đã đồng ý cho bạn tham gia.
                          </Text>
                        ) : (
                          <Text className="text-orange-600">
                            <ClockCircleOutlined className="mr-2" />
                            Đang chờ sự đồng ý của phụ huynh.
                          </Text>
                        )}
                      </div>
                    )}
                    
                    {getParticipationResult(selectedCampaign._id) && (
                      <div className="mt-2">
                        <Text className="text-green-600">
                          <CheckCircleOutlined className="mr-2" />
                          Bạn đã tham gia chiến dịch này.
                        </Text>
                      </div>
                    )}
                  </div>
                ) : (
                  <Text className="text-gray-600">
                    <InfoCircleOutlined className="mr-2" />
                    Chiến dịch này không áp dụng cho lớp của bạn.
                  </Text>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentCampaigns;
