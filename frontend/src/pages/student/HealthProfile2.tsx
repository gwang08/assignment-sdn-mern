import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Descriptions, 
  Tag, 
  Alert, 
  Button, 
  Space, 
  Row, 
  Col,
  Divider,
  List,
  Avatar
} from 'antd';
import {
  HeartOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { HealthProfile } from '../../types';

const { Title, Text, Paragraph } = Typography;

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
      if (user?._id) {
        const response = await apiService.getHealthProfile(user._id);
        if (response.success && response.data) {
          setHealthProfile(response.data);
        }
      }
    } catch (error) {
      console.log('No health profile found for student');
      setHealthProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>
          <HeartOutlined className="mr-2" />
          Hồ sơ sức khỏe của tôi
        </Title>
        <Text type="secondary">
          Thông tin chi tiết về tình trạng sức khỏe của bạn
        </Text>
      </div>

      {healthProfile ? (
        <div>
          {/* Basic Information */}
          <Card 
            title={
              <Space>
                <UserOutlined />
                <span>Thông tin cơ bản</span>
              </Space>
            } 
            className="mb-4"
            loading={loading}
          >
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Họ và tên" span={2}>
                {user?.first_name && user?.last_name ? 
                  `${user.first_name} ${user.last_name}` : 
                  'Chưa cập nhật'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng thị lực">
                {healthProfile.vision_status || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng thính lực">
                {healthProfile.hearing_status || 'Chưa cập nhật'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Medical Information */}
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                <span>Thông tin y tế</span>
              </Space>
            } 
            className="mb-4"
            loading={loading}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="mb-4">
                  <Title level={4}>Dị ứng</Title>
                  {healthProfile.allergies && healthProfile.allergies.length > 0 ? (
                    <div>
                      {healthProfile.allergies.map((allergy: string, index: number) => (
                        <Tag key={index} color="red" className="mb-1">
                          {allergy}
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <Alert
                      message="Không có dị ứng nào được ghi nhận"
                      type="success"
                      showIcon
                      icon={<InfoCircleOutlined />}
                    />
                  )}
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="mb-4">
                  <Title level={4}>Thuốc đang sử dụng</Title>
                  {healthProfile.medications && healthProfile.medications.length > 0 ? (
                    <div>
                      {healthProfile.medications.map((medication: string, index: number) => (
                        <Tag key={index} color="blue" className="mb-1">
                          {medication}
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <Alert
                      message="Không có thuốc nào đang sử dụng"
                      type="info"
                      showIcon
                    />
                  )}
                </div>
              </Col>
            </Row>

            <Divider />

            <div className="mb-4">
              <Title level={4}>Tiền sử bệnh</Title>
              {healthProfile.medical_history && healthProfile.medical_history.length > 0 ? (
                <List
                  size="small"
                  dataSource={healthProfile.medical_history}
                  renderItem={(item, index) => (
                    <List.Item key={index}>
                      <List.Item.Meta
                        avatar={<Avatar icon={<FileTextOutlined />} />}
                        description={item}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Alert
                  message="Không có tiền sử bệnh đặc biệt"
                  type="info"
                  showIcon
                />
              )}
            </div>

            {healthProfile.chronic_conditions && healthProfile.chronic_conditions.length > 0 && (
              <div className="mb-4">
                <Title level={4}>Bệnh mãn tính</Title>
                <div>
                  {healthProfile.chronic_conditions.map((condition: string, index: number) => (
                    <Tag key={index} color="orange" className="mb-1">
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
                  <MedicineBoxOutlined />
                  <span>Lịch sử tiêm chủng</span>
                </Space>
              } 
              className="mb-4"
              loading={loading}
            >
              <List
                dataSource={healthProfile.vaccination_records}
                renderItem={(vaccination, index) => (
                  <List.Item key={index}>
                    <List.Item.Meta
                      avatar={<Avatar icon={<MedicineBoxOutlined />} />}
                      title={vaccination.vaccine_name}
                      description={
                        <div>
                          <div>Ngày tiêm: {new Date(vaccination.date_administered).toLocaleDateString('vi-VN')}</div>
                          <div>Mũi số: {vaccination.dose_number}</div>
                          <div>Người tiêm: {vaccination.administered_by}</div>
                          {vaccination.notes && <div>Ghi chú: {vaccination.notes}</div>}
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
            title="Ghi chú và cập nhật"
            extra={
              <Button type="primary" icon={<EditOutlined />} disabled>
                Yêu cầu cập nhật
              </Button>
            }
          >
            <Alert
              message="Thông tin quan trọng"
              description="Nếu có thay đổi về tình trạng sức khỏe, dị ứng, hoặc thuốc đang sử dụng, vui lòng thông báo ngay cho phụ huynh hoặc y tá trường để cập nhật hồ sơ."
              type="warning"
              showIcon
              icon={<ExclamationCircleOutlined />}
            />

            <div className="mt-4 text-sm text-gray-500">
              Cập nhật lần cuối: {new Date(healthProfile.updatedAt).toLocaleString('vi-VN')}
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <Alert
            message="Chưa có hồ sơ sức khỏe"
            description={
              <div>
                <p>Bạn chưa có hồ sơ sức khỏe trong hệ thống.</p>
                <p>Vui lòng liên hệ với phụ huynh hoặc y tá trường để tạo hồ sơ sức khỏe.</p>
              </div>
            }
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            action={
              <Button type="primary" disabled>
                Yêu cầu tạo hồ sơ
              </Button>
            }
          />
        </Card>
      )}
    </div>
  );
};

export default StudentHealthProfile;
