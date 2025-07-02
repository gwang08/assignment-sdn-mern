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
  Space,
  List,
  Statistic,
  Select
} from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Student, HealthProfile } from '../../types';
import apiService from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const ParentHealthProfiles: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [healthProfiles, setHealthProfiles] = useState<HealthProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [studentsResponse, profilesResponse] = await Promise.all([
        apiService.getParentStudents(),
        apiService.getParentHealthProfiles()
      ]);

      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);
      }

      if (profilesResponse.success && profilesResponse.data) {
        setHealthProfiles(profilesResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (profile: HealthProfile) => {
    // Try to get student name from student field (which is ID) or student_id
    const studentId = profile.student || profile.student_id;
    if (!studentId) return 'N/A';
    
    const student = students.find(s => s._id === studentId);
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

  const handleViewDetail = (profile: HealthProfile) => {
    setSelectedProfile(profile);
    setIsDetailModalVisible(true);
  };

  const filteredProfiles = healthProfiles.filter(profile => {
    const studentId = profile.student || profile.student_id;
    if (selectedStudent !== 'all' && studentId !== selectedStudent) {
      return false;
    }
    return true;
  });

  const columns = [
    {
      title: 'Học sinh',
      key: 'student',
      render: (_: any, record: HealthProfile) => {
        const studentId = record.student || record.student_id;
        const student = students.find(s => s._id === studentId);
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
        // Handle both vision_status and vision.leftEye/rightEye structure
        if (record.vision_status) {
          return (
            <Tag color={getHealthStatusColor(record.vision_status)}>
              {record.vision_status === 'good' ? 'Tốt' : 
               record.vision_status === 'fair' ? 'Trung bình' : 
               record.vision_status === 'poor' ? 'Kém' : record.vision_status}
            </Tag>
          );
        }
        if (record.vision) {
          return (
            <div>
              <div>Trái: {(record.vision as any).leftEye || 'N/A'}</div>
              <div>Phải: {(record.vision as any).rightEye || 'N/A'}</div>
            </div>
          );
        }
        return <Text type="secondary">Chưa có thông tin</Text>;
      }
    },
    {
      title: 'Trạng thái thính giác',
      key: 'hearing_status',
      render: (_: any, record: HealthProfile) => {
        // Handle both hearing_status and hearing.leftEar/rightEar structure
        if (record.hearing_status) {
          return (
            <Tag color={getHealthStatusColor(record.hearing_status)}>
              {record.hearing_status === 'good' ? 'Tốt' : 
               record.hearing_status === 'fair' ? 'Trung bình' : 
               record.hearing_status === 'poor' ? 'Kém' : record.hearing_status}
            </Tag>
          );
        }
        if (record.hearing) {
          return (
            <div>
              <div>Trái: {(record.hearing as any).leftEar || 'N/A'}</div>
              <div>Phải: {(record.hearing as any).rightEar || 'N/A'}</div>
            </div>
          );
        }
        return <Text type="secondary">Chưa có thông tin</Text>;
      }
    },
    {
      title: 'Dị ứng',
      key: 'allergies',
      render: (_: any, record: HealthProfile) => {
        const allergies = record.allergies;
        if (!allergies || !Array.isArray(allergies) || allergies.length === 0) {
          return <Text type="secondary">Không có</Text>;
        }
        
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {allergies.slice(0, 2).map((allergy, index) => (
              <Tag key={index} color="orange">
                {typeof allergy === 'string' ? allergy : (allergy as any).name || 'N/A'}
              </Tag>
            ))}
            {allergies.length > 2 && (
              <Tag color="orange">+{allergies.length - 2}</Tag>
            )}
          </div>
        );
      }
    },
    {
      title: 'Bệnh mãn tính',
      key: 'chronic_conditions',
      render: (_: any, record: HealthProfile) => {
        // Handle both chronic_conditions and chronicDiseases
        const conditions = record.chronic_conditions || (record as any).chronicDiseases;
        if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
          return <Text type="secondary">Không có</Text>;
        }
        
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {conditions.slice(0, 2).map((condition, index) => (
              <Tag key={index} color="red">
                {typeof condition === 'string' ? condition : (condition as any).name || 'N/A'}
              </Tag>
            ))}
            {conditions.length > 2 && (
              <Tag color="red">+{conditions.length - 2}</Tag>
            )}
          </div>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: HealthProfile) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Xem chi tiết
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Hồ sơ sức khỏe</Title>
          <Text type="secondary">Theo dõi tình trạng sức khỏe của con em</Text>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Select
            value={selectedStudent}
            onChange={setSelectedStudent}
            style={{ width: 200 }}
            placeholder="Chọn học sinh"
          >
            <Option value="all">Tất cả học sinh</Option>
            {students.map(student => (
              <Option key={student._id} value={student._id}>
                {`${student.first_name} ${student.last_name}`}
              </Option>
            ))}
          </Select>
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
              value={filteredProfiles.filter(p => {
                const conditions = p.chronic_conditions || (p as any).chronicDiseases;
                return conditions && Array.isArray(conditions) && conditions.length > 0;
              }).length}
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
                ) : (
                  <Text type="secondary">Chưa có thông tin</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái thính giác">
                {selectedProfile.hearing_status ? (
                  <Tag color={getHealthStatusColor(selectedProfile.hearing_status)}>
                    {selectedProfile.hearing_status === 'good' ? 'Tốt' : 
                     selectedProfile.hearing_status === 'fair' ? 'Trung bình' : 
                     selectedProfile.hearing_status === 'poor' ? 'Kém' : selectedProfile.hearing_status}
                  </Tag>
                ) : (
                  <Text type="secondary">Chưa có thông tin</Text>
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* Allergies */}
            <Card title="Dị ứng" size="small">
              {(selectedProfile.allergies && Array.isArray(selectedProfile.allergies) && selectedProfile.allergies.length > 0) ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedProfile.allergies.map((allergy, index) => (
                    <Tag key={index} color="orange">
                      {typeof allergy === 'string' ? allergy : (allergy as any).name || 'N/A'}
                    </Tag>
                  ))}
                </div>
              ) : (
                <Text type="secondary">Không có dị ứng</Text>
              )}
            </Card>

            {/* Chronic Conditions */}
            <Card title="Bệnh mãn tính" size="small">
              {(selectedProfile.chronic_conditions && Array.isArray(selectedProfile.chronic_conditions) && selectedProfile.chronic_conditions.length > 0) ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedProfile.chronic_conditions.map((condition, index) => (
                    <Tag key={index} color="red">
                      {typeof condition === 'string' ? condition : (condition as any).name || 'N/A'}
                    </Tag>
                  ))}
                </div>
              ) : (
                <Text type="secondary">Không có bệnh mãn tính</Text>
              )}
            </Card>

            {/* Medications */}
            <Card title="Thuốc đang sử dụng" size="small">
              {(selectedProfile.medications && Array.isArray(selectedProfile.medications) && selectedProfile.medications.length > 0) ? (
                <List
                  dataSource={selectedProfile.medications}
                  renderItem={(medication, index) => (
                    <List.Item key={index}>
                      <List.Item.Meta
                        title={typeof medication === 'string' ? medication : (medication as any).name || 'N/A'}
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
              {(selectedProfile.vaccination_records && Array.isArray(selectedProfile.vaccination_records) && selectedProfile.vaccination_records.length > 0) ? (
                <List
                  dataSource={selectedProfile.vaccination_records}
                  renderItem={(record) => (
                    <List.Item key={record.vaccine_name + record.date_administered}>
                      <List.Item.Meta
                        title={record.vaccine_name}
                        description={
                          <div>
                            <div>Ngày tiêm: {new Date(record.date_administered).toLocaleDateString('vi-VN')}</div>
                            <div>Mũi số: {record.dose_number}</div>
                            <div>Người tiêm: {record.administered_by}</div>
                            {record.notes && <div>Ghi chú: {record.notes}</div>}
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
              {(selectedProfile.medical_history && Array.isArray(selectedProfile.medical_history) && selectedProfile.medical_history.length > 0) ? (
                <List
                  dataSource={selectedProfile.medical_history}
                  renderItem={(history, index) => (
                    <List.Item key={index}>
                      <List.Item.Meta
                        title={typeof history === 'string' ? history : (history as any).name || 'N/A'}
                        avatar={<Avatar icon={<FileTextOutlined />} size="small" />}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">Không có tiền sử bệnh</Text>
              )}
            </Card>

            {/* Treatment History */}
            {(selectedProfile as any).treatmentHistory && (
              <Card title="Lịch sử điều trị" size="small">
                {(Array.isArray((selectedProfile as any).treatmentHistory) && (selectedProfile as any).treatmentHistory.length > 0) ? (
                  <List
                    dataSource={(selectedProfile as any).treatmentHistory}
                    renderItem={(treatment: any, index: number) => (
                      <List.Item key={index}>
                        <List.Item.Meta
                          title={typeof treatment === 'string' ? treatment : treatment.name || 'N/A'}
                          description={typeof treatment === 'object' && treatment.description ? treatment.description : undefined}
                          avatar={<Avatar icon={<MedicineBoxOutlined />} size="small" />}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">Không có lịch sử điều trị</Text>
                )}
              </Card>
            )}

            {/* Vision Details */}
            {selectedProfile.vision && (
              <Card title="Chi tiết thị lực" size="small">
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div>
                    <Text strong>Mắt trái: </Text>
                    <Text>{(selectedProfile.vision as any).leftEye || 'N/A'}</Text>
                  </div>
                  <div>
                    <Text strong>Mắt phải: </Text>
                    <Text>{(selectedProfile.vision as any).rightEye || 'N/A'}</Text>
                  </div>
                </div>
              </Card>
            )}

            {/* Hearing Details */}
            {selectedProfile.hearing && (
              <Card title="Chi tiết thính giác" size="small">
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div>
                    <Text strong>Tai trái: </Text>
                    <Text>{(selectedProfile.hearing as any).leftEar || 'N/A'}</Text>
                  </div>
                  <div>
                    <Text strong>Tai phải: </Text>
                    <Text>{(selectedProfile.hearing as any).rightEar || 'N/A'}</Text>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ParentHealthProfiles;
