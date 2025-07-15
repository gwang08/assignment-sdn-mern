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
  Select,
  Statistic,
  Tabs,
  List,
  Radio,
  Descriptions,
} from 'antd';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  CalendarOutlined,
  HeartOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { Campaign, Student, CampaignConsent, ConsultationSchedule } from '../../types';
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campaignTypeFilter, setCampaignTypeFilter] = useState<string>('all');
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [selectedStudentResults, setSelectedStudentResults] = useState<any[]>([]);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [selectedStudentConsultations, setSelectedStudentConsultations] = useState<any[]>([]);
  // Add vaccination results state to track vaccinated students
  const [vaccinationResults, setVaccinationResults] = useState<any[]>([]);
  // Add examination results state to track examined students
  const [examinationResults, setExaminationResults] = useState<any[]>([]);
  // Add consultation schedules state
  const [consultationSchedules, setConsultationSchedules] = useState<ConsultationSchedule[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [campaignsResponse, studentsResponse] = await Promise.all([
        apiService.getParentCampaigns(),
        apiService.getParentStudents()
      ]);

      if (campaignsResponse.success && campaignsResponse.data) {
        setCampaigns(campaignsResponse.data);
        
        // Extract consent data from campaigns
        const allConsents: CampaignConsent[] = [];
        campaignsResponse.data.forEach((campaign: any) => {
          if (campaign.students) {
            campaign.students.forEach((studentConsent: any) => {
              allConsents.push({
                _id: `${campaign._id}-${studentConsent.student._id}`,
                campaign: campaign._id,
                student: studentConsent.student._id,
                status: studentConsent.status,
                answered_by: undefined,
                notes: '',
                createdAt: studentConsent.date || new Date().toISOString(),
                updatedAt: studentConsent.date || new Date().toISOString()
              });
            });
          }
        });
        setConsents(allConsents);
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

      // Load consultation schedules
      try {
        const consultationResponse = await apiService.getParentConsultationSchedules();
        if (consultationResponse.success && consultationResponse.data) {
          setConsultationSchedules(consultationResponse.data);
        }
      } catch (error) {
        console.warn('No consultation schedules found');
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
        toast.success('Cập nhật phản hồi thành công!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
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
        toast.error(response.message || 'Có lỗi xảy ra khi cập nhật đồng ý', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error updating consent:', error);
      toast.error('Có lỗi xảy ra khi cập nhật đồng ý. Vui lòng thử lại!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };



   

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'green',
      upcoming: 'blue',
      draft: 'blue',
      completed: 'blue',
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
      if (!['draft', 'active'].includes(campaign.status)) {
        toast.warning('Chỉ có thể cập nhật đồng ý cho các chiến dịch đang diễn ra hoặc bản nháp', {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
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
    // Filter out draft campaigns as they shouldn't be visible to parents
    let filteredCampaigns = campaigns.filter(campaign => campaign.status !== 'draft');
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === statusFilter);
    }
    
    // Apply campaign type filter
    if (campaignTypeFilter !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.campaign_type === campaignTypeFilter);
    }
    
    // Sort by status priority (active first, completed second, cancelled last) then by start date ascending
    filteredCampaigns.sort((a, b) => {
      // Define status priority order
      const statusPriority = {
        'active': 1,
        'completed': 2,
        'cancelled': 3,
        'upcoming': 4 // fallback for any other status
      };
      
      const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 4;
      const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 4;
      
      // First sort by status priority
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // If same status, sort by start date ascending (earliest first)
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    });
    
    return filteredCampaigns;
  };



  const columns = [
    {
      title: 'Chiến dịch',
      key: 'campaign',
      width: 350,
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
      width: 120,
      render: (classes: string[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
          {(classes || ['Toàn trường']).map(cls => (
            <Tag 
              key={cls} 
              color="geekblue" 
              style={{ fontSize: '11px', padding: '0 4px', height: '18px', lineHeight: '18px', margin: '1px' }}
            >
              {cls === 'all_grades' ? 'Toàn trường' : cls.includes('grade_') ? cls.replace('grade_', 'Lớp ') : cls}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: 'Thời gian',
      key: 'duration',
      width: 150,
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
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_: any, record: Campaign) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewCampaignDetail(record)}
        >
          Chi tiết
        </Button>
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
                {(selectedCampaign.target_classes || ['Toàn trường']).map(cls => (
                  <Tag key={cls} color="geekblue">
                    {cls === 'all_grades' ? 'Toàn trường' : cls.includes('grade_') ? cls.replace('grade_', 'Lớp ') : cls}
                  </Tag>
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
                const consent = getConsentStatus(selectedCampaign._id, student._id);
                const isVaccinated = selectedCampaign.campaign_type === 'vaccination' && isStudentVaccinated(selectedCampaign._id, student._id);
                const isExamined = selectedCampaign.campaign_type === 'health_check' && isStudentExamined(selectedCampaign._id, student._id);
                
                return (
                  <List.Item
                    actions={[
                      // Show results button for completed campaigns or when student has results
                      (selectedCampaign.status === 'completed' || isVaccinated || isExamined) && (
                        <Button
                          key="results"
                          type="default"
                          size="small"
                          icon={<HistoryOutlined />}
                          onClick={() => handleShowResults(student, selectedCampaign._id)}
                        >
                          Kết quả
                        </Button>
                      ),
                      // Consent actions for active campaigns
                      ...(selectedCampaign.requires_consent && ['draft', 'active'].includes(selectedCampaign.status) ? [
                        isVaccinated ? (
                          <Tag key="vaccinated" color="blue" style={{ fontSize: '12px' }}>
                            Đã tiêm chủng
                          </Tag>
                        ) : isExamined ? (
                          <Tag key="examined" color="cyan" style={{ fontSize: '12px' }}>
                            Đã khám sức khỏe
                          </Tag>
                        ) : (
                          <div key="consent" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                            <div>
                              {consent ? (
                                <Tag
                                  color={consent.status === 'Approved' ? 'green' :
                                    consent.status === 'Declined' ? 'red' : 'orange'}
                                  style={{ fontSize: '12px' }}
                                >
                                  {consent.status === 'Approved' ? 'Đã đồng ý' :
                                    consent.status === 'Declined' ? 'Đã từ chối' : 'Chờ phản hồi'}
                                </Tag>
                              ) : (
                                <Tag color="orange" style={{ fontSize: '12px' }}>
                                  Chưa phản hồi
                                </Tag>
                              )}
                            </div>
                            {consent?.status === 'Pending' && (
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handleConsentAction(selectedCampaign._id, student._id)}
                              >
                                {consent ? 'Cập nhật phản hồi' : 'Đồng ý tham gia'}
                              </Button>
                        )}
                          </div>
                        )
                      ] : [])
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={`${student.first_name} ${student.last_name}`}
                      description={
                        <div>
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Lớp:</strong> {student.class_name}
                          </div>
                          
                          {selectedCampaign.requires_consent && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong>Trạng thái đồng ý:</strong>{' '}
                              {isVaccinated ? (
                                <Tag color="blue" style={{ fontSize: '11px' }}>
                                  Đã tiêm chủng
                                </Tag>
                              ) : isExamined ? (
                                <Tag color="cyan" style={{ fontSize: '11px' }}>
                                  Đã khám sức khỏe  
                                </Tag>
                              ) : consent ? (
                                <Tag 
                                  color={consent.status === 'Approved' ? 'green' : 
                                         consent.status === 'Declined' ? 'red' : 'orange'}
                                  style={{ fontSize: '11px' }}
                                >
                                  {consent.status === 'Approved' ? 'Đã đồng ý' : 
                                   consent.status === 'Declined' ? 'Đã từ chối' : 'Chờ phản hồi'}
                                </Tag>
                              ) : (
                                <Tag color="orange" style={{ fontSize: '11px' }}>
                                  Chưa phản hồi
                                </Tag>
                              )}
                            </div>
                          )}
                          
                          {selectedCampaign.consent_deadline && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              <strong>Hạn phản hồi:</strong> {moment(selectedCampaign.consent_deadline).format('DD/MM/YYYY')}
                            </div>
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

  // Function to handle showing campaign results for a student
  const handleShowResults = (student: any, campaignId: string) => {
    const campaign = campaigns.find(c => c._id === campaignId);
    if (!campaign) return;
    
    // Filter results based on campaign type
    let studentResults: any[] = [];
    if (campaign.campaign_type === 'vaccination') {
      studentResults = vaccinationResults.filter(result => {
        const resultCampaignId = typeof result.campaign === 'string' ? result.campaign : result.campaign?._id;
        const resultStudentId = typeof result.student === 'string' ? result.student : result.student?._id;
        return resultCampaignId === campaignId && resultStudentId === student._id && result.vaccination_details;
      });
    } else if (campaign.campaign_type === 'health_check') {
      studentResults = examinationResults.filter(result => {
        const resultCampaignId = typeof result.campaign === 'string' ? result.campaign : result.campaign?._id;
        const resultStudentId = typeof result.student === 'string' ? result.student : result.student?._id;
        return resultCampaignId === campaignId && resultStudentId === student._id && result.checkupDetails;
      });
    }
    
    // Add consultation data to results - filter by student and related campaign results
    const studentConsultations = consultationSchedules.filter(consultation => {
      const consultationStudentId = typeof consultation.student === 'string' ? 
        consultation.student : consultation.student?._id;
      
      // Check if this consultation is for the current student
      if (consultationStudentId !== student._id) {
        return false;
      }
      
      // Check if the consultation's campaignResult belongs to the current campaign
      const campaignResultId = typeof consultation.campaignResult === 'string' ? 
        consultation.campaignResult : consultation.campaignResult?._id;
      
      // Find if any of the student's campaign results for this campaign match the consultation's campaignResult
      const relatedResult = studentResults.find(result => result._id === campaignResultId);
      return !!relatedResult;
    });
    
    setSelectedStudentResults(studentResults);
    setSelectedStudentConsultations(studentConsultations);
    setSelectedStudentName(`${student.first_name} ${student.last_name}`);
    setIsResultModalVisible(true);
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
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="Tổng chiến dịch"
              value={getMyStudentCampaigns().length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="Tổng chiến dịch"
              value={getMyStudentCampaigns().length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="Đang diễn ra"
              value={getMyStudentCampaigns().filter(c => c.status === 'active').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
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

      {/* Main Content - Full Width Table */}
      <Card 
        title="Danh sách chiến dịch"
        extra={
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Lọc theo trạng thái:</span>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                size="small"
              >
                <Select.Option value="all">Tất cả</Select.Option>
                <Select.Option value="active">Đang diễn ra</Select.Option>
                <Select.Option value="completed">Đã hoàn thành</Select.Option>
                <Select.Option value="cancelled">Đã hủy</Select.Option>
              </Select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Loại chiến dịch:</span>
              <Select
                value={campaignTypeFilter}
                onChange={setCampaignTypeFilter}
                style={{ width: 150 }}
                size="small"
              >
                <Select.Option value="all">Tất cả</Select.Option>
                <Select.Option value="vaccination">Tiêm chủng</Select.Option>
                <Select.Option value="health_check">Kiểm tra sức khỏe</Select.Option>
              </Select>
            </div>
          </div>
        }
      >
        <style>
          {`
            .ant-table-tbody > tr:hover > td,
            .ant-table-tbody > tr:hover {
              background-color: #ffffff !important;
            }
            .ant-table-tbody > tr > td {
              background-color: #ffffff !important;
            }
          `}
        </style>
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

      {/* Campaign Results Modal */}
      <Modal
        title={`Kết quả chiến dịch - ${selectedStudentName}`}
        open={isResultModalVisible}
        onCancel={() => {
          setIsResultModalVisible(false);
          setSelectedStudentResults([]);
          setSelectedStudentConsultations([]);
          setSelectedStudentName('');
        }}
        footer={null}
        width={800}
        zIndex={1100}
      >
        {selectedStudentResults.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedStudentResults.map((result, index) => {
              const campaign = campaigns.find(c => {
                const campaignId = typeof result.campaign === 'string' ? result.campaign : result.campaign?._id;
                return c._id === campaignId;
              });
              
              return (
                <Card key={index} size="small">
                  <Descriptions bordered size="small">
                    <Descriptions.Item label="Ngày tạo" span={3}>
                      {moment(result.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                    
                    {/* Vaccination Campaign Results */}
                    {campaign?.campaign_type === 'vaccination' && result.vaccination_details && (
                      <>
                        <Descriptions.Item label="Loại chiến dịch" span={3}>
                          <Tag color="blue">Tiêm chủng</Tag>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="Ngày tiêm">
                          {result.vaccination_details.vaccinated_at ? 
                            moment(result.vaccination_details.vaccinated_at).format('DD/MM/YYYY') : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Người tiêm">
                          {result.vaccination_details.administered_by || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          <Tag color={
                            result.vaccination_details.status === 'completed' || 'normal' ? 'green' :
                            result.vaccination_details.status === 'severe_reaction' ? 'red' : 'orange'
                          }>
                            {result.vaccination_details.status === 'completed' ? 'Hoàn thành' :
                             result.vaccination_details.status === 'normal' ? 'Bình thường' :
                             result.vaccination_details.status === 'mild_reaction' ? 'Phản ứng nhẹ' :
                             result.vaccination_details.status === 'moderate_reaction' ? 'Phản ứng vừa' :
                             result.vaccination_details.status === 'severe_reaction' ? 'Phản ứng nặng' :
                             result.vaccination_details.status}
                          </Tag>
                        </Descriptions.Item>
                        
                        {result.vaccination_details.vaccine_details && (
                          <>
                            <Descriptions.Item label="Loại vaccine">
                              {result.vaccination_details.vaccine_details.brand || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số lô">
                              {result.vaccination_details.vaccine_details.batch_number || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Liều số">
                              {result.vaccination_details.vaccine_details.dose_number || 'N/A'}
                            </Descriptions.Item>
                          </>
                        )}
                        
                        {result.vaccination_details.side_effects && result.vaccination_details.side_effects.length > 0 && (
                          <Descriptions.Item label="Tác dụng phụ" span={3}>
                            {result.vaccination_details.side_effects.map((effect: string) => (
                              <Tag key={effect} color="orange" style={{ margin: '2px' }}>
                                {effect === 'pain' ? 'Đau' :
                                 effect === 'swelling' ? 'Sưng' :
                                 effect === 'fever' ? 'Sốt' :
                                 effect === 'headache' ? 'Đau đầu' :
                                 effect === 'fatigue' ? 'Mệt mỏi' :
                                 effect === 'nausea' ? 'Buồn nôn' :
                                 effect === 'dizziness' ? 'Chóng mặt' : effect}
                              </Tag>
                            ))}
                          </Descriptions.Item>
                        )}
                        
                        {result.vaccination_details.follow_up_required && (
                          <Descriptions.Item label="Cần theo dõi" span={3}>
                            <Tag color="orange">Có</Tag>
                            {result.vaccination_details.follow_up_notes && (
                              <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fff7e6', borderRadius: '4px' }}>
                                {result.vaccination_details.follow_up_notes}
                              </div>
                            )}
                          </Descriptions.Item>
                        )}
                      </>
                    )}
                    
                    {/* Health Check Campaign Results */}
                    {campaign?.campaign_type === 'health_check' && result.checkupDetails && (
                      <>
                        <Descriptions.Item label="Loại chiến dịch" span={3}>
                          <Tag color="cyan">Kiểm tra sức khỏe</Tag>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="Trạng thái sức khỏe" span={3}>
                          <Tag color={
                            result.checkupDetails.status === 'HEALTHY' ? 'green' :
                            result.checkupDetails.status === 'NEEDS_ATTENTION' ? 'orange' : 'red'
                          }>
                            {result.checkupDetails.status === 'HEALTHY' ? 'Khỏe mạnh' :
                             result.checkupDetails.status === 'NEEDS_ATTENTION' ? 'Cần chú ý' :
                             result.checkupDetails.status === 'CRITICAL' ? 'Nghiêm trọng' :
                             result.checkupDetails.status}
                          </Tag>
                        </Descriptions.Item>
                        
                        {result.checkupDetails.findings && (
                          <Descriptions.Item label="Kết quả khám" span={3}>
                            <div style={{ padding: '8px', backgroundColor: '#f6f6f6', borderRadius: '4px' }}>
                              {result.checkupDetails.findings}
                            </div>
                          </Descriptions.Item>
                        )}
                        
                        {result.checkupDetails.recommendations && (
                          <Descriptions.Item label="Khuyến nghị" span={3}>
                            <div style={{ padding: '8px', backgroundColor: '#e6f4ff', borderRadius: '4px' }}>
                              {result.checkupDetails.recommendations}
                            </div>
                          </Descriptions.Item>
                        )}
                        
                        {result.checkupDetails.requiresConsultation && (
                          <Descriptions.Item label="Cần tư vấn" span={3}>
                            <Tag color="orange">Có</Tag>
                          </Descriptions.Item>
                        )}
                      </>
                    )}
                    
                    {result.notes && (
                      <Descriptions.Item label="Ghi chú" span={3}>
                        <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                          {result.notes}
                        </div>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              );
            })}

            {/* Related Consultations - Simple Display */}
            {selectedStudentConsultations.length > 0 && (
              <Card title="Lịch tư vấn liên quan" size="small" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedStudentConsultations.map((consultation, index) => {
                    const staff = typeof consultation.medicalStaff === 'object' && consultation.medicalStaff ?
                      consultation.medicalStaff : null;
                    
                    return (
                      <div key={index} style={{ 
                        padding: '12px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '6px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <Tag color={
                            consultation.status === 'Completed' ? 'green' :
                            consultation.status === 'Scheduled' ? 'blue' :
                            consultation.status === 'Cancelled' ? 'red' : 'orange'
                          } style={{ fontSize: '11px' }}>
                            {consultation.status === 'Completed' ? 'Đã hoàn thành' :
                             consultation.status === 'Scheduled' ? 'Đã lên lịch' :
                             consultation.status === 'Cancelled' ? 'Đã hủy' :
                             consultation.status === 'Requested' ? 'Chờ xác nhận' : consultation.status}
                          </Tag>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#666' }}>
                          {consultation.scheduledDate && (
                            <div>
                              <strong>Thời gian:</strong> {moment(consultation.scheduledDate).format('DD/MM/YYYY HH:mm')}
                            </div>
                          )}
                          {staff && (
                            <div>
                              <strong>Bác sĩ/ Y tá:</strong> {staff.first_name} {staff.last_name}
                              {staff.phone_number && (
                                <span style={{ marginLeft: '8px', color: '#1890ff' }}>
                                  📞 {staff.phone_number}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">Chưa có kết quả cho chiến dịch này</Text>
          </div>
        )}
      </Modal>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default ParentCampaigns;
