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
  Statistic,
  Space,
  List,
  Descriptions,
} from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PhoneOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { Student, ConsultationSchedule, MedicalStaff } from '../../types';
import apiService from '../../services/api';

const { Title, Text } = Typography;

const ParentConsultations: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState<ConsultationSchedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [medicalStaff, setMedicalStaff] = useState<MedicalStaff[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationSchedule | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load consultations and students - medical staff info will be included in consultation data
      const [consultationsResponse, studentsResponse] = await Promise.all([
        apiService.getParentConsultationSchedules(),
        apiService.getParentStudents()
      ]);

      if (consultationsResponse.success && consultationsResponse.data) {
        setConsultations(consultationsResponse.data);
      }

      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);
      }

      // Note: Parent doesn't have access to medical staff list
      // Medical staff info should be included in consultation data from backend
      setMedicalStaff([]);
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const colors = {
      requested: 'purple',
      scheduled: 'blue',
      completed: 'green',
      cancelled: 'red',
      rescheduled: 'orange'
    };
    return colors[normalizedStatus as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const statusText = {
      requested: 'Chờ xác nhận',
      scheduled: 'Đã lên lịch',
      completed: 'Đã hoàn thành',
      cancelled: 'Đã hủy',
      rescheduled: 'Đã dời lịch'
    };
    return statusText[normalizedStatus as keyof typeof statusText] || status;
  };

  const getConsultationTypeIcon = (type: string) => {
    const icons = {
      in_person: <UserOutlined />,
      phone: <PhoneOutlined />,
      video: <VideoCameraOutlined />
    };
    return icons[type as keyof typeof icons] || <UserOutlined />;
  };

  const getConsultationTypeText = (type: string) => {
    const typeText = {
      in_person: 'Trực tiếp',
      phone: 'Điện thoại',
      video: 'Video call'
    };
    return typeText[type as keyof typeof typeText] || type;
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 'N/A';
  };

  const getMedicalStaffName = (staffId: string) => {
    // Try to find from the loaded medical staff list first
    const staff = medicalStaff.find(s => s._id === staffId);
    if (staff) {
      const roleText = staff.role === 'Doctor' ? 'Bác sĩ' : 
                       staff.role === 'Nurse' ? 'Y tá' : 
                       staff.role === 'Healthcare Assistant' ? 'Trợ lý y tế' : staff.role;
      return `${roleText} ${staff.first_name} ${staff.last_name}`;
    }
    
    // If not found, try to get from consultation data itself
    // (Backend should include medical staff info in consultation response)
    return 'Bác sĩ/Y tá';
  };

  const handleViewDetail = (consultation: ConsultationSchedule) => {
    setSelectedConsultation(consultation);
    setIsDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Học sinh',
      key: 'student',
      width: 180,
      render: (_: any, record: ConsultationSchedule) => {
        const student = students.find(s => s._id === record.student_id);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: '14px', lineHeight: '18px' }}>
                {student ? `${student.first_name} ${student.last_name}` : 'N/A'}
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>{student?.class_name}</Text>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Bác sĩ/Y tá',
      key: 'medical_staff',
      width: 160,
      render: (_: any, record: ConsultationSchedule) => {
        const staff = medicalStaff.find(s => s._id === record.medical_staff_id);
        return (
          <div style={{ fontSize: '13px' }}>
            {staff ? `${staff.role} ${staff.first_name} ${staff.last_name}` : 'N/A'}
          </div>
        );
      }
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      render: (text: string) => (
        <div style={{ fontSize: '13px', lineHeight: '18px' }}>
          {text}
        </div>
      )
    },
    {
      title: 'Thời gian',
      key: 'datetime',
      width: 130,
      render: (_: any, record: ConsultationSchedule) => (
        <div style={{ fontSize: '13px' }}>
          {record.appointment_date ? (
            <>
              <div style={{ fontWeight: 500 }}>{moment(record.appointment_date).format('DD/MM/YYYY')}</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>{record.appointment_time}</Text>
            </>
          ) : (
            <Text type="secondary" style={{ fontSize: '12px' }}>Chưa xác định</Text>
          )}
        </div>
      )
    },
    {
      title: 'Hình thức',
      key: 'type',
      width: 110,
      render: (_: any, record: ConsultationSchedule) => (
        <Tag 
          icon={getConsultationTypeIcon(record.consultation_type)} 
          color="blue"
          style={{ fontSize: '11px', padding: '0 4px' }}
        >
          {getConsultationTypeText(record.consultation_type)}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ fontSize: '11px', padding: '0 4px' }}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_: any, record: ConsultationSchedule) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {/* Note: Parent không có quyền chỉnh sửa hoặc hủy lịch tư vấn
              Chỉ có thể xem chi tiết và liên hệ trực tiếp với y tế trường */}
        </Space>
      )
    }
  ];

  const renderConsultationDetail = () => {
    if (!selectedConsultation) return null;

    const student = students.find(s => s._id === selectedConsultation.student_id);
    const staff = medicalStaff.find(s => s._id === selectedConsultation.medical_staff_id);

    return (
      <Modal
        title={`Chi tiết lịch tư vấn - ${selectedConsultation.reason}`}
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedConsultation(null);
        }}
        width={600}
        footer={null}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Trạng thái: </Text>
                <Tag color={getStatusColor(selectedConsultation.status)}>
                  {getStatusText(selectedConsultation.status)}
                </Tag>
              </div>
              <Text type="secondary">
                Đặt lịch: {moment(selectedConsultation.createdAt).format('DD/MM/YYYY')}
              </Text>
            </div>
          </Card>

          <Descriptions bordered column={1}>
            <Descriptions.Item label="Học sinh">
              {student ? `${student.first_name} ${student.last_name} - ${student.class_name}` : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Bác sĩ/Y tá">
              {staff ? `${staff.role} ${staff.first_name} ${staff.last_name}` : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Chuyên khoa">
              {staff?.specialization || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tư vấn">
              {selectedConsultation.appointment_date ? 
                moment(selectedConsultation.appointment_date).format('DD/MM/YYYY') : 
                'Chưa xác định'
              }
            </Descriptions.Item>
            <Descriptions.Item label="Giờ tư vấn">
              {selectedConsultation.appointment_time || 'Chưa xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Hình thức">
              <Tag icon={getConsultationTypeIcon(selectedConsultation.consultation_type)} color="blue">
                {getConsultationTypeText(selectedConsultation.consultation_type)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do tư vấn">
              {selectedConsultation.reason}
            </Descriptions.Item>
          </Descriptions>

          {selectedConsultation.notes && (
            <Card title="Ghi chú của phụ huynh" size="small">
              <div style={{ padding: '8px', backgroundColor: '#f6f6f6', borderRadius: '4px' }}>
                {selectedConsultation.notes}
              </div>
            </Card>
          )}

          {selectedConsultation.doctor_notes && (
            <Card title="Ghi chú của bác sĩ" size="small">
              <div style={{ 
                padding: '8px', 
                backgroundColor: '#f0f5ff', 
                borderRadius: '4px' 
              }}>
                {selectedConsultation.doctor_notes}
              </div>
            </Card>
          )}

          {selectedConsultation.follow_up_required && selectedConsultation.follow_up_date && (
            <Card title="Lịch hẹn tái khám" size="small">
              <div style={{ 
                padding: '8px', 
                backgroundColor: '#fff7e6', 
                borderRadius: '4px' 
              }}>
                <Text strong>Ngày tái khám: </Text>
                {moment(selectedConsultation.follow_up_date).format('DD/MM/YYYY')}
              </div>
            </Card>
          )}

          {staff && (
            <Card title="Thông tin liên hệ" size="small">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><Text strong>Email:</Text> {staff.email}</div>
                <div><Text strong>Điện thoại:</Text> {staff.phone_number}</div>
                <div><Text strong>Khoa:</Text> {staff.department}</div>
              </div>
            </Card>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Lịch tư vấn</Title>
          <Text type="secondary">Theo dõi các buổi tư vấn với bác sĩ của con em</Text>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng yêu cầu"
              value={consultations.length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Chờ xác nhận"
              value={consultations.filter(c => c.status.toLowerCase() === 'requested').length}
              valueStyle={{ color: '#722ed1' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã lên lịch"
              value={consultations.filter(c => c.status.toLowerCase() === 'scheduled').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={consultations.filter(c => c.status.toLowerCase() === 'completed').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Danh sách lịch tư vấn">
            <Table
              columns={columns}
              dataSource={consultations}
              rowKey="_id"
              loading={loading}
              scroll={{ x: 1100 }}
              size="middle"
              pagination={{
                total: consultations.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lịch hẹn`
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Information Card */}
            <Card title="Thông tin liên hệ" style={{ backgroundColor: '#f6f8ff' }}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  Cần tư vấn sức khỏe cho con em?
                </Text>
                <div style={{ marginTop: '12px', marginBottom: '16px' }}>
                  <Text>
                    Vui lòng liên hệ trực tiếp với phòng y tế nhà trường để đặt lịch tư vấn
                  </Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PhoneOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Hotline: 028-xxxx-xxxx</Text>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Thời gian làm việc: 7:30 - 16:30
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Thứ 2 - Thứ 6
                    </Text>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Lịch hẹn sắp tới">
              <List
                dataSource={consultations.filter(c => 
                  c.status.toLowerCase() === 'scheduled' && 
                  c.appointment_date &&
                  moment(c.appointment_date).isAfter(moment())
                ).slice(0, 5)}
                renderItem={(consultation) => {
                  const student = students.find(s => s._id === consultation.student_id);
                  const staff = medicalStaff.find(s => s._id === consultation.medical_staff_id);
                  return (
                    <List.Item
                      actions={[
                        <Button type="link" size="small" onClick={() => handleViewDetail(consultation)}>
                          Xem
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={getConsultationTypeIcon(consultation.consultation_type)} 
                            style={{ backgroundColor: '#1890ff' }}
                          />
                        }
                        title={consultation.reason}
                        description={
                          <div>
                            <div><strong>Học sinh:</strong> {student ? `${student.first_name} ${student.last_name}` : 'N/A'}</div>
                            <div><strong>Bác sĩ:</strong> {staff ? `${staff.first_name} ${staff.last_name}` : 'Chờ phân công'}</div>
                            <div><strong>Thời gian:</strong> {consultation.appointment_date ? 
                              `${moment(consultation.appointment_date).format('DD/MM')} lúc ${consultation.appointment_time}` : 
                              'Chưa xác định'
                            }</div>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </Card>

            <Card title="Cần tái khám">
              <List
                dataSource={consultations.filter(c => c.follow_up_required)}
                renderItem={(consultation) => {
                  const student = students.find(s => s._id === consultation.student_id);
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<ExclamationCircleOutlined />} style={{ backgroundColor: '#fa8c16' }} />}
                        title={student ? `${student.first_name} ${student.last_name}` : 'N/A'}
                        description={
                          <div>
                            <div>{consultation.reason}</div>
                            {consultation.follow_up_date && (
                              <div><strong>Ngày tái khám:</strong> {moment(consultation.follow_up_date).format('DD/MM/YYYY')}</div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </Card>

            
          </Space>
        </Col>
      </Row>

      {renderConsultationDetail()}
    </div>
  );
};

export default ParentConsultations;
