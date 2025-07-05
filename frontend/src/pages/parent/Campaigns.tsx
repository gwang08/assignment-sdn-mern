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
  Form,
  Input,
  Statistic,
  Space,
  Tabs,
  List,
  Radio,
  Descriptions,
  
} from 'antd';
import {
  CalendarOutlined,
  HeartOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { Campaign, Student, CampaignConsent, CampaignResult } from '../../types';
import apiService from '../../services/api';

const { Title, Text } = Typography;



const ParentCampaigns: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [consents, setConsents] = useState<CampaignConsent[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isConsentModalVisible, setIsConsentModalVisible] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<CampaignConsent | null>(null);
  const [consentForm] = Form.useForm();
  const [refreshKey, setRefreshKey] = useState(0);
  // Add vaccination results state to track vaccinated students
  const [vaccinationResults, setVaccinationResults] = useState<any[]>([]);
  // Add examination results state to track examined students
  const [examinationResults, setExaminationResults] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [campaignsResponse, studentsResponse, consentsResponse] = await Promise.all([
        apiService.getParentCampaigns(),
        apiService.getParentStudents(),
        apiService.getParentCampaignConsents()
      ]);

      if (campaignsResponse.success && campaignsResponse.data) {
        setCampaigns(campaignsResponse.data);
      }

      if (studentsResponse.success && studentsResponse.data) {
        // API trả về mảng các object với format: { student: {...}, relationship: "...", is_emergency_contact: ... }
        const studentData = studentsResponse.data.map((item: any) => item.student);
        setStudents(studentData);

        // Load vaccination results for each student
        const allResults = [];
        const allExaminationResults = [];
        for (const student of studentData) {
          try {
            const resultsResponse = await apiService.getStudentCampaignResults(student._id);
            if (resultsResponse.success && resultsResponse.data) {
              const studentResults = resultsResponse.data.map((result: any) => ({
                ...result,
                studentId: student._id
              }));
              allResults.push(...studentResults);
              
              // Filter examination results (health check campaigns with checkup details)
              const examResults = studentResults.filter((result: any) => 
                result.checkupDetails && 
                (result.checkupDetails.status || result.checkupDetails.findings)
              );
              allExaminationResults.push(...examResults);
            }
          } catch (error) {
            console.warn(`No campaign results found for student ${student._id}`);
          }
        }
        setVaccinationResults(allResults);
        setExaminationResults(allExaminationResults);
      }

      if (consentsResponse.success && consentsResponse.data) {
        console.log('Loaded consents:', consentsResponse.data);
        setConsents(consentsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleConsentSubmit = async (values: any) => {
    try {
      if (!selectedConsent) return;

      const consentData = {
        status: values.consent_status,
        notes: values.notes || ''
      };

      console.log('Submitting consent with data:', consentData);

      const response = await apiService.updateCampaignConsent(
        typeof selectedConsent.student === 'string' ? selectedConsent.student : (selectedConsent.student as any)?._id,
        typeof selectedConsent.campaign === 'string' ? selectedConsent.campaign : (selectedConsent.campaign as any)?._id,
        consentData
      );

      if (response.success) {
        message.success('Cập nhật đồng ý thành công');
        
        // Immediately update the consents state with the new data
        if (response.data) {
          setConsents(prevConsents => {
            const updatedConsents = [...prevConsents];
            const existingIndex = updatedConsents.findIndex(c => {
              const consentCampaignId = typeof c.campaign === 'string' ? c.campaign : (c.campaign as any)?._id;
              const consentStudentId = typeof c.student === 'string' ? c.student : (c.student as any)?._id;
              const targetCampaignId = typeof selectedConsent.campaign === 'string' ? selectedConsent.campaign : (selectedConsent.campaign as any)?._id;
              const targetStudentId = typeof selectedConsent.student === 'string' ? selectedConsent.student : (selectedConsent.student as any)?._id;
              return consentCampaignId === targetCampaignId && consentStudentId === targetStudentId;
            });
            
            if (existingIndex >= 0) {
              updatedConsents[existingIndex] = response.data!;
            } else {
              updatedConsents.push(response.data!);
            }
            
            console.log('Updated consents state:', updatedConsents);
            return updatedConsents;
          });
        }
        
        setIsConsentModalVisible(false);
        consentForm.resetFields();
        setSelectedConsent(null);
        
        // Force a refresh by updating the key
        setRefreshKey(prev => prev + 1);
        
        // Small delay to ensure backend update is complete, then reload
        setTimeout(async () => {
          await loadData();
        }, 500);
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi cập nhật đồng ý');
      }
    } catch (error) {
      console.error('Error updating consent:', error);
      message.error('Có lỗi xảy ra khi cập nhật đồng ý');
    }
  };



   

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'green',
      upcoming: 'blue',
      draft: 'blue',
      completed: 'gray',
      cancelled: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusText = {
      active: 'Đang diễn ra',
      upcoming: 'Sắp diễn ra',
      draft: 'Sắp diễn ra',
      completed: 'Đã hoàn thành',
      cancelled: 'Đã hủy'
    };
    return statusText[status as keyof typeof statusText] || status;
  };

  const getCampaignTypeIcon = (type: string) => {
    const icons = {
      vaccination: <MedicineBoxOutlined />,
      health_check: <HeartOutlined />,
      screening: <FileTextOutlined />,
      other: <CalendarOutlined />
    };
    return icons[type as keyof typeof icons] || <CalendarOutlined />;
  };

  const getCampaignTypeText = (type: string) => {
    const typeText = {
      vaccination: 'Tiêm chủng',
      health_check: 'Kiểm tra sức khỏe',
      screening: 'Tầm soát',
      other: 'Khác'
    };
    return typeText[type as keyof typeof typeText] || type;
  };



  const handleViewCampaignDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDetailModalVisible(true);
  };

  const handleConsentAction = (campaignId: string, studentId: string) => {
    const campaign = campaigns.find(c => c._id === campaignId);
    
    if (campaign) {
      // Only allow consent updates for campaigns with draft status
      if (campaign.status !== 'draft') {
        message.warning('Chỉ có thể cập nhật đồng ý cho các chiến dịch ở trạng thái bản nháp');
        return;
      }

      // Check if there's already a consent record for this campaign and student
      const existingConsent = consents.find(c => {
        const consentCampaignId = typeof c.campaign === 'string' ? c.campaign : (c.campaign as any)?._id;
        const consentStudentId = typeof c.student === 'string' ? c.student : (c.student as any)?._id;
        return consentCampaignId === campaignId && consentStudentId === studentId;
      });

      if (existingConsent) {
        // Edit existing consent
        setSelectedConsent(existingConsent);
        setIsConsentModalVisible(true);
        consentForm.setFieldsValue({
          consent_status: existingConsent.status,
          notes: existingConsent.notes || ''
        });
      } else {
        // Create a new consent object for this action
        const consent = {
          _id: `${campaignId}-${studentId}`,
          campaign: campaignId,
          student: studentId,
          answered_by: undefined,
          status: 'Pending' as const,
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setSelectedConsent(consent);
        setIsConsentModalVisible(true);
        consentForm.setFieldsValue({
          consent_status: 'Approved',
          notes: ''
        });
      }
    }
  };

  const getConsentStatus = (campaignId: string, studentId: string) => {
    const consent = consents.find(c => {
      // Handle both populated and non-populated data
      const consentCampaignId = typeof c.campaign === 'string' ? c.campaign : (c.campaign as any)?._id;
      const consentStudentId = typeof c.student === 'string' ? c.student : (c.student as any)?._id;
      
      return consentCampaignId === campaignId && consentStudentId === studentId;
    });
    return consent;
  };

  const getMyStudentCampaigns = () => {
    // For now, show all campaigns as backend provides campaigns relevant to this parent
    // In a real system, this filtering would be done on the backend
    return campaigns;
  };

  const getPendingConsents = () => {
    // Return campaigns that require consent, are in draft status, and have at least one student without consent and not vaccinated
    return campaigns.filter(campaign => {
      if (!campaign.requires_consent || campaign.status !== 'draft') {
        return false;
      }
      
      // Check if any student still needs consent for this campaign and is not vaccinated or examined
      return students.some(student => {
        const consent = getConsentStatus(campaign._id, student._id);
        const isVaccinated = campaign.campaign_type === 'vaccination' && isStudentVaccinated(campaign._id, student._id);
        const isExamined = campaign.campaign_type === 'health_check' && isStudentExamined(campaign._id, student._id);
        return (!consent || consent.status === 'Pending') && !isVaccinated && !isExamined;
      });
    });
  };

  const columns = [
    {
      title: 'Chiến dịch',
      key: 'campaign',
      width: 280,
      render: (_: any, record: Campaign) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar 
            size="small"
            icon={getCampaignTypeIcon(record.campaign_type)} 
            style={{ 
              backgroundColor: record.campaign_type === 'vaccination' ? '#1890ff' : 
                             record.campaign_type === 'health_check' ? '#52c41a' : '#fa8c16' 
            }} 
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', marginBottom: '2px' }}>
              {record.title}
            </div>
            <Tag color="blue" style={{ fontSize: '11px', padding: '0 4px', height: '18px', lineHeight: '18px' }}>
              {getCampaignTypeText(record.campaign_type)}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Lớp',
      dataIndex: 'target_classes',
      key: 'target_classes',
      width: 100,
      render: (classes: string[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
          {(classes || ['Tất cả']).map(cls => (
            <Tag 
              key={cls} 
              color="geekblue" 
              style={{ fontSize: '11px', padding: '0 4px', height: '18px', lineHeight: '18px', margin: '1px' }}
            >
              {cls}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: 'Thời gian',
      key: 'duration',
      width: 130,
      render: (_: any, record: Campaign) => (
        <div style={{ fontSize: '13px' }}>
          <div style={{ fontWeight: 500 }}>{moment(record.start_date).format('DD/MM/YYYY')}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            đến {moment(record.end_date).format('DD/MM/YYYY')}
          </Text>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ margin: 0 }}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Đồng ý',
      key: 'consent',
      width: 130,
      render: (_: any, record: Campaign) => (
        <div>
          {record.requires_consent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {students.map(student => {
                const consent = getConsentStatus(record._id, student._id);
                const isVaccinated = record.campaign_type === 'vaccination' && isStudentVaccinated(record._id, student._id);
                const isExamined = record.campaign_type === 'health_check' && isStudentExamined(record._id, student._id);
                
                return (
                  <div key={student._id}>
                    {isVaccinated ? (
                      <Tag 
                        color="blue"
                        style={{ 
                          fontSize: '10px', 
                          padding: '0 4px', 
                          height: '16px', 
                          lineHeight: '16px',
                          margin: '1px 0' 
                        }}
                      >
                        {student.first_name}: Đã tiêm
                      </Tag>
                    ) : isExamined ? (
                      <Tag 
                        color="cyan"
                        style={{ 
                          fontSize: '10px', 
                          padding: '0 4px', 
                          height: '16px', 
                          lineHeight: '16px',
                          margin: '1px 0' 
                        }}
                      >
                        {student.first_name}: Đã khám
                      </Tag>
                    ) : (
                      <Tag 
                        color={consent ? 
                          (consent.status === 'Approved' ? 'green' : 
                           consent.status === 'Declined' ? 'red' : 'orange') : 'orange'}
                        style={{ 
                          fontSize: '10px', 
                          padding: '0 4px', 
                          height: '16px', 
                          lineHeight: '16px',
                          margin: '1px 0' 
                        }}
                      >
                        {student.first_name}: {consent ? 
                          (consent.status === 'Approved' ? 'Đồng ý' : 
                           consent.status === 'Declined' ? 'Từ chối' : 'Chờ') : 'Chưa'}
                      </Tag>
                    )}
                  </div>
                );
              })}
              {record.consent_deadline && (
                <div style={{ fontSize: '10px', color: '#666', lineHeight: '12px', marginTop: '4px' }}>
                  Hạn: {moment(record.consent_deadline).format('DD/MM')}
                </div>
              )}
            </div>
          ) : (
            <Tag 
              color="green" 
              style={{ 
                fontSize: '11px', 
                padding: '0 4px', 
                height: '18px', 
                lineHeight: '18px',
                margin: 0 
              }}
            >
              Không cần
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_: any, record: Campaign) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewCampaignDetail(record)}
          >
            Chi tiết
          </Button>
          {record.requires_consent && record.status === 'draft' && students.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {students.map(student => {
                const consent = getConsentStatus(record._id, student._id);
                const isVaccinated = record.campaign_type === 'vaccination' && isStudentVaccinated(record._id, student._id);
                const isExamined = record.campaign_type === 'health_check' && isStudentExamined(record._id, student._id);
                const isDisabled = isVaccinated || isExamined;
                
                return (
                  <Button
                    key={student._id}
                    type={!consent || consent.status === 'Pending' ? "default" : "default"}
                    size="small"
                    onClick={() => handleConsentAction(record._id, student._id)}
                    style={{ fontSize: '12px' }}
                    disabled={isDisabled}
                    title={
                      isVaccinated ? `${student.first_name} đã được tiêm chủng, không thể thay đổi đồng ý` :
                      isExamined ? `${student.first_name} đã được khám sức khỏe, không thể thay đổi đồng ý` :
                      undefined
                    }
                  >
                    {isVaccinated ? `Đã tiêm - ${student.first_name}` :
                     isExamined ? `Đã khám - ${student.first_name}` :
                     !consent ? `Đồng ý - ${student.first_name}` : 
                     consent.status === 'Pending' ? `Sửa phản hồi - ${student.first_name}` :
                     `Cập nhật - ${student.first_name}`}
                  </Button>
                );
              })}
            </div>
          )}
        </Space>
      )
    }
  ];

  const renderCampaignDetail = () => {
    if (!selectedCampaign) return null;

    const tabItems = [
      {
        key: '1',
        label: 'Thông tin chung',
        children: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Descriptions bordered>
              <Descriptions.Item label="Tên chiến dịch" span={3}>
                {selectedCampaign.title}
              </Descriptions.Item>
              <Descriptions.Item label="Loại chiến dịch">
                <Tag color="blue">{getCampaignTypeText(selectedCampaign.campaign_type)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedCampaign.status)}>
                  {getStatusText(selectedCampaign.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cần đồng ý">
                {selectedCampaign.requires_consent ? (
                  <Tag color="orange">Có</Tag>
                ) : (
                  <Tag color="green">Không</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian bắt đầu">
                {moment(selectedCampaign.start_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian kết thúc">
                {moment(selectedCampaign.end_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              {selectedCampaign.consent_deadline && (
                <Descriptions.Item label="Hạn đồng ý">
                  {moment(selectedCampaign.consent_deadline).format('DD/MM/YYYY')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Lớp tham gia" span={2}>
                {(selectedCampaign.target_classes || ['Tất cả']).map(cls => (
                  <Tag key={cls} color="geekblue">{cls}</Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={3}>
                <div style={{ padding: '8px', backgroundColor: '#f6f6f6', borderRadius: '4px' }}>
                  {selectedCampaign.description}
                </div>
              </Descriptions.Item>
              {selectedCampaign.instructions && (
                <Descriptions.Item label="Hướng dẫn" span={3}>
                  <div style={{ padding: '8px', backgroundColor: '#fff7e6', borderRadius: '4px' }}>
                    {selectedCampaign.instructions}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )
      },
      {
        key: '2',
        label: 'Con em tham gia',
        children: (
          <div>
            <List
              dataSource={students} // Show all students as campaigns are already filtered by backend
              renderItem={(student) => {
                const isVaccinated = selectedCampaign.campaign_type === 'vaccination' && isStudentVaccinated(selectedCampaign._id, student._id);
                const isExamined = selectedCampaign.campaign_type === 'health_check' && isStudentExamined(selectedCampaign._id, student._id);
                
                return (
                  <List.Item
                    actions={
                      selectedCampaign.requires_consent && selectedCampaign.status === 'draft' ? [
                        isVaccinated ? (
                          <Tag color="blue" style={{ fontSize: '12px' }}>
                            Đã tiêm chủng
                          </Tag>
                        ) : isExamined ? (
                          <Tag color="cyan" style={{ fontSize: '12px' }}>
                            Đã khám sức khỏe
                          </Tag>
                        ) : (
                          <Button 
                            type="primary" 
                            size="small"
                            onClick={() => handleConsentAction(selectedCampaign._id, student._id)}
                          >
                            Đồng ý tham gia
                          </Button>
                        )
                      ] : []
                    }
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={`${student.first_name} ${student.last_name}`}
                      description={
                        <div>
                          <div>Lớp: {student.class_name}</div>
                          {isVaccinated && (
                            <Tag color="blue" style={{ marginTop: '4px', fontSize: '11px' }}>
                              Đã tiêm chủng
                            </Tag>
                          )}
                          {isExamined && (
                            <Tag color="cyan" style={{ marginTop: '4px', fontSize: '11px' }}>
                              Đã khám sức khỏe
                            </Tag>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
            {students.length === 0 && (
              <Text type="secondary">Không có con em nào trong hệ thống</Text>
            )}
          </div>
        )
      }
    ];

    return (
      <Modal
        title={selectedCampaign.title}
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedCampaign(null);
        }}
        width={800}
        footer={null}
      >
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Modal>
    );
  };

  // Helper function to check if a student is vaccinated for a specific campaign
  const isStudentVaccinated = (campaignId: string, studentId: string) => {
    return vaccinationResults.some(result => {
      const resultCampaignId = typeof result.campaign === 'string' ? result.campaign : result.campaign?._id;
      const resultStudentId = typeof result.student === 'string' ? result.student : result.student?._id;
      return resultCampaignId === campaignId && 
             resultStudentId === studentId && 
             result.vaccination_details && 
             result.vaccination_details.vaccinated_at;
    });
  };

  // Helper function to check if a student has been examined for a specific health check campaign
  const isStudentExamined = (campaignId: string, studentId: string) => {
    return examinationResults.some(result => {
      const resultCampaignId = typeof result.campaign === 'string' ? result.campaign : result.campaign?._id;
      const resultStudentId = typeof result.student === 'string' ? result.student : result.student?._id;
      return resultCampaignId === campaignId && 
             resultStudentId === studentId &&
             result.checkupDetails &&
             (result.checkupDetails.status || result.checkupDetails.findings);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Chiến dịch y tế</Title>
          <Text type="secondary">Theo dõi các chiến dịch y tế của trường</Text>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng chiến dịch"
              value={getMyStudentCampaigns().length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đang diễn ra"
              value={getMyStudentCampaigns().filter(c => c.status === 'active').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Cần đồng ý"
              value={getPendingConsents().length}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={getMyStudentCampaigns().filter(c => c.status === 'completed').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Danh sách chiến dịch">
            <Table
              key={`campaigns-table-${refreshKey}`}
              columns={columns}
              dataSource={getMyStudentCampaigns()}
              rowKey="_id"
              loading={loading}
              scroll={{ x: 1000 }}
              size="middle"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chiến dịch`
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Cần xử lý">
            <List
              key={`pending-list-${refreshKey}`}
              dataSource={campaigns.filter(campaign => {
                if (!campaign.requires_consent || campaign.status !== 'draft') {
                  return false;
                }
                
                // Check if any student still needs consent for this campaign and is not vaccinated or examined
                return students.some(student => {
                  const consent = getConsentStatus(campaign._id, student._id);
                  const isVaccinated = campaign.campaign_type === 'vaccination' && isStudentVaccinated(campaign._id, student._id);
                  const isExamined = campaign.campaign_type === 'health_check' && isStudentExamined(campaign._id, student._id);
                  return (!consent || consent.status === 'Pending') && !isVaccinated && !isExamined;
                });
              }).slice(0, 5)}
              renderItem={(campaign) => {
                const pendingStudents = students.filter(student => {
                  const consent = getConsentStatus(campaign._id, student._id);
                  const isVaccinated = campaign.campaign_type === 'vaccination' && isStudentVaccinated(campaign._id, student._id);
                  const isExamined = campaign.campaign_type === 'health_check' && isStudentExamined(campaign._id, student._id);
                  return (!consent || consent.status === 'Pending') && !isVaccinated && !isExamined;
                });
                
                return (
                  <List.Item
                    actions={[
                      pendingStudents.length > 0 && (
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={() => handleConsentAction(campaign._id, pendingStudents[0]._id)}
                        >
                          Phản hồi
                        </Button>
                      )
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={getCampaignTypeIcon(campaign.campaign_type)}
                          style={{ backgroundColor: '#fa8c16' }}
                        />
                      }
                      title={campaign.title}
                      description={
                        <div>
                          <div>Cần đồng ý cho con em tham gia</div>
                          <Tag color="orange">
                            {pendingStudents.length > 1 
                              ? `${pendingStudents.length} học sinh chờ đồng ý`
                              : 'Chờ đồng ý'
                            }
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
            {campaigns.filter(campaign => {
              if (!campaign.requires_consent || campaign.status !== 'draft') {
                return false;
              }
              
              // Check if any student still needs consent for this campaign and is not vaccinated or examined
              return students.some(student => {
                const consent = getConsentStatus(campaign._id, student._id);
                const isVaccinated = campaign.campaign_type === 'vaccination' && isStudentVaccinated(campaign._id, student._id);
                const isExamined = campaign.campaign_type === 'health_check' && isStudentExamined(campaign._id, student._id);
                return (!consent || consent.status === 'Pending') && !isVaccinated && !isExamined;
              });
            }).length === 0 && (
              <Text type="secondary">Không có chiến dịch nào cần phản hồi</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Campaign Detail Modal */}
      {renderCampaignDetail()}

      {/* Consent Modal */}
      <Modal
        title="Phản hồi tham gia chiến dịch"
        open={isConsentModalVisible}
        onCancel={() => {
          setIsConsentModalVisible(false);
          setSelectedConsent(null);
          consentForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        {selectedConsent && (
          <Form
            form={consentForm}
            onFinish={handleConsentSubmit}
            layout="vertical"
            style={{ marginTop: '16px' }}
          >
            <Form.Item
              name="consent_status"
              label="Quyết định"
              rules={[{ required: true, message: 'Vui lòng chọn quyết định' }]}
            >
              <Radio.Group>
                <Radio value="Approved">Đồng ý tham gia</Radio>
                <Radio value="Declined">Không đồng ý</Radio>
              </Radio.Group>
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={() => setIsConsentModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Gửi phản hồi
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ParentCampaigns;
