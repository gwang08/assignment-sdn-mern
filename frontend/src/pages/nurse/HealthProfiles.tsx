import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Drawer,
  Descriptions,
  List,
  Divider,
  Alert,
  message,
  Tabs
} from 'antd';
import {
  HeartOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  AlertOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import apiService from '../../services/api';
import { Student, HealthProfile, VaccinationRecord } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const HealthProfilesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStudents();
      if (response.success && response.data) {
        setStudents(response.data);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải danh sách học sinh');
    } finally {
      setLoading(false);
    }
  };

  const loadHealthProfile = async (studentId: string) => {
    try {
      const response = await apiService.getHealthProfile(studentId);
      if (response.success && response.data) {
        setHealthProfile(response.data);
      } else {
        setHealthProfile(null);
      }
    } catch (error) {
      setHealthProfile(null);
    }
  };

  const handleViewProfile = async (student: Student) => {
    setSelectedStudent(student);
    await loadHealthProfile(student._id);
    setIsDetailDrawerVisible(true);
  };

  const handleEditProfile = async (student: Student) => {
    setSelectedStudent(student);
    await loadHealthProfile(student._id);
    
    if (healthProfile) {
      form.setFieldsValue({
        allergies: healthProfile.allergies.join(', '),
        chronic_conditions: healthProfile.chronic_conditions.join(', '),
        medications: healthProfile.medications.join(', '),
        medical_history: healthProfile.medical_history.join(', '),
        vision_status: healthProfile.vision_status,
        hearing_status: healthProfile.hearing_status,
      });
    }
    
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    if (!selectedStudent) return;

    try {
      const profileData = {
        ...values,
        allergies: values.allergies ? values.allergies.split(',').map((s: string) => s.trim()) : [],
        chronic_conditions: values.chronic_conditions ? values.chronic_conditions.split(',').map((s: string) => s.trim()) : [],
        medications: values.medications ? values.medications.split(',').map((s: string) => s.trim()) : [],
        medical_history: values.medical_history ? values.medical_history.split(',').map((s: string) => s.trim()) : [],
      };

      const response = await apiService.updateHealthProfile(selectedStudent._id, profileData);
      if (response.success) {
        message.success('Cập nhật hồ sơ sức khỏe thành công');
        setIsModalVisible(false);
        form.resetFields();
        if (isDetailDrawerVisible) {
          await loadHealthProfile(selectedStudent._id);
        }
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật hồ sơ sức khỏe');
    }
  };

  const getHealthStatus = (profile: HealthProfile | null) => {
    if (!profile) return { status: 'unknown', color: 'default', text: 'Chưa có hồ sơ' };
    
    const hasAllergies = profile.allergies.length > 0;
    const hasChronicConditions = profile.chronic_conditions.length > 0;
    const hasMedications = profile.medications.length > 0;
    
    if (hasChronicConditions || hasMedications) {
      return { status: 'needs-attention', color: 'orange', text: 'Cần chú ý' };
    }
    
    if (hasAllergies) {
      return { status: 'allergies', color: 'yellow', text: 'Có dị ứng' };
    }
    
    return { status: 'normal', color: 'green', text: 'Bình thường' };
  };

  const columns: ColumnsType<Student> = [
    {
      title: 'Học sinh',
      key: 'student',
      width: 200,
      render: (_, record: Student) => (
        <div>
          <div className="font-medium">{record.first_name} {record.last_name}</div>
          <Text className="text-sm text-gray-500">{record.class_name}</Text>
        </div>
      ),
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      render: (gender: string) => {
        const genderLabels = {
          male: 'Nam',
          female: 'Nữ',
          other: 'Khác'
        };
        return genderLabels[gender as keyof typeof genderLabels] || gender;
      },
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
      width: 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
    },
    {
      title: 'Trạng thái sức khỏe',
      key: 'health_status',
      width: 150,
      render: (_, record: Student) => {
        // This would need to be loaded from health profile
        const status = getHealthStatus(null);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: 'Hồ sơ y tế',
      key: 'profile_status',
      width: 120,
      render: () => (
        <Tag color="blue">Có hồ sơ</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record: Student) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewProfile(record)}
            title="Xem hồ sơ"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditProfile(record)}
            title="Chỉnh sửa"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="m-0">
            <HeartOutlined className="mr-2" />
            Quản lý Hồ sơ Sức khỏe
          </Title>
          <Text type="secondary">
            Theo dõi và cập nhật hồ sơ sức khỏe của học sinh
          </Text>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={students}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: students.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} học sinh`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        title={
          selectedStudent ? 
          `Cập nhật hồ sơ sức khỏe - ${selectedStudent.first_name} ${selectedStudent.last_name}` : 
          'Cập nhật hồ sơ sức khỏe'
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={800}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vision_status"
                label="Tình trạng thị lực"
              >
                <Select placeholder="Chọn tình trạng thị lực">
                  <Option value="normal">Bình thường</Option>
                  <Option value="myopia">Cận thị</Option>
                  <Option value="hyperopia">Viễn thị</Option>
                  <Option value="astigmatism">Loạn thị</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hearing_status"
                label="Tình trạng thính lực"
              >
                <Select placeholder="Chọn tình trạng thính lực">
                  <Option value="normal">Bình thường</Option>
                  <Option value="mild_loss">Giảm nhẹ</Option>
                  <Option value="moderate_loss">Giảm trung bình</Option>
                  <Option value="severe_loss">Giảm nặng</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="allergies"
            label="Dị ứng"
            help="Nhập các loại dị ứng, phân cách bằng dấu phẩy"
          >
            <Input placeholder="Ví dụ: phấn hoa, tôm cua, thuốc kháng sinh" />
          </Form.Item>

          <Form.Item
            name="chronic_conditions"
            label="Bệnh mãn tính"
            help="Nhập các bệnh mãn tính, phân cách bằng dấu phẩy"
          >
            <Input placeholder="Ví dụ: hen suyễn, tiểu đường, cao huyết áp" />
          </Form.Item>

          <Form.Item
            name="medications"
            label="Thuốc đang sử dụng"
            help="Nhập các loại thuốc đang sử dụng, phân cách bằng dấu phẩy"
          >
            <Input placeholder="Ví dụ: insulin, thuốc hen suyễn" />
          </Form.Item>

          <Form.Item
            name="medical_history"
            label="Tiền sử bệnh"
            help="Nhập tiền sử bệnh, phân cách bằng dấu phẩy"
          >
            <TextArea rows={3} placeholder="Ví dụ: đã phẫu thuật ruột thừa, từng bị gãy xương" />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsModalVisible(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title={
          selectedStudent ? 
          `Hồ sơ sức khỏe - ${selectedStudent.first_name} ${selectedStudent.last_name}` : 
          'Hồ sơ sức khỏe'
        }
        placement="right"
        size="large"
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
      >
        {selectedStudent && (
          <div className="space-y-6">
            <Card>
              <Descriptions title="Thông tin cơ bản" bordered column={1}>
                <Descriptions.Item label="Họ tên">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </Descriptions.Item>
                <Descriptions.Item label="Lớp">
                  {selectedStudent.class_name}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {selectedStudent.gender === 'male' ? 'Nam' : selectedStudent.gender === 'female' ? 'Nữ' : 'Khác'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString('vi-VN') : 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {healthProfile ? (
              <Tabs defaultActiveKey="basic">
                <TabPane tab="Thông tin cơ bản" key="basic">
                  <Card>
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Tình trạng thị lực">
                        {healthProfile.vision_status || 'Chưa cập nhật'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tình trạng thính lực">
                        {healthProfile.hearing_status || 'Chưa cập nhật'}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </TabPane>

                <TabPane tab="Dị ứng & Bệnh mãn tính" key="medical">
                  <div className="space-y-4">
                    <Card title="Dị ứng" size="small">
                      {healthProfile.allergies.length > 0 ? (
                        <Space wrap>
                          {healthProfile.allergies.map((allergy, index) => (
                            <Tag key={index} color="red" icon={<AlertOutlined />}>
                              {allergy}
                            </Tag>
                          ))}
                        </Space>
                      ) : (
                        <Text type="secondary">Không có dị ứng</Text>
                      )}
                    </Card>

                    <Card title="Bệnh mãn tính" size="small">
                      {healthProfile.chronic_conditions.length > 0 ? (
                        <Space wrap>
                          {healthProfile.chronic_conditions.map((condition, index) => (
                            <Tag key={index} color="orange">
                              {condition}
                            </Tag>
                          ))}
                        </Space>
                      ) : (
                        <Text type="secondary">Không có bệnh mãn tính</Text>
                      )}
                    </Card>
                  </div>
                </TabPane>

                <TabPane tab="Thuốc & Tiền sử" key="medication">
                  <div className="space-y-4">
                    <Card title="Thuốc đang sử dụng" size="small">
                      {healthProfile.medications.length > 0 ? (
                        <Space wrap>
                          {healthProfile.medications.map((medication, index) => (
                            <Tag key={index} color="blue" icon={<MedicineBoxOutlined />}>
                              {medication}
                            </Tag>
                          ))}
                        </Space>
                      ) : (
                        <Text type="secondary">Không có thuốc đang sử dụng</Text>
                      )}
                    </Card>

                    <Card title="Tiền sử bệnh" size="small">
                      {healthProfile.medical_history.length > 0 ? (
                        <List
                          dataSource={healthProfile.medical_history}
                          renderItem={(item, index) => (
                            <List.Item>
                              <Text>{index + 1}. {item}</Text>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">Không có tiền sử bệnh</Text>
                      )}
                    </Card>
                  </div>
                </TabPane>

                <TabPane tab="Tiêm chủng" key="vaccination">
                  <Card title="Lịch sử tiêm chủng">
                    {healthProfile.vaccination_records.length > 0 ? (
                      <List
                        dataSource={healthProfile.vaccination_records}
                        renderItem={(record: VaccinationRecord) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<SafetyOutlined className="text-green-500" />}
                              title={record.vaccine_name}
                              description={
                                <div>
                                  <Text>Ngày tiêm: {new Date(record.date_administered).toLocaleDateString('vi-VN')}</Text>
                                  <br />
                                  <Text>Mũi số: {record.dose_number}</Text>
                                  <br />
                                  <Text>Người tiêm: {record.administered_by}</Text>
                                  {record.notes && (
                                    <>
                                      <br />
                                      <Text type="secondary">Ghi chú: {record.notes}</Text>
                                    </>
                                  )}
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Text type="secondary">Chưa có lịch sử tiêm chủng</Text>
                    )}
                  </Card>
                </TabPane>
              </Tabs>
            ) : (
              <Alert
                message="Chưa có hồ sơ sức khỏe"
                description="Học sinh này chưa có hồ sơ sức khỏe. Vui lòng tạo hồ sơ mới."
                type="info"
                showIcon
                action={
                  <Button type="primary" onClick={() => handleEditProfile(selectedStudent)}>
                    Tạo hồ sơ
                  </Button>
                }
              />
            )}

            <div className="flex space-x-2">
              <Button type="primary" onClick={() => handleEditProfile(selectedStudent)}>
                Chỉnh sửa hồ sơ
              </Button>
              <Button>In hồ sơ</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default HealthProfilesPage;
