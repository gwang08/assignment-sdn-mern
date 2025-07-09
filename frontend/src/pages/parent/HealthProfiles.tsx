import {
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography
} from 'antd';
import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import { HealthProfile, Student } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;

const ParentHealthProfiles: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [healthProfiles, setHealthProfiles] = useState<HealthProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<HealthProfile | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [form] = Form.useForm();

  useEffect(() => {
    // Kiểm tra token trước khi gọi API
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login instead of calling API
      window.location.href = '/login';
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Vui lòng đăng nhập lại');
        window.location.href = '/login';
        return;
      }
      
      const [studentsResponse, profilesResponse] = await Promise.all([
        apiService.getParentStudents(),
        apiService.getParentHealthProfiles()
      ]);

      if (studentsResponse.success && studentsResponse.data) {
        // API trả về mảng các object với format: { student: {...}, relationship: "...", is_emergency_contact: ... }
        const studentData = studentsResponse.data.map((item: any) => item.student);
        setStudents(studentData);
      }

      if (profilesResponse.success && profilesResponse.data) {
        setHealthProfiles(profilesResponse.data);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      
      // Kiểm tra lỗi 401 và redirect
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
    // Support both old format (student_id) and new format (student)
    const studentId = profile.student_id || (profile as any).student;
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

  const handleEdit = (profile: HealthProfile) => {
    setEditingProfile(profile);
    
    // Populate form with current data
    const formData = {
      allergies: profile.allergies || [],
      chronicDiseases: profile.chronic_conditions || profile.chronicDiseases || [],
      vision: {
        leftEye: profile.vision?.leftEye || 0,
        rightEye: profile.vision?.rightEye || 0
      },
      hearing: {
        leftEar: profile.hearing?.leftEar || 'Normal',
        rightEar: profile.hearing?.rightEar || 'Normal'
      }
    };
    
    form.setFieldsValue(formData);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const formValues = await form.validateFields();
      const studentId = editingProfile?.student_id || editingProfile?.student;
      
      if (!studentId) {
        message.error('Không tìm thấy thông tin học sinh');
        return;
      }

      setLoading(true);
      
      const updateData = {
        student: studentId,
        allergies: formValues.allergies || [],
        chronicDiseases: formValues.chronicDiseases || [],
        vision: {
          leftEye: formValues.vision?.leftEye || 0,
          rightEye: formValues.vision?.rightEye || 0
        },
        hearing: {
          leftEar: formValues.hearing?.leftEar || 'Normal',
          rightEar: formValues.hearing?.rightEar || 'Normal'
        }
      };

      const response = await apiService.updateStudentHealthProfile(studentId, updateData);
      
      if (response.success) {
        message.success('Cập nhật hồ sơ sức khỏe thành công');
        setIsEditModalVisible(false);
        setEditingProfile(null);
        form.resetFields();
        await loadData(); // Reload data
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
      }
    } catch (error: any) {
      console.error('Error updating health profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        message.error('Phiên đăng nhập đã hết hạn');
        window.location.href = '/login';
        return;
      }
      message.error('Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = healthProfiles.filter(profile => {
    const studentId = profile.student_id || profile.student;
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
        const studentId = record.student_id || record.student;
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
        let visionStatus = record.vision_status;
        
        // Nếu không có vision_status, tính toán dựa trên vision
        if (!visionStatus && record.vision) {
          const leftEye = record.vision.leftEye || 0;
          const rightEye = record.vision.rightEye || 0;
          
          // Đánh giá theo mắt kém hơn (min) vì đây là điểm yếu cần chú ý
          const minVision = Math.min(leftEye, rightEye);
          
          // Logic thị lực: 1.0 = 10/10, 0.6 = 6/10, etc.
          // Chuyển đổi: nếu giá trị > 1 thì chia cho 10 (ví dụ: 6 -> 0.6, 10 -> 1.0)
          const normalizedVision = minVision > 1 ? minVision / 10 : minVision;
          
          if (normalizedVision >= 0.8) {
            visionStatus = 'good';      // 8/10 trở lên là tốt
          } else if (normalizedVision >= 0.5) {
            visionStatus = 'fair';      // 5/10 - 7/10 là trung bình
          } else {
            visionStatus = 'poor';      // Dưới 5/10 là kém
          }
        }
        
        if (!visionStatus) {
          visionStatus = 'unknown';
        }
        
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
        let hearingStatus = record.hearing_status;
        
        // Nếu không có hearing_status, tính toán dựa trên hearing
        if (!hearingStatus && record.hearing) {
          const leftEar = record.hearing.leftEar || 'Normal';
          const rightEar = record.hearing.rightEar || 'Normal';
          
          if (leftEar === 'Normal' && rightEar === 'Normal') {
            hearingStatus = 'good';
          } else if (leftEar === 'Severe Loss' || rightEar === 'Severe Loss') {
            hearingStatus = 'poor';
          } else {
            hearingStatus = 'fair';
          }
        }
        
        if (!hearingStatus) {
          hearingStatus = 'unknown';
        }
        
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
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Xem chi tiết
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Chỉnh sửa
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

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa hồ sơ sức khỏe"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingProfile(null);
          form.resetFields();
        }}
        onOk={handleSaveEdit}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={800}
        confirmLoading={loading}
      >
        {editingProfile && (
          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: '20px' }}
          >
            <Divider orientation="left">Thông tin cơ bản</Divider>
            <Form.Item label="Học sinh">
              <Input 
                value={getStudentName(editingProfile)}
                disabled
              />
            </Form.Item>

            <Divider orientation="left">Thị lực</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name={['vision', 'leftEye']} 
                  label="Mắt trái (độ thị lực)"
                  rules={[{ type: 'number', min: 0, max: 10 }]}
                >
                  <InputNumber 
                    min={0} 
                    max={10} 
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="Ví dụ: 1.0"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name={['vision', 'rightEye']} 
                  label="Mắt phải (độ thị lực)"
                  rules={[{ type: 'number', min: 0, max: 10 }]}
                >
                  <InputNumber 
                    min={0} 
                    max={10} 
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="Ví dụ: 1.0"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Thính giác</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name={['hearing', 'leftEar']} 
                  label="Tai trái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái thính giác' }]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Option value="Normal">Bình thường</Option>
                    <Option value="Mild Loss">Suy giảm nhẹ</Option>
                    <Option value="Moderate Loss">Suy giảm trung bình</Option>
                    <Option value="Severe Loss">Suy giảm nặng</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name={['hearing', 'rightEar']} 
                  label="Tai phải"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái thính giác' }]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Option value="Normal">Bình thường</Option>
                    <Option value="Mild Loss">Suy giảm nhẹ</Option>
                    <Option value="Moderate Loss">Suy giảm trung bình</Option>
                    <Option value="Severe Loss">Suy giảm nặng</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Dị ứng</Divider>
            <Form.List name="allergies">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={16} align="middle">
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          rules={[{ required: true, message: 'Vui lòng nhập tên dị ứng' }]}
                        >
                          <Input placeholder="Tên dị ứng" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'severity']}
                          rules={[{ required: true, message: 'Chọn mức độ' }]}
                        >
                          <Select placeholder="Mức độ">
                            <Option value="Mild">Nhẹ</Option>
                            <Option value="Moderate">Trung bình</Option>
                            <Option value="Severe">Nặng</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'notes']}
                        >
                          <Input placeholder="Ghi chú" />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm dị ứng
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Divider orientation="left">Bệnh mãn tính</Divider>
            <Form.List name="chronicDiseases">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={16} align="middle">
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          rules={[{ required: true, message: 'Vui lòng nhập tên bệnh' }]}
                        >
                          <Input placeholder="Tên bệnh" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'status']}
                          rules={[{ required: true, message: 'Chọn trạng thái' }]}
                        >
                          <Select placeholder="Trạng thái">
                            <Option value="Active">Đang điều trị</Option>
                            <Option value="Managed">Đã kiểm soát</Option>
                            <Option value="Resolved">Đã khỏi</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'notes']}
                        >
                          <Input placeholder="Ghi chú" />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm bệnh mãn tính
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ParentHealthProfiles;
