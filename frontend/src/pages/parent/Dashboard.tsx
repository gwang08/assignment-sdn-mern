import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  Table,
  Tag,
  Typography,
  List,
  Avatar,
  message,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
} from 'antd';
import {
  TeamOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  UserOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import apiService from '../../services/api';
import { Student, MedicineRequest, Campaign } from '../../types';
import { getCampaignType, getCampaignStatus, getCampaignStartDate, getCampaignRequiresConsent } from '../../utils/campaignUtils';

const { Title, Text } = Typography;
const { Option } = Select;

const ParentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [medicineRequests, setMedicineRequests] = useState<MedicineRequest[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [isStudentDetailModalVisible, setIsStudentDetailModalVisible] = useState(false);
  const [isMedicineDetailModalVisible, setIsMedicineDetailModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedMedicineRequest, setSelectedMedicineRequest] = useState<MedicineRequest | null>(null);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', notes: '' }]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [studentsResponse, requestsResponse, campaignsResponse] = await Promise.all([
        apiService.getParentStudents(),
        apiService.getParentMedicineRequests(),
        apiService.getParentCampaigns()
      ]);

      if (studentsResponse.success && studentsResponse.data) {
        // API trả về mảng các object với format: { student: {...}, relationship: "...", is_emergency_contact: ... }
        const studentData = studentsResponse.data.map((item: any) => item.student);
        setStudents(studentData);
      }

      if (requestsResponse.success && requestsResponse.data) {
        setMedicineRequests(requestsResponse.data);
      }

      if (campaignsResponse.success && campaignsResponse.data) {
        setCampaigns(campaignsResponse.data);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMedicineRequest = async (values: any) => {
    try {
      const requestData = {
        startDate: values.start_date.format('YYYY-MM-DD'),
        endDate: values.end_date.format('YYYY-MM-DD'),
        medicines: medicines.filter(med => med.name && med.dosage && med.frequency)
      };

      if (requestData.medicines.length === 0) {
        message.error('Vui lòng điền thông tin ít nhất một loại thuốc');
        return;
      }

      const response = await apiService.createMedicineRequestForStudent(values.student_id, requestData);
      if (response.success) {
        message.success('Gửi yêu cầu thuốc thành công');
        setIsRequestModalVisible(false);
        setMedicines([{ name: '', dosage: '', frequency: '', notes: '' }]);
        form.resetFields();
        loadDashboardData();
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi gửi yêu cầu thuốc');
      }
    } catch (error) {
      console.error('Error creating medicine request:', error);
      message.error('Có lỗi xảy ra khi gửi yêu cầu thuốc');
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', notes: '' }]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length > 1) {
      const newMedicines = medicines.filter((_, i) => i !== index);
      setMedicines(newMedicines);
    }
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    const newMedicines = [...medicines];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setMedicines(newMedicines);
  };

  const viewStudentDetails = (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    if (student) {
      setSelectedStudent(student);
      setIsStudentDetailModalVisible(true);
    }
  };

  const viewMedicineRequestDetail = (request: MedicineRequest) => {
    setSelectedMedicineRequest(request);
    setIsMedicineDetailModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      completed: 'blue'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusText = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Bị từ chối',
      completed: 'Hoàn thành'
    };
    return statusText[status as keyof typeof statusText] || status;
  };

  const requestColumns = [
    {
      title: 'Học sinh',
      key: 'student',
      render: (_: any, record: MedicineRequest) => {
        if (record.student) {
          return `${record.student.first_name} ${record.student.last_name}`;
        }
        const student = students.find(s => s._id === record.student_id);
        return student ? `${student.first_name} ${student.last_name}` : 'N/A';
      }
    },
    {
      title: 'Số loại thuốc',
      key: 'medicine_count',
      render: (_: any, record: MedicineRequest) => {
        const count = record.medicines ? record.medicines.length : 1;
        return (
          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ color: '#1890ff' }}>{count}</Text>
            <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>loại thuốc</Text>
          </div>
        );
      }
    },
    {
      title: 'Thời gian',
      key: 'duration',
      render: (_: any, record: MedicineRequest) => {
        const startDate = record.start_date || record.startDate;
        const endDate = record.end_date || record.endDate;
        return (
          <div>
            <div>{startDate ? moment(startDate).format('DD/MM/YYYY') : 'N/A'}</div>
            <Text style={{ fontSize: '12px', color: '#888' }}>
              đến {endDate ? moment(endDate).format('DD/MM/YYYY') : 'N/A'}
            </Text>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: MedicineRequest) => {
        const status = record.status || 'pending';
        return (
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: MedicineRequest) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => viewMedicineRequestDetail(record)}
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
          <Title level={2} style={{ margin: 0 }}>Dashboard Phụ huynh</Title>
          <Text type="secondary">Theo dõi sức khỏe con em</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsRequestModalVisible(true)}
        >
          Gửi thuốc cho trường
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Con em"
              value={students.length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Yêu cầu thuốc"
              value={medicineRequests.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Chiến dịch hiện tại"
              value={campaigns.filter(c => {
                const status = getCampaignStatus(c);
                return status === 'active';
              }).length}
              valueStyle={{ color: '#722ed1' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Cần xử lý"
              value={medicineRequests.filter(r => !r.status || r.status === 'pending').length + 
                     campaigns.filter(c => {
                       const status = getCampaignStatus(c);
                       const requiresConsent = getCampaignRequiresConsent(c);
                       return status === 'active' && requiresConsent;
                     }).length}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Students Cards */}
      <Card title="Con em của tôi">
        <Row gutter={[16, 16]}>
          {students.map(student => (
            <Col xs={24} sm={12} lg={8} key={student._id}>
              <Card hoverable style={{ height: '100%' }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', margin: '0 auto' }} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      {student.first_name} {student.last_name}
                    </Title>
                    <Text type="secondary">{student.class_name}</Text>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Yêu cầu thuốc:</Text>
                      <Text>{medicineRequests.filter(r => 
                        (r.student_id === student._id || (r.student && r.student._id === student._id))
                      ).length}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Đã duyệt:</Text>
                      <Text strong style={{ color: '#52c41a' }}>
                        {medicineRequests.filter(r => 
                          (r.student_id === student._id || (r.student && r.student._id === student._id)) && 
                          r.status === 'approved'
                        ).length}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Chờ duyệt:</Text>
                      <Text strong style={{ color: '#fa8c16' }}>
                        {medicineRequests.filter(r => 
                          (r.student_id === student._id || (r.student && r.student._id === student._id)) && 
                          (!r.status || r.status === 'pending')
                        ).length}
                      </Text>
                    </div>
                  </div>
                  <Button 
                    type="primary" 
                    block
                    icon={<EyeOutlined />}
                    onClick={() => viewStudentDetails(student._id)}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Medicine Requests and Campaigns */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Yêu cầu gửi thuốc">
            <Table
              dataSource={medicineRequests}
              columns={requestColumns}
              pagination={{ pageSize: 5 }}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Chiến dịch y tế cần xử lý">
            <List
              dataSource={campaigns.filter(c => {
                const status = getCampaignStatus(c);
                const requiresConsent = getCampaignRequiresConsent(c);
                return status === 'active' && requiresConsent;
              })}
              renderItem={(campaign) => (
                <List.Item
                  actions={[
                    <Button type="primary" size="small">Đồng ý</Button>,
                    <Button size="small">Từ chối</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<CalendarOutlined />} 
                        style={{
                          backgroundColor: getCampaignType(campaign) === 'Vaccination' ? '#1890ff' :
                                          getCampaignType(campaign) === 'Checkup' ? '#52c41a' : '#722ed1'
                        }}
                      />
                    }
                    title={campaign.title}
                    description={
                      <div>
                        <Text type="secondary">{campaign.description || 'Không có mô tả'}</Text>
                        <br />
                        <Text style={{ fontSize: '14px' }}>
                          Ngày: {moment(getCampaignStartDate(campaign)).format('DD/MM/YYYY')}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Medicine Request Modal */}
      <Modal
        title="Gửi yêu cầu thuốc cho trường"
        open={isRequestModalVisible}
        onCancel={() => {
          setIsRequestModalVisible(false);
          setMedicines([{ name: '', dosage: '', frequency: '', notes: '' }]);
          form.resetFields();
        }}
        width={600}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleCreateMedicineRequest}
          layout="vertical"
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="student_id"
            label="Chọn con em"
            rules={[{ required: true, message: 'Vui lòng chọn con em' }]}
          >
            <Select placeholder="Chọn con em">
              {students.map(student => (
                <Option key={student._id} value={student._id}>
                  {student.first_name} {student.last_name} - {student.class_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <Text strong>Danh sách thuốc</Text>
              <Button type="dashed" onClick={addMedicine} icon={<PlusOutlined />}>
                Thêm thuốc
              </Button>
            </div>
            
            {medicines.map((medicine, index) => (
              <Card 
                key={index} 
                size="small" 
                style={{ marginBottom: '12px' }}
                title={`Thuốc ${index + 1}`}
                extra={
                  medicines.length > 1 && (
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => removeMedicine(index)}
                    />
                  )
                }
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Tên thuốc"
                      required
                    >
                      <Input 
                        placeholder="Nhập tên thuốc" 
                        value={medicine.name}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Liều dùng"
                      required
                    >
                      <Input 
                        placeholder="Ví dụ: 1 viên" 
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Tần suất sử dụng"
                      required
                    >
                      <Input 
                        placeholder="Ví dụ: 2 lần/ngày" 
                        value={medicine.frequency}
                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Ghi chú"
                    >
                      <Input 
                        placeholder="Ghi chú thêm" 
                        value={medicine.notes}
                        onChange={(e) => updateMedicine(index, 'notes', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Ngày bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="Ngày kết thúc"
                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={() => setIsRequestModalVisible(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Gửi yêu cầu
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Student Detail Modal */}
      <Modal
        title={selectedStudent ? `Chi tiết học sinh: ${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Chi tiết học sinh'}
        open={isStudentDetailModalVisible}
        onCancel={() => setIsStudentDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsStudentDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedStudent && (
          <div style={{ padding: '16px 0' }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Thông tin cơ bản" size="small">
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <Text strong>Họ tên: </Text>
                      <Text>{selectedStudent.first_name} {selectedStudent.last_name}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Lớp: </Text>
                      <Text>{selectedStudent.class_name}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Ngày sinh: </Text>
                      <Text>{selectedStudent.dateOfBirth ? moment(selectedStudent.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Giới tính: </Text>
                      <Text>{selectedStudent.gender === 'male' ? 'Nam' : selectedStudent.gender === 'female' ? 'Nữ' : 'N/A'}</Text>
                    </Col>
                  </Row>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="Yêu cầu thuốc" size="small">
                  <Table
                    dataSource={medicineRequests.filter(r => 
                      r.student_id === selectedStudent._id || (r.student && r.student._id === selectedStudent._id)
                    )}
                    columns={[
                      {
                        title: 'Tên thuốc',
                        key: 'medicine_name',
                        render: (_: any, record: MedicineRequest) => {
                          if (record.medicines && record.medicines.length > 0) {
                            return (
                              <div>
                                {record.medicines.map((med, idx) => (
                                  <div key={idx}>{med.name}</div>
                                ))}
                              </div>
                            );
                          }
                          return record.medicine_name || 'N/A';
                        }
                      },
                      {
                        title: 'Thời gian',
                        key: 'duration',
                        render: (_: any, record: MedicineRequest) => {
                          const startDate = record.start_date || record.startDate;
                          const endDate = record.end_date || record.endDate;
                          return (
                            <div>
                              <div>{startDate ? moment(startDate).format('DD/MM/YYYY') : 'N/A'}</div>
                              <Text style={{ fontSize: '12px', color: '#888' }}>
                                đến {endDate ? moment(endDate).format('DD/MM/YYYY') : 'N/A'}
                              </Text>
                            </div>
                          );
                        }
                      },
                      {
                        title: 'Trạng thái',
                        key: 'status',
                        render: (_: any, record: MedicineRequest) => {
                          const status = record.status || 'pending';
                          return (
                            <Tag color={getStatusColor(status)}>
                              {getStatusText(status)}
                            </Tag>
                          );
                        }
                      }
                    ]}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Medicine Request Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu thuốc"
        open={isMedicineDetailModalVisible}
        onCancel={() => {
          setIsMedicineDetailModalVisible(false);
          setSelectedMedicineRequest(null);
        }}
        width={700}
        footer={[
          <Button key="close" onClick={() => setIsMedicineDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedMedicineRequest && (
          <div style={{ padding: '16px 0' }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card size="small">
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <Text strong>Học sinh: </Text>
                      <Text>
                        {selectedMedicineRequest.student ? 
                          `${selectedMedicineRequest.student.first_name} ${selectedMedicineRequest.student.last_name}` :
                          'N/A'
                        }
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Trạng thái: </Text>
                      <Tag color={getStatusColor(selectedMedicineRequest.status || 'pending')}>
                        {getStatusText(selectedMedicineRequest.status || 'pending')}
                      </Tag>
                    </Col>
                    <Col span={12}>
                      <Text strong>Thời gian: </Text>
                      <Text>
                        {selectedMedicineRequest.start_date || selectedMedicineRequest.startDate ? 
                          moment(selectedMedicineRequest.start_date || selectedMedicineRequest.startDate).format('DD/MM/YYYY') : 'N/A'} - {' '}
                        {selectedMedicineRequest.end_date || selectedMedicineRequest.endDate ? 
                          moment(selectedMedicineRequest.end_date || selectedMedicineRequest.endDate).format('DD/MM/YYYY') : 'N/A'}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Ngày tạo: </Text>
                      <Text>
                        {selectedMedicineRequest.createdAt ? 
                          moment(selectedMedicineRequest.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
                      </Text>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={24}>
                <Card title={`Danh sách thuốc (${selectedMedicineRequest.medicines ? selectedMedicineRequest.medicines.length : 1} loại)`} size="small">
                  {selectedMedicineRequest.medicines && selectedMedicineRequest.medicines.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedMedicineRequest.medicines.map((medicine, index) => (
                        <Card 
                          key={index}
                          size="small"
                          style={{ backgroundColor: '#fafafa' }}
                          title={`Thuốc ${index + 1}: ${medicine.name}`}
                        >
                          <Row gutter={[16, 8]}>
                            <Col span={8}>
                              <Text strong>Liều dùng: </Text>
                              <Text>{medicine.dosage}</Text>
                            </Col>
                            <Col span={8}>
                              <Text strong>Tần suất: </Text>
                              <Text>{medicine.frequency}</Text>
                            </Col>
                            <Col span={8}>
                              {medicine.notes && (
                                <>
                                  <Text strong>Ghi chú: </Text>
                                  <Text>{medicine.notes}</Text>
                                </>
                              )}
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
                      <Row gutter={[16, 8]}>
                        <Col span={24}>
                          <Text strong>Tên thuốc: </Text>
                          <Text>{selectedMedicineRequest.medicine_name || 'N/A'}</Text>
                        </Col>
                        <Col span={12}>
                          <Text strong>Liều dùng: </Text>
                          <Text>{selectedMedicineRequest.dosage || 'N/A'}</Text>
                        </Col>
                        <Col span={12}>
                          <Text strong>Tần suất: </Text>
                          <Text>{selectedMedicineRequest.frequency || 'N/A'}</Text>
                        </Col>
                      </Row>
                    </div>
                  )}
                </Card>
              </Col>

              {(selectedMedicineRequest.notes || selectedMedicineRequest.instructions) && (
                <Col span={24}>
                  <Card title="Ghi chú" size="small">
                    <Text>{selectedMedicineRequest.notes || selectedMedicineRequest.instructions}</Text>
                  </Card>
                </Col>
              )}

              {selectedMedicineRequest.approved_by && (
                <Col span={24}>
                  <Card title="Thông tin duyệt" size="small">
                    <Row gutter={[16, 8]}>
                      <Col span={12}>
                        <Text strong>Được duyệt bởi: </Text>
                        <Text>{selectedMedicineRequest.approved_by}</Text>
                      </Col>
                      {selectedMedicineRequest.approved_at && (
                        <Col span={12}>
                          <Text strong>Thời gian duyệt: </Text>
                          <Text>{moment(selectedMedicineRequest.approved_at).format('DD/MM/YYYY HH:mm')}</Text>
                        </Col>
                      )}
                    </Row>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ParentDashboard;
