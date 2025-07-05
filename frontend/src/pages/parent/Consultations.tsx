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
  Alert,
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

  // Helper functions to safely extract data
  const getStudentFromConsultation = (consultation: ConsultationSchedule): Student | null => {
    if (typeof consultation.student === 'object' && consultation.student) {
      return consultation.student as Student;
    }
    return students.find(s => s._id === consultation.student) || null;
  };

  const getMedicalStaffFromConsultation = (consultation: ConsultationSchedule): MedicalStaff | null => {
    if (typeof consultation.medicalStaff === 'object' && consultation.medicalStaff) {
      return consultation.medicalStaff as MedicalStaff;
    }
    return medicalStaff.find(s => s._id === consultation.medicalStaff) || null;
  };

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
        
        // Extract medical staff from consultation data since they're included
        const staffFromConsultations = consultationsResponse.data
          .filter((consultation: any) => consultation.medicalStaff)
          .map((consultation: any) => consultation.medicalStaff);
        
        // Remove duplicates
        const uniqueStaff = staffFromConsultations.filter((staff: any, index: number, self: any[]) => 
          index === self.findIndex((s: any) => s._id === staff._id)
        );
        
        setMedicalStaff(uniqueStaff);
      }

      if (studentsResponse.success && studentsResponse.data) {
        // API trả về mảng các object với format: { student: {...}, relationship: "...", is_emergency_contact: ... }
        const studentData = studentsResponse.data.map((item: any) => item.student);
        setStudents(studentData);
      }
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
        const student = getStudentFromConsultation(record);
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
        const staff = getMedicalStaffFromConsultation(record);
        return (
          <div style={{ fontSize: '13px' }}>
            {staff ? `${(staff as any).staff_role || 'Bác sĩ'} ${staff.first_name} ${staff.last_name}` : 'N/A'}
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
          {record.scheduledDate ? (
            <>
              <div style={{ fontWeight: 500 }}>
                {moment(record.scheduledDate).format('DD/MM/YYYY')}
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {moment(record.scheduledDate).format('HH:mm')}
              </Text>
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
          icon={getConsultationTypeIcon('in_person')} 
          color="blue"
          style={{ fontSize: '11px', padding: '0 4px' }}
        >
          {getConsultationTypeText('in_person')}
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

    const student = getStudentFromConsultation(selectedConsultation);
    const staff = getMedicalStaffFromConsultation(selectedConsultation);

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
              {staff ? `${(staff as any).staff_role || 'Bác sĩ'} ${staff.first_name} ${staff.last_name}` : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Chuyên khoa">
              {(staff as any)?.staff_role || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tư vấn">
              {selectedConsultation.scheduledDate ? 
                moment(selectedConsultation.scheduledDate).format('DD/MM/YYYY') : 
                'Chưa xác định'
              }
            </Descriptions.Item>
            <Descriptions.Item label="Giờ tư vấn">
              {selectedConsultation.scheduledDate ? moment(selectedConsultation.scheduledDate).format('HH:mm') : 'Chưa xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời lượng">
              {selectedConsultation.duration ? `${selectedConsultation.duration} phút` : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Hình thức">
              <Tag icon={getConsultationTypeIcon('in_person')} color="blue">
                {getConsultationTypeText('in_person')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do tư vấn">
              {selectedConsultation.reason}
            </Descriptions.Item>
          </Descriptions>


          {selectedConsultation.notes && (
            <Card title="Ghi chú" size="small">
              <div style={{ 
                padding: '8px', 
                backgroundColor: '#f0f5ff', 
                borderRadius: '4px' 
              }}>
                {selectedConsultation.notes}
              </div>
            </Card>
          )}

          {staff && (
            <Card title="Thông tin liên hệ" size="small">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><Text strong>Email:</Text> {(staff as any).email || 'N/A'}</div>
                <div><Text strong>Điện thoại:</Text> {(staff as any).phone_number || 'N/A'}</div>
                <div><Text strong>Chức vụ:</Text> {(staff as any).staff_role || 'N/A'}</div>
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
                  c.scheduledDate &&
                  moment(c.scheduledDate).isAfter(moment())
                ).slice(0, 5)}
                renderItem={(consultation) => {
                  const student = getStudentFromConsultation(consultation);
                  const staff = getMedicalStaffFromConsultation(consultation);
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
                            icon={getConsultationTypeIcon('in_person')} 
                            style={{ backgroundColor: '#1890ff' }}
                          />
                        }
                        title={consultation.reason}
                        description={
                          <div>
                            <div><strong>Học sinh:</strong> {student ? `${student.first_name} ${student.last_name}` : 'N/A'}</div>
                            <div><strong>Bác sĩ:</strong> {staff ? `${staff.first_name} ${staff.last_name}` : 'Chờ phân công'}</div>
                            <div><strong>Thời gian:</strong> {consultation.scheduledDate ? 
                              `${moment(consultation.scheduledDate).format('DD/MM/YYYY')} lúc ${moment(consultation.scheduledDate).format('HH:mm')}` : 
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

            <Card title="Cần tái khám" style={{ marginTop: '16px' }}>
              <Alert
                message="Tính năng tái khám"
                description="Tính năng theo dõi tái khám sẽ được cập nhật trong phiên bản tiếp theo."
                type="info"
                showIcon
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
