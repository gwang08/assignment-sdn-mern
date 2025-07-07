import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Tag, 
  Alert, 
  Button, 
  Space, 
  Row, 
  Col,
  Divider,
  List,
  Avatar,
  Badge,
  Spin,
  Tooltip
} from 'antd';
import {
  HeartOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  EyeOutlined,
  AudioOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/api/studentService'; 
import { HealthProfile } from '../../types';
import './StudentHealthProfile.css';

const { Title, Text } = Typography;

const StudentHealthProfile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);

  useEffect(() => {
    loadHealthProfile();
  }, []);

  const loadHealthProfile = async () => {
    try {
      setLoading(true);
      const response = await studentService.getStudentSelfHealthProfile();
      console.log("Health profile response:", response);

      if (response.success && response.data) {
        setHealthProfile(response.data);
      }
    } catch (error) {
      console.log('No health profile found for student');
      setHealthProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="student-health-profile">
        <div className="loading-container">
          <Spin size="large" />
          <div className="loading-text">
            <Text type="secondary">Đang tải thông tin sức khỏe...</Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-health-profile">
      <div className="profile-header">
        <Title level={2} className="header-title">
          <HeartOutlined className="header-icon" />
          Hồ sơ sức khỏe của tôi
        </Title>
        <Text className="header-subtitle">
          Thông tin chi tiết về tình trạng sức khỏe của bạn
        </Text>
      </div>

      {healthProfile ? (
        <div className="profile-content">
          {/* Basic Information */}
          <Card 
            title={
              <Space>
                <UserOutlined />
                <span>Thông tin cơ bản</span>
              </Space>
            } 
            className="enhanced-card basic-info-card"
            loading={loading}
          >
            <div className="student-info-header">
              <Avatar 
                size={64} 
                icon={<UserOutlined />} 
                className="student-avatar"
              />
              <div className="student-details">
                <Title level={3} className="student-name">
                  {user?.first_name && user?.last_name ? 
                    `${user.first_name} ${user.last_name}` : 
                    'Chưa cập nhật'
                  }
                </Title>
                <Text type="secondary">Học sinh</Text>
              </div>
            </div>
            
            <Divider />
            
            <Row gutter={[24, 24]} className="health-status-row">
              <Col xs={24} md={12}>
                <div className="status-item">
                  <div className="status-icon">
                    <Avatar icon={<EyeOutlined />} style={{ backgroundColor: '#1890ff' }} />
                  </div>
                  <div className="status-content">
                    <Text strong>Tình trạng thị lực</Text>
                    <div className="status-value">
                      {healthProfile.vision_status || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="status-item">
                  <div className="status-icon">
                    <Avatar icon={<AudioOutlined />} style={{ backgroundColor: '#52c41a' }} />
                  </div>
                  <div className="status-content">
                    <Text strong>Tình trạng thính lực</Text>
                    <div className="status-value">
                      {healthProfile.hearing_status || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Medical Information */}
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                <span>Thông tin y tế</span>
              </Space>
            } 
            className="enhanced-card medical-info-card"
            loading={loading}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div className="info-section">
                  <Title level={4} className="section-title">
                    <WarningOutlined className="section-icon" />
                    Dị ứng
                  </Title>
                  {healthProfile.allergies && healthProfile.allergies.length > 0 ? (
                    <div className="tags-container">
                      {healthProfile.allergies.map((allergy: any, index: number) => (
                        <Tag key={index} className="medical-tag allergy-tag" icon={<ExclamationCircleOutlined />}>
                          {typeof allergy === 'string' ? allergy : allergy.name}
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <Alert
                      message="Không có dị ứng nào được ghi nhận"
                      type="success"
                      showIcon
                      icon={<CheckCircleOutlined />}
                      className="info-alert"
                    />
                  )}
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="info-section">
                  <Title level={4} className="section-title">
                    <MedicineBoxOutlined className="section-icon" />
                    Thuốc đang sử dụng
                  </Title>
                  {healthProfile.medications && healthProfile.medications.length > 0 ? (
                    <div className="tags-container">
                      {healthProfile.medications.map((medication: any, index: number) => (
                        <Tag key={index} className="medical-tag medication-tag" icon={<MedicineBoxOutlined />}>
                          {typeof medication === 'string' ? medication : medication.name}
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <Alert
                      message="Không có thuốc nào đang sử dụng"
                      type="info"
                      showIcon
                      className="info-alert"
                    />
                  )}
                </div>
              </Col>
            </Row>

            <Divider />

            <div className="info-section">
              <Title level={4} className="section-title">
                <FileTextOutlined className="section-icon" />
                Tiền sử bệnh
              </Title>
              {healthProfile.medical_history && healthProfile.medical_history.length > 0 ? (
                <List
                  size="small"
                  dataSource={healthProfile.medical_history}
                  renderItem={(item, index) => (
                    <List.Item key={index} className="history-item">
                      <List.Item.Meta
                        avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#faad14' }} />}
                        description={<Text>{item}</Text>}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Alert
                  message="Không có tiền sử bệnh đặc biệt"
                  type="info"
                  showIcon
                  className="info-alert"
                />
              )}
            </div>

            {healthProfile.chronic_conditions && healthProfile.chronic_conditions.length > 0 && (
              <div className="info-section">
                <Title level={4} className="section-title">
                  <ExclamationCircleOutlined className="section-icon" />
                  Bệnh mãn tính
                </Title>
                <div className="tags-container">
                  {healthProfile.chronic_conditions.map((condition: string, index: number) => (
                    <Tag key={index} className="medical-tag chronic-tag" icon={<ExclamationCircleOutlined />}>
                      {condition}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Vaccination Records */}
          {healthProfile.vaccination_records && healthProfile.vaccination_records.length > 0 && (
            <Card 
              title={
                <Space>
                  <SafetyOutlined />
                  <span>Lịch sử tiêm chủng</span>
                  <Badge count={healthProfile.vaccination_records.length} style={{ backgroundColor: '#52c41a' }} />
                </Space>
              } 
              className="enhanced-card vaccination-card"
              loading={loading}
            >
              <List
                dataSource={healthProfile.vaccination_records}
                renderItem={(vaccination, index) => (
                  <List.Item key={index} className="vaccination-item">
                    <List.Item.Meta
                      avatar={<Avatar icon={<SafetyOutlined />} style={{ backgroundColor: '#52c41a' }} size={48} />}
                      title={
                        <div className="vaccination-title">
                          <Text strong>{vaccination.vaccine_name}</Text>
                          <Tag color="green" className="dose-tag">
                            Mũi {vaccination.dose_number}
                          </Tag>
                        </div>
                      }
                      description={
                        <div className="vaccination-details">
                          <div className="detail-item">
                            <CalendarOutlined />
                            <Text>Ngày tiêm: {new Date(vaccination.date_administered).toLocaleDateString('vi-VN')}</Text>
                          </div>
                          <div className="detail-item">
                            <UserOutlined />
                            <Text>Người tiêm: {vaccination.administered_by}</Text>
                          </div>
                          {vaccination.notes && (
                            <div className="detail-item">
                              <InfoCircleOutlined />
                              <Text>Ghi chú: {vaccination.notes}</Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Notes and Updates */}
          <Card 
            title={
              <Space>
                <EditOutlined />
                <span>Ghi chú và cập nhật</span>
              </Space>
            }
            className="enhanced-card notes-card"
            extra={
              <Tooltip title="Liên hệ y tá trường để cập nhật thông tin">
                <Button type="primary" icon={<EditOutlined />} disabled className="update-btn">
                  Yêu cầu cập nhật
                </Button>
              </Tooltip>
            }
          >
            <Alert
              message="Thông tin quan trọng"
              description="Nếu có thay đổi về tình trạng sức khỏe, dị ứng, hoặc thuốc đang sử dụng, vui lòng thông báo ngay cho phụ huynh hoặc y tá trường để cập nhật hồ sơ."
              type="warning"
              showIcon
              icon={<ExclamationCircleOutlined />}
              className="important-notice"
            />

            <div className="last-updated">
              <Text type="secondary">
                Cập nhật lần cuối: {new Date(healthProfile.updatedAt).toLocaleString('vi-VN')}
              </Text>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="enhanced-card no-profile-card">
          <div className="no-profile-content">
            <Avatar size={80} icon={<ExclamationCircleOutlined />} style={{ backgroundColor: '#faad14' }} />
            <Title level={3} className="no-profile-title">
              Chưa có hồ sơ sức khỏe
            </Title>
            <div className="no-profile-description">
              <Text>Bạn chưa có hồ sơ sức khỏe trong hệ thống.</Text>
              <br />
              <Text>Vui lòng liên hệ với phụ huynh hoặc y tá trường để tạo hồ sơ sức khỏe.</Text>
            </div>
            <Button 
              type="primary" 
              size="large" 
              icon={<EditOutlined />} 
              disabled
              className="create-profile-btn"
            >
              Yêu cầu tạo hồ sơ
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentHealthProfile;