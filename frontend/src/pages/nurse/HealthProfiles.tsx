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
  Descriptions,
  List,
  Statistic,
  Input
} from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { nurseService } from "../../services/api";

const { Title, Text } = Typography;

// INTERFACES
interface Student {
  _id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  gender: string;
  dateOfBirth: string;
}

interface HealthProfile {
  _id: string;
  student_id?: string;
  student?: Student | string;
  allergies?: any[];
  chronic_conditions?: any[];
  chronicDiseases?: any[];
  medications?: any[];
  medical_history?: any[];
  treatmentHistory?: any[];
  vaccinations?: any[];
  vaccination_records?: any[];
  vision_status?: string;
  vision?: {
    leftEye?: number;
    rightEye?: number;
  };
  hearing_status?: string;
  hearing?: {
    leftEar?: string;
    rightEar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const NurseHealthProfiles: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [healthProfiles, setHealthProfiles] = useState<HealthProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchClass, setSearchClass] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Vui lòng đăng nhập lại');
        window.location.href = '/login';
        return;
      }
      
      const response = await nurseService.getAllHealthProfiles();
      
      if (response.success && response.data) {
        setHealthProfiles(response.data);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        message.error('Phiên đăng nhập đã hết hạn');
        window.location.href = '/login';
        return;
      }
      
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (profile: HealthProfile) => {
    const student = profile.student as Student;
    return student ? `${student.first_name} ${student.last_name}` : 'N/A';
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'green';
      case 'fair': return 'orange';
      case 'poor': return 'red';
      default: return 'default';
    }
  };

  const getHearingStatusText = (status: string) => {
    switch (status) {
      case 'Normal': return 'Bình thường';
      case 'Mild Loss': return 'Suy giảm nhẹ';
      case 'Moderate Loss': return 'Suy giảm trung bình';
      case 'Severe Loss': return 'Suy giảm nặng';
      default: return status;
    }
  };

  const handleViewDetail = (profile: HealthProfile) => {
    setSelectedProfile(profile);
    setIsDetailModalVisible(true);
  };

  const filteredProfiles = healthProfiles.filter(profile => {
    const student = profile.student as Student;
    if (!student) return false;
    
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const className = student.class_name.toLowerCase();
    
    return (
      fullName.includes(searchName.toLowerCase()) &&
      className.includes(searchClass.toLowerCase())
    );
  });

  const columns = [
    {
      title: 'Học sinh',
      key: 'student',
      render: (_: any, record: HealthProfile) => {
        const student = record.student as Student;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <div>
              <div style={{ fontWeight: 500 }}>
                {student ? `${student.first_name} ${student.last_name}` : 'N/A'}
              </div>
              <Text type="secondary">{student?.class_name}</Text>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái thị lực',
      key: 'vision_status',
      render: (_: any, record: HealthProfile) => {
        const visionStatus = record.vision_status || 
          (record.vision ? 
            (record.vision.leftEye === 1 && record.vision.rightEye === 1 ? 'good' : 'fair') : 
            'unknown');
        return (
          <Tag color={getHealthStatusColor(visionStatus)}>
            {visionStatus === 'good' ? 'Tốt' : visionStatus === 'fair' ? 'Trung bình' : visionStatus === 'poor' ? 'Kém' : 'Chưa rõ'}
          </Tag>
        );
      }
    },
    {
      title: 'Trạng thái thính giác',
      key: 'hearing_status',
      render: (_: any, record: HealthProfile) => {
        const hearingStatus = record.hearing_status || 
          (record.hearing ? 
            (record.hearing.leftEar === 'Normal' && record.hearing.rightEar === 'Normal' ? 'good' : 'fair') : 
            'unknown');
        return (
          <Tag color={getHealthStatusColor(hearingStatus)}>
            {hearingStatus === 'good' ? 'Tốt' : hearingStatus === 'fair' ? 'Trung bình' : hearingStatus === 'poor' ? 'Kém' : 'Chưa rõ'}
          </Tag>
        );
      }
    },
    {
      title: 'Dị ứng',
      key: 'allergies',
      render: (_: any, record: HealthProfile) => {
        const allergies = record.allergies || [];
        return (
          <div>
            {allergies && allergies.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {allergies.slice(0, 2).map((allergy, index) => (
                  <Tag key={index} color="orange">
                    {typeof allergy === 'string' ? allergy : allergy?.name || 'N/A'}
                  </Tag>
                ))}
                {allergies.length > 2 && (
                  <Tag color="orange">+{allergies.length - 2}</Tag>
                )}
              </div>
            ) : (
              <Text type="secondary">Không có</Text>
            )}
          </div>
        );
      }
    },
    {
      title: 'Bệnh mãn tính',
      key: 'chronic_conditions',
      render: (_: any, record: HealthProfile) => {
        const conditions = record.chronic_conditions || record.chronicDiseases || [];
        return (
          <div>
            {conditions && conditions.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {conditions.slice(0, 2).map((condition, index) => (
                  <Tag key={index} color="red">
                    {typeof condition === 'string' ? condition : condition?.name || 'N/A'}
                  </Tag>
                ))}
                {conditions.length > 2 && (
                  <Tag color="red">+{conditions.length - 2}</Tag>
                )}
              </div>
            ) : (
              <Text type="secondary">Không có</Text>
            )}
          </div>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: HealthProfile) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record)}
        >
          Xem chi tiết
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <HeartOutlined style={{ marginRight: '8px' }} />
            Hồ sơ sức khỏe học sinh
          </Title>
          <Text type="secondary">Quản lý và theo dõi tình trạng sức khỏe học sinh</Text>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Input
            placeholder="Tìm theo tên học sinh"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Input
            placeholder="Tìm theo lớp"
            value={searchClass}
            onChange={(e) => setSearchClass(e.target.value)}
            allowClear
            style={{ width: 150 }}
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng số hồ sơ"
              value={filteredProfiles.length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Có dị ứng"
              value={filteredProfiles.filter(p => p.allergies && Array.isArray(p.allergies) && p.allergies.length > 0).length}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Bệnh mãn tính"
              value={filteredProfiles.filter(p => p.chronic_conditions && Array.isArray(p.chronic_conditions) && p.chronic_conditions.length > 0).length}
              valueStyle={{ color: '#f5222d' }}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đang dùng thuốc"
              value={filteredProfiles.filter(p => p.medications && Array.isArray(p.medications) && p.medications.length > 0).length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Health Profiles Table */}
      <Card title="Danh sách hồ sơ sức khỏe">
        <Table
          columns={columns}
          dataSource={filteredProfiles}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} hồ sơ`
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết hồ sơ sức khỏe"
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedProfile(null);
        }}
        width={800}
        footer={null}
      >
        {selectedProfile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Descriptions bordered>
              <Descriptions.Item label="Học sinh" span={2}>
                {getStudentName(selectedProfile)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái thị lực">
                {selectedProfile.vision_status ? (
                  <Tag color={getHealthStatusColor(selectedProfile.vision_status)}>
                    {selectedProfile.vision_status === 'good' ? 'Tốt' : 
                     selectedProfile.vision_status === 'fair' ? 'Trung bình' : 
                     selectedProfile.vision_status === 'poor' ? 'Kém' : selectedProfile.vision_status}
                  </Tag>
                ) : selectedProfile.vision ? (
                  <div>
                    <div>Mắt trái: {selectedProfile.vision.leftEye || 'N/A'}</div>
                    <div>Mắt phải: {selectedProfile.vision.rightEye || 'N/A'}</div>
                  </div>
                ) : 'Chưa có thông tin'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái thính giác">
                {selectedProfile.hearing_status ? (
                  <Tag color={getHealthStatusColor(selectedProfile.hearing_status)}>
                    {selectedProfile.hearing_status === 'good' ? 'Tốt' : 
                     selectedProfile.hearing_status === 'fair' ? 'Trung bình' : 
                     selectedProfile.hearing_status === 'poor' ? 'Kém' : selectedProfile.hearing_status}
                  </Tag>
                ) : selectedProfile.hearing ? (
                  <div>
                    <div>Tai trái: {getHearingStatusText(selectedProfile.hearing.leftEar || 'N/A')}</div>
                    <div>Tai phải: {getHearingStatusText(selectedProfile.hearing.rightEar || 'N/A')}</div>
                  </div>
                ) : 'Chưa có thông tin'}
              </Descriptions.Item>
            </Descriptions>

            {/* Allergies */}
            <Card title="Dị ứng" size="small">
              {selectedProfile.allergies && selectedProfile.allergies.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedProfile.allergies.map((allergy, index) => (
                    <div key={index} style={{ marginBottom: '8px' }}>
                      <Tag color="orange">
                        {typeof allergy === 'string' ? allergy : allergy?.name || 'N/A'}
                      </Tag>
                      {typeof allergy === 'object' && allergy?.severity && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Mức độ: {allergy.severity}
                        </div>
                      )}
                      {typeof allergy === 'object' && allergy?.notes && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Ghi chú: {allergy.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Text type="secondary">Không có dị ứng</Text>
              )}
            </Card>

            {/* Chronic Conditions */}
            <Card title="Bệnh mãn tính" size="small">
              {(selectedProfile.chronic_conditions || selectedProfile.chronicDiseases) && 
               (selectedProfile.chronic_conditions || selectedProfile.chronicDiseases)!.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(selectedProfile.chronic_conditions || selectedProfile.chronicDiseases)!.map((condition, index) => (
                    <Tag key={index} color="red">
                      {typeof condition === 'string' ? condition : condition?.name || 'N/A'}
                    </Tag>
                  ))}
                </div>
              ) : (
                <Text type="secondary">Không có bệnh mãn tính</Text>
              )}
            </Card>

            {/* Medications */}
            <Card title="Thuốc đang sử dụng" size="small">
              {selectedProfile.medications && selectedProfile.medications.length > 0 ? (
                <List
                  dataSource={selectedProfile.medications}
                  renderItem={(medication, index) => (
                    <List.Item key={index}>
                      <List.Item.Meta
                        title={typeof medication === 'string' ? medication : medication?.name || 'N/A'}
                        description={typeof medication === 'object' && medication?.dosage ? 
                          `Liều dùng: ${medication.dosage}${medication?.frequency ? ` - ${medication.frequency}` : ''}` : 
                          undefined}
                        avatar={<Avatar icon={<MedicineBoxOutlined />} size="small" />}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">Không có thuốc đang sử dụng</Text>
              )}
            </Card>

            {/* Vaccination Records */}
            <Card title="Lịch sử tiêm chủng" size="small">
              {(selectedProfile.vaccination_records || selectedProfile.vaccinations) && 
               (selectedProfile.vaccination_records || selectedProfile.vaccinations)!.length > 0 ? (
                <List
                  dataSource={selectedProfile.vaccination_records || selectedProfile.vaccinations}
                  renderItem={(record) => (
                    <List.Item key={(record as any).vaccine_name + (record as any).date_administered}>
                      <List.Item.Meta
                        title={(record as any).vaccine_name}
                        description={
                          <div>
                            <div>Ngày tiêm: {(record as any).date_administered ? 
                              new Date((record as any).date_administered).toLocaleDateString('vi-VN') : 'N/A'}</div>
                            <div>Mũi số: {(record as any).dose_number || 'N/A'}</div>
                            <div>Người tiêm: {(record as any).administered_by || 'N/A'}</div>
                            {(record as any).notes && <div>Ghi chú: {(record as any).notes}</div>}
                          </div>
                        }
                        avatar={<Avatar icon={<MedicineBoxOutlined />} size="small" />}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">Chưa có lịch sử tiêm chủng</Text>
              )}
            </Card>

            {/* Medical History */}
            <Card title="Tiền sử bệnh" size="small">
              {(selectedProfile.medical_history || selectedProfile.treatmentHistory) && 
               (selectedProfile.medical_history || selectedProfile.treatmentHistory)!.length > 0 ? (
                <List
                  dataSource={selectedProfile.medical_history || selectedProfile.treatmentHistory}
                  renderItem={(history, index) => (
                    <List.Item key={index}>
                      <List.Item.Meta
                        title={typeof history === 'string' ? history : (history as any).name || 'N/A'}
                        description={typeof history === 'object' && (history as any).notes ? (history as any).notes : undefined}
                        avatar={<Avatar icon={<FileTextOutlined />} size="small" />}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">Không có tiền sử bệnh</Text>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NurseHealthProfiles;
