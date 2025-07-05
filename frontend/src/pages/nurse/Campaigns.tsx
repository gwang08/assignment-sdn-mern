import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Row,
  Col,
  Typography,
  Drawer,
  Descriptions,
  List,
  message,
  Tabs,
  Progress,
  Steps,
  Divider,
  Alert,
  notification
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { nurseService } from '../../services/api';
import { Campaign, CampaignConsent, CampaignResult } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Step } = Steps;

const CampaignsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [consents, setConsents] = useState<CampaignConsent[]>([]);
  const [results, setResults] = useState<CampaignResult[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [form] = Form.useForm();
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Consultation progress state for each campaign
  const [consultationProgress, setConsultationProgress] = useState<{ [key: string]: { completed: number, total: number, percentage: number } }>({});

  // Workflow states
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [isStudentListModalVisible, setIsStudentListModalVisible] = useState(false);
  const [isExamResultModalVisible, setIsExamResultModalVisible] = useState(false);
  const [isConsultationModalVisible, setIsConsultationModalVisible] = useState(false);
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [consultationCandidates, setConsultationCandidates] = useState<any[]>([]);
  const [currentConsultationStudent, setCurrentConsultationStudent] = useState<any>(null);
  const [scheduledStudents, setScheduledStudents] = useState<string[]>([]);
  const [consultationStats, setConsultationStats] = useState<{
    totalAbnormal: number;
    alreadyScheduled: number;
    needsScheduling: number;
  }>({ totalAbnormal: 0, alreadyScheduled: 0, needsScheduling: 0 });
  const [notificationForm] = Form.useForm();
  const [examForm] = Form.useForm();
  const [consultationForm] = Form.useForm();

  useEffect(() => {
    const loadData = async () => {
      await loadCampaigns();
      loadAvailableClasses(true); // Pass true to indicate initial load (silent)
    };
    loadData();
  }, []);

  const loadAvailableClasses = async (silent = false) => {
    try {
      setLoadingClasses(true);
      const response = await nurseService.getStudents();
      if (response.success && response.data) {
        // Extract unique class names from students
        const classNames = Array.from(new Set(response.data.map((student: any) => student.class_name))).filter(Boolean);
        // Sort class names for better user experience
        const sortedClasses = classNames.sort();
        setAvailableClasses(sortedClasses);

        if (!silent) {
          if (sortedClasses.length > 0) {
            message.success(`Đã tải ${sortedClasses.length} lớp học từ hệ thống`);
          } else {
            message.warning('Không tìm thấy lớp học nào trong hệ thống');
          }
        }
      } else {
        // Fallback to some default classes if API fails
        setAvailableClasses(['10A1', '10A2', '11B1', '11B2', '12C1', '12C2']);
        if (!silent) {
          message.warning('Không thể tải danh sách lớp, sử dụng danh sách mặc định');
        }
      }
    } catch (error) {
      // Fallback to some default classes if API fails
      setAvailableClasses(['10A1', '10A2', '11B1', '11B2', '12C1', '12C2']);
      if (!silent) {
        message.error('Có lỗi khi tải danh sách lớp, sử dụng danh sách mặc định');
      }
    } finally {
      setLoadingClasses(false);
    }
  };

  const getTargetClassOptions = () => {
    const options = [
      { label: 'Tất cả các lớp', value: 'all_grades' }
    ];

    if (availableClasses.length > 0) {
      // Extract grade levels from class names (e.g., "10A1" -> "10")
      const grades = Array.from(new Set(availableClasses.map(className => {
        const match = className.match(/^(\d+)/);
        return match ? match[1] : null;
      }).filter(Boolean)));

      // Add grade-level options
      grades.sort().forEach(grade => {
        options.push({ label: `Khối ${grade}`, value: `grade_${grade}` });
      });

      // Add individual class options
      availableClasses.forEach(className => {
        options.push({ label: `Lớp ${className}`, value: className });
      });
    }

    return options;
  };

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await nurseService.getHealthCheckCampaigns();
      if (response.success && response.data) {
        setCampaigns(response.data);

        // Load consultation progress for each campaign
        const progressPromises = response.data.map(async (campaign: Campaign) => {
          const progress = await calculateConsultationProgress(campaign._id);
          return { campaignId: campaign._id, progress };
        });

        const progressResults = await Promise.all(progressPromises);
        const progressMap: { [key: string]: { completed: number, total: number, percentage: number } } = {};

        progressResults.forEach(({ campaignId, progress }) => {
          progressMap[campaignId] = progress;
        });

        setConsultationProgress(progressMap);
      } else {
        message.error('Không thể tải danh sách chiến dịch');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải danh sách chiến dịch');
    } finally {
      setLoading(false);
    }
  };

  const loadCampaignDetails = async (campaignId: string) => {
    try {


      const [consentsResponse, resultsResponse] = await Promise.all([
        nurseService.getCampaignConsents(campaignId),
        nurseService.getCampaignResults(campaignId)
      ]);




      if (consentsResponse.success && consentsResponse.data) {
        setConsents(consentsResponse.data);
      } else {

        setConsents([]); // Set empty array if no data
      }

      if (resultsResponse.success && resultsResponse.data) {
        setResults(resultsResponse.data);

      } else {

        setResults([]); // Set empty array if no data
      }
    } catch (error) {
      setConsents([]);
      setResults([]);
      message.error('Có lỗi xảy ra khi tải chi tiết chiến dịch');
    }
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    form.resetFields();
    // Set default values for new campaign
    form.setFieldsValue({
      campaign_type: 'health_check',
      status: 'draft',
      requires_consent: true,
      target_classes: [],
      date_range: [moment().add(1, 'day'), moment().add(7, 'days')] // Default to tomorrow to next week
    });
    setIsModalVisible(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    form.setFieldsValue({
      ...campaign,
      date_range: campaign.start_date && campaign.end_date ? [moment(campaign.start_date), moment(campaign.end_date)] : null,
      consent_deadline: campaign.consent_deadline ? moment(campaign.consent_deadline) : null,
      target_groups: campaign.target_classes
    });
    setIsModalVisible(true);
  };

  const handleViewCampaign = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    await loadCampaignDetails(campaign._id);
    setIsDetailDrawerVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      // Validate date range
      if (!values.date_range || values.date_range.length !== 2) {
        message.error('Vui lòng chọn khoảng thời gian hợp lệ');
        return;
      }

      // Validate start date is not in the past (for new campaigns)
      if (!editingCampaign && values.date_range[0].isBefore(moment().startOf('day'))) {
        message.error('Ngày bắt đầu không thể là ngày trong quá khứ');
        return;
      }

      // Validate end date is after start date
      if (values.date_range[1].isBefore(values.date_range[0])) {
        message.error('Ngày kết thúc phải sau ngày bắt đầu');
        return;
      }

      const campaignData = {
        ...values,
        start_date: values.date_range[0].toDate(),
        end_date: values.date_range[1].toDate(),
        campaign_type: values.campaign_type || 'health_check', // Default to health_check
        requires_consent: values.requires_consent !== false, // Default to true
        status: values.status || 'draft' // Default to draft
      };

      // Remove the date_range field as it's processed
      delete campaignData.date_range;



      let response;
      if (editingCampaign) {
        response = await nurseService.updateCampaign(editingCampaign._id, campaignData);
      } else {
        response = await nurseService.createCampaign(campaignData);
      }



      if (response.success) {
        notification.success({
          message: 'Thành công',
          description: editingCampaign ? 'Chiến dịch đã được cập nhật thành công!' : 'Chiến dịch mới đã được tạo thành công!',
          duration: 3
        });
        setIsModalVisible(false);
        form.resetFields();
        setEditingCampaign(null);
        await loadCampaigns(); // Reload the campaigns list
      } else {
        notification.error({
          message: 'Lỗi',
          description: response.message || 'Có lỗi xảy ra khi lưu chiến dịch',
          duration: 4
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi hệ thống',
        description: 'Có lỗi xảy ra khi kết nối với máy chủ. Vui lòng thử lại sau.',
        duration: 4
      });
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      active: { color: 'green', text: 'Đang hoạt động' },
      completed: { color: 'blue', text: 'Hoàn thành' },
      cancelled: { color: 'red', text: 'Đã hủy' },
      draft: { color: 'orange', text: 'Bản nháp' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getCampaignTypeTag = (type: string) => {
    const typeConfig = {
      vaccination: { color: 'blue', text: 'Tiêm phòng' },
      health_check: { color: 'cyan', text: 'Khám sức khỏe' },
      screening: { color: 'green', text: 'Sàng lọc sức khỏe' },
      other: { color: 'default', text: 'Khác' }
    };
    const config = typeConfig[type as keyof typeof typeConfig] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<Campaign> = [
    {
      title: 'Tên chiến dịch',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Campaign) => (
        <Button type="link" onClick={() => handleViewCampaign(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'campaign_type',
      key: 'campaign_type',
      render: (type: string) => getCampaignTypeTag(type),
    },
    {
      title: 'Thời gian',
      key: 'date_range',
      render: (_, record: Campaign) => (
        <div>
          <div>{moment(record.start_date).format('DD/MM/YYYY')}</div>
          <div>{moment(record.end_date).format('DD/MM/YYYY')}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Nhóm đối tượng',
      dataIndex: 'target_classes',
      key: 'target_classes',
      render: (groups: string[]) => (
        <div>
          {groups?.map((group: string) => (
            <Tag key={group} color="default">{group}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Tiến độ tư vấn',
      key: 'consultation_progress',
      render: (_, record: Campaign) => {
        const progress = consultationProgress[record._id];
        if (!progress) {
          return <Text type="secondary">Đang tải...</Text>;
        }

        if (progress.total === 0) {
          return <Text type="secondary">Không cần tư vấn</Text>;
        }

        return (
          <div style={{ minWidth: '120px' }}>
            <div style={{ marginBottom: '4px' }}>
              <Text>{progress.completed}/{progress.total}</Text>
            </div>
            <Progress
              percent={progress.percentage}
              size="small"
              showInfo={false}
              strokeColor={progress.percentage === 100 ? '#52c41a' : '#1890ff'}
            />
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record: Campaign) => (
        <Space direction="vertical" size="small">
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewCampaign(record)}
              title="Xem chi tiết"
              size="small"
            />
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditCampaign(record)}
              title="Chỉnh sửa"
              size="small"
            />
          </Space>

          {/* Health Check Workflow Actions */}
          <Space wrap>
            <Button
              icon={<UserOutlined />}
              onClick={() => {

                handlePrepareStudentList(record);
              }}
              title="Danh sách học sinh"
              size="small"
            >
              DS HS
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => {

                handleRecordExamResults(record);
              }}
              title="Ghi kết quả khám"
              size="small"
            >
              Ghi KQ
            </Button>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => {

                handleSendResultsAndSchedule(record);
              }}
              title="Gửi KQ & đặt lịch"
              size="small"
              type="primary"
            >
              Gửi & Hẹn
            </Button>
          </Space>
        </Space>
      ),
    },
  ];

  const calculateProgress = (campaign: Campaign) => {
    if (!consents.length || !eligibleStudents.length) return 0;
    const approvedConsents = consents.filter(c => c.status === 'Approved').length;
    // Calculate based on total eligible students, not just those who responded
    return Math.round((approvedConsents / eligibleStudents.length) * 100);
  };

  // Calculate consultation progress for a specific campaign
  const calculateConsultationProgress = async (campaignId: string) => {
    try {
      const [resultsResponse, consultationResponse] = await Promise.all([
        nurseService.getCampaignResults(campaignId),
        nurseService.getConsultationSchedules()
      ]);




      if (!resultsResponse.success || !resultsResponse.data) {

        return { completed: 0, total: 0, percentage: 0 };
      }

      // Handle different response formats for consultation data
      let consultationData: any[] = [];

      if (Array.isArray(consultationResponse)) {
        // If the response is directly an array
        consultationData = consultationResponse;

      } else if (consultationResponse && consultationResponse.data) {
        // If the response has a data property
        consultationData = consultationResponse.data;

      } else if (consultationResponse && consultationResponse.success && consultationResponse.data) {
        // If the response has success and data properties
        consultationData = consultationResponse.data;

      }

      if (!Array.isArray(consultationData)) {

        consultationData = [];
      }



      // Get abnormal results that require consultation
      const abnormalResults = resultsResponse.data.filter((result: any) =>
        result.checkupDetails && result.checkupDetails.requiresConsultation
      );


      if (abnormalResults.length === 0) {

        return { completed: 0, total: 0, percentage: 100 }; // No consultations needed
      }

      // Get existing consultation schedules
      let scheduledStudentIds = new Set();

      // Create a mapping of campaign result IDs to student IDs for better matching
      const resultIdToStudentId = new Map();
      abnormalResults.forEach((result: any) => {
        const studentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
        resultIdToStudentId.set(result._id, studentId);
      });



      consultationData.forEach((consultation: any) => {
        // Check if this consultation belongs to the current campaign
        let belongsToCurrentCampaign = false;
        let campaignResultId = null;
        let consultationStudentId: string | null = null;

        // Get consultation student ID first
        if (consultation.student) {
          if (typeof consultation.student === 'object' && consultation.student._id) {
            consultationStudentId = consultation.student._id;
          } else if (typeof consultation.student === 'string') {
            consultationStudentId = consultation.student;
          }
        }



        // Method 1: Check via campaignResult object if it exists
        if (consultation.campaignResult && typeof consultation.campaignResult === 'object') {
          campaignResultId = consultation.campaignResult._id;


          // Check if the campaign result belongs to the current campaign via campaign field
          if (consultation.campaignResult.campaign) {
            let consultationCampaignId = null;
            if (typeof consultation.campaignResult.campaign === 'object') {
              consultationCampaignId = consultation.campaignResult.campaign._id;
            } else if (typeof consultation.campaignResult.campaign === 'string') {
              consultationCampaignId = consultation.campaignResult.campaign;
            }

            if (consultationCampaignId === campaignId) {
              belongsToCurrentCampaign = true;
            }
          }

          // Also check if the campaignResult ID matches any of our campaign results
          if (!belongsToCurrentCampaign && campaignResultId && resultIdToStudentId.has(campaignResultId)) {
            belongsToCurrentCampaign = true;
          }
        }

        // Method 2: If campaignResult is a string, check if it matches
        if (!belongsToCurrentCampaign && consultation.campaignResult && typeof consultation.campaignResult === 'string') {
          campaignResultId = consultation.campaignResult;


          if (resultIdToStudentId.has(campaignResultId)) {
            belongsToCurrentCampaign = true;
          }
        }

        // Method 3: Cross-reference student in consultation with students in campaignResult
        if (!belongsToCurrentCampaign && consultationStudentId) {
          // Check if this student has any abnormal result in current campaign
          const matchingResult = abnormalResults.find((result: any) => {
            const resultStudentId = typeof result.student === 'object' ? result.student._id : result.student;
            return resultStudentId === consultationStudentId;
          });

          if (matchingResult) {
            // Additional validation: check if student in campaignResult matches consultation student
            let campaignResultStudentId = null;
            if (consultation.campaignResult && typeof consultation.campaignResult === 'object' && consultation.campaignResult.student) {
              campaignResultStudentId = consultation.campaignResult.student;
            }

            if (campaignResultStudentId === consultationStudentId) {
              belongsToCurrentCampaign = true;
              campaignResultId = matchingResult._id;
            }
          }
        }



        // Process consultation if it belongs to current campaign
        if (belongsToCurrentCampaign && consultationStudentId) {
          scheduledStudentIds.add(consultationStudentId);
        }
      });

      // Count how many abnormal results have scheduled consultations
      const scheduledCount = abnormalResults.filter((result: any) => {
        const studentId = typeof result.student === 'object'
          ? (result.student as any)._id
          : result.student;
        const hasSchedule = scheduledStudentIds.has(studentId);

        return hasSchedule;
      }).length;

      const percentage = Math.round((scheduledCount / abnormalResults.length) * 100);


      return {
        completed: scheduledCount,
        total: abnormalResults.length,
        percentage
      };
    } catch (error) {
      return { completed: 0, total: 0, percentage: 0 };
    }
  };

  // Workflow Step 1: Send Notification
  // Note: This function is currently not used in the UI but kept for future use
  const handleSendNotification = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    notificationForm.setFieldsValue({
      title: `Thông báo khám sức khỏe: ${campaign.title}`,
      content: `Kính gửi Quý phụ huynh,

Nhà trường thông báo về chương trình khám sức khỏe định kỳ:

📋 Chiến dịch: ${campaign.title}
📅 Thời gian: ${moment(campaign.start_date).format('DD/MM/YYYY')} - ${moment(campaign.end_date).format('DD/MM/YYYY')}
🎯 Đối tượng: ${campaign.target_classes?.join(', ')}

📝 Mô tả: ${campaign.description}

⚠️ Hướng dẫn: ${campaign.instructions}

Vui lòng xác nhận cho con em tham gia khám sức khỏe bằng cách trả lời tin nhắn này.

Trân trọng,
Y tế trường học`
    });
    setIsNotificationModalVisible(true);
  };

  // Workflow Step 2: Prepare Student List
  const handlePrepareStudentList = async (campaign: Campaign) => {
    setIsStudentListModalVisible(true);

    try {
      setSelectedCampaign(campaign);
      setLoading(true);



      // Fetch eligible students and consent data in parallel
      const [studentsResponse, consentsResponse] = await Promise.all([
        nurseService.getStudents(),
        nurseService.getCampaignConsents(campaign._id)
      ]);




      if (studentsResponse.success && studentsResponse.data) {
        // Filter students by target classes
        const allStudents = studentsResponse.data.filter((student: any) => {
          // If "all_grades" is selected, include all students
          if (campaign.target_classes?.includes('all_grades')) {
            return true;
          }

          // Check if student's exact class is in target classes
          if (campaign.target_classes?.includes(student.class_name)) {
            return true;
          }

          // Check if student's grade level is in target classes
          const studentGrade = student.class_name?.substring(0, 2); // Extract grade like "10", "11", "12"
          const gradeTarget = `grade_${studentGrade}`;
          if (campaign.target_classes?.includes(gradeTarget)) {
            return true;
          }

          return false;
        });

        // Get consent data if available
        let consentData: any[] = [];
        if (consentsResponse.success && consentsResponse.data) {
          consentData = consentsResponse.data;
        }

        // Map students with their real consent status
        const studentsWithConsentStatus = allStudents.map((student: any) => {
          let consentStatus = 'none'; // none, pending, approved, declined

          if (campaign.requires_consent) {
            // Find consent for this student
            const consent = consentData.find((c: any) => {
              const studentId = typeof c.student === 'object' ? c.student._id : c.student;
              return studentId === student._id;
            });

            if (consent) {
              consentStatus = consent.status === 'Approved' ? 'approved' :
                consent.status === 'Declined' ? 'declined' : 'pending';
            } else {
              consentStatus = 'pending'; // No consent record means pending
            }
          } else {
            consentStatus = 'approved'; // No consent required means approved
          }

          return {
            ...student,
            consentStatus,
            confirmed: consentStatus === 'approved'
          };
        });

        setEligibleStudents(studentsWithConsentStatus);

        setIsStudentListModalVisible(true);


        const approvedCount = studentsWithConsentStatus.filter(s => s.confirmed).length;
        message.success(`Tìm thấy ${allStudents.length} học sinh đủ điều kiện, ${approvedCount} đã được phụ huynh đồng ý`);
      } else {
        message.error('Không thể tải danh sách học sinh');

      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải danh sách học sinh');

    } finally {
      setLoading(false);
    }
  };

  // Workflow Step 3: Record Exam Results
  const handleRecordExamResults = async (campaign: Campaign) => {
    setIsExamResultModalVisible(true);

    try {
      setSelectedCampaign(campaign);
      setLoading(true);



      // Fetch eligible students, campaign results, and consent data in parallel
      const [studentsResponse, resultsResponse, consentsResponse] = await Promise.all([
        nurseService.getStudents(),
        nurseService.getCampaignResults(campaign._id),
        nurseService.getCampaignConsents(campaign._id)
      ]);





      if (studentsResponse.success && studentsResponse.data) {
        // Filter students by target classes
        const eligibleStudents = studentsResponse.data.filter((student: any) => {
          // If "all_grades" is selected, include all students
          if (campaign.target_classes?.includes('all_grades')) {
            return true;
          }

          // Check if student's exact class is in target classes
          if (campaign.target_classes?.includes(student.class_name)) {
            return true;
          }

          // Check if student's grade level is in target classes
          const studentGrade = student.class_name?.substring(0, 2); // Extract grade like "10", "11", "12"
          const gradeTarget = `grade_${studentGrade}`;
          if (campaign.target_classes?.includes(gradeTarget)) {
            return true;
          }

          return false;
        });

        // Get consent data if available
        let consentData: any[] = [];
        if (consentsResponse.success && consentsResponse.data) {
          consentData = consentsResponse.data;
        }

        // Filter students who have approved consent (or no consent required)
        const approvedStudents = eligibleStudents.filter((student: any) => {
          if (!campaign.requires_consent) {
            return true; // If no consent required, all eligible students are approved
          }

          // Find consent for this student
          const consent = consentData.find((c: any) => {
            const studentId = typeof c.student === 'object' ? c.student._id : c.student;
            return studentId === student._id;
          });

          // Only include students with approved consent
          return consent && consent.status === 'Approved';
        });

        // Get list of students who already have results
        const examinedStudentIds = new Set();
        if (resultsResponse.success && resultsResponse.data) {
          resultsResponse.data.forEach((result: CampaignResult) => {
            const studentId = typeof result.student === 'object'
              ? (result.student as any)._id
              : result.student;
            examinedStudentIds.add(studentId);
          });
        }

        // Filter out students who have already been examined
        const unexaminedApprovedStudents = approvedStudents.filter((student: any) =>
          !examinedStudentIds.has(student._id)
        );

        setEligibleStudents(unexaminedApprovedStudents);

        setIsExamResultModalVisible(true);


        if (unexaminedApprovedStudents.length === 0) {
          if (approvedStudents.length === 0) {
            message.info('Chưa có học sinh nào được phụ huynh đồng ý tham gia khám');
          } else {
            message.info('Tất cả học sinh đã được phụ huynh đồng ý đều đã được khám');
          }
        } else {
          message.success(`Còn ${unexaminedApprovedStudents.length} học sinh đã được đồng ý chưa được khám`);
        }
      } else {
        message.error('Không thể tải danh sách học sinh');

      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải danh sách học sinh');

    } finally {
      setLoading(false);
    }
  };

  // Workflow Step 4: Send Results and Schedule Consultation
  const handleSendResultsAndSchedule = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);

    try {
      setLoading(true);

      // Get current campaign results and student-parent relations from the API
      const [resultsResponse, relationsResponse] = await Promise.all([
        nurseService.getCampaignResults(campaign._id),
        nurseService.getStudentParentRelations()
      ]);

      if (!resultsResponse.success || !resultsResponse.data) {
        message.error('Không thể tải kết quả khám');
        return;
      }

      // Create a map of student ID to parent information
      const studentParentMap = new Map();
      if (relationsResponse.success && relationsResponse.data) {
        relationsResponse.data.forEach((relation: any) => {
          const studentId = typeof relation.student === 'object' ? relation.student._id : relation.student;
          const parentId = typeof relation.parent === 'object' ? relation.parent._id : relation.parent;
          const parentName = typeof relation.parent === 'object' 
            ? `${relation.parent.first_name || ''} ${relation.parent.last_name || ''}`.trim()
            : 'Unknown Parent';
          
          studentParentMap.set(studentId, {
            parentId,
            parentName,
            relationship: relation.relationship
          });
        });
      }

      // Filter results that require consultation
      const abnormalResults = resultsResponse.data.filter((result: CampaignResult) =>
        result.checkupDetails && result.checkupDetails.requiresConsultation
      );

      if (abnormalResults.length > 0) {
        // Fetch existing consultation schedules to avoid duplicates
        let existingConsultations: any[] = [];
        try {
          const consultationResponse = await nurseService.getConsultationSchedules();


          // Handle different response formats for consultation data (same as calculateConsultationProgress)
          if (Array.isArray(consultationResponse)) {
            existingConsultations = consultationResponse;
          } else if (consultationResponse && consultationResponse.data) {
            existingConsultations = consultationResponse.data;
          } else if (consultationResponse && consultationResponse.success && consultationResponse.data) {
            existingConsultations = consultationResponse.data;
          }

          if (!Array.isArray(existingConsultations)) {
            existingConsultations = [];
          }
        } catch (error) {
          // Silent fail - use empty array as fallback
        }

        // Create a mapping of campaign result IDs to student IDs for better matching
        const resultIdToStudentId = new Map();
        abnormalResults.forEach((result: CampaignResult) => {
          const studentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
          resultIdToStudentId.set(result._id, studentId);
        });

        // Create a set of students who already have consultation schedules for THIS campaign
        const studentsWithConsultations = new Set();
        existingConsultations.forEach((consultation: any) => {
          // Use the same robust matching logic as calculateConsultationProgress
          let belongsToCurrentCampaign = false;
          let campaignResultId = null;
          let consultationStudentId: string | null = null;

          // Get consultation student ID
          if (consultation.student) {
            if (typeof consultation.student === 'object' && consultation.student._id) {
              consultationStudentId = consultation.student._id;
            } else if (typeof consultation.student === 'string') {
              consultationStudentId = consultation.student;
            }
          }

          // Method 1: Check via campaignResult object if it exists
          if (consultation.campaignResult && typeof consultation.campaignResult === 'object') {
            campaignResultId = consultation.campaignResult._id;

            // Check if the campaign result belongs to the current campaign via campaign field
            if (consultation.campaignResult.campaign) {
              let consultationCampaignId = null;
              if (typeof consultation.campaignResult.campaign === 'object') {
                consultationCampaignId = consultation.campaignResult.campaign._id;
              } else if (typeof consultation.campaignResult.campaign === 'string') {
                consultationCampaignId = consultation.campaignResult.campaign;
              }

              if (consultationCampaignId === campaign._id) {
                belongsToCurrentCampaign = true;
              }
            }

            // Also check if the campaignResult ID matches any of our campaign results
            if (!belongsToCurrentCampaign && campaignResultId && resultIdToStudentId.has(campaignResultId)) {
              belongsToCurrentCampaign = true;
            }
          }

          // Method 2: If campaignResult is a string, check if it matches
          if (!belongsToCurrentCampaign && consultation.campaignResult && typeof consultation.campaignResult === 'string') {
            campaignResultId = consultation.campaignResult;


            if (resultIdToStudentId.has(campaignResultId)) {
              belongsToCurrentCampaign = true;
            }
          }

          // Method 3: Cross-reference student in consultation with students in campaignResult
          if (!belongsToCurrentCampaign && consultationStudentId) {
            // Check if this student has any abnormal result in current campaign
            const matchingResult = abnormalResults.find((result: CampaignResult) => {
              const resultStudentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
              return resultStudentId === consultationStudentId;
            });

            if (matchingResult) {
              belongsToCurrentCampaign = true;
            }
          }

          // If this consultation belongs to the current campaign, add the student to the set
          if (belongsToCurrentCampaign && consultationStudentId) {
            studentsWithConsultations.add(consultationStudentId);
          }
        });

        // Filter out students who already have consultation schedules for THIS campaign
        const unscheduledAbnormalResults = abnormalResults.filter((result: CampaignResult) => {
          let studentId;
          if (typeof result.student === 'object' && (result.student as any)._id) {
            studentId = (result.student as any)._id;
          } else if (typeof result.student === 'string') {
            studentId = result.student;
          } else {
            return false; // Skip this result if we can't get the student ID
          }

          const hasSchedule = studentsWithConsultations.has(studentId);
          return !hasSchedule;
        });



        // Create a list of existing consultations for this campaign
        const existingConsultationsForCampaign = existingConsultations.filter((consultation: any) => {
          // Use the same matching logic to find consultations for this campaign
          let belongsToCurrentCampaign = false;
          let campaignResultId = null;

          if (consultation.campaignResult && typeof consultation.campaignResult === 'object') {
            campaignResultId = consultation.campaignResult._id;

            if (consultation.campaignResult.campaign) {
              let consultationCampaignId = null;
              if (typeof consultation.campaignResult.campaign === 'object') {
                consultationCampaignId = consultation.campaignResult.campaign._id;
              } else if (typeof consultation.campaignResult.campaign === 'string') {
                consultationCampaignId = consultation.campaignResult.campaign;
              }

              if (consultationCampaignId === campaign._id) {
                belongsToCurrentCampaign = true;
              }
            }

            if (!belongsToCurrentCampaign && campaignResultId && resultIdToStudentId.has(campaignResultId)) {
              belongsToCurrentCampaign = true;
            }
          } else if (consultation.campaignResult && typeof consultation.campaignResult === 'string') {
            campaignResultId = consultation.campaignResult;
            if (resultIdToStudentId.has(campaignResultId)) {
              belongsToCurrentCampaign = true;
            }
          }

          return belongsToCurrentCampaign;
        });

        // Only include students who need to book a consultation (unscheduled students)
        const studentsNeedingConsultation: Array<{ 
          studentId: string; 
          studentName: string; 
          reason: string; 
          isScheduled: boolean;
          parentId?: string;
          parentName?: string;
          resultId?: string;
        }> = [];

        // Only add unscheduled students who need booking
        unscheduledAbnormalResults.forEach((result: CampaignResult) => {
          const studentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
          const studentName = typeof result.student === 'object'
            ? `${(result.student as any).first_name || ''} ${(result.student as any).last_name || ''}`.trim()
            : 'Unknown Student';

          // Get parent info from our map
          const parentInfo = studentParentMap.get(studentId);

          studentsNeedingConsultation.push({
            studentId,
            studentName,
            reason: result.checkupDetails?.recommendations || 'Cần tư vấn thêm sau khám sức khỏe',
            isScheduled: false,
            parentId: parentInfo?.parentId,
            parentName: parentInfo?.parentName,
            resultId: result._id
          });
        });

        // Create the modal content with properly captured variables
        const scheduledCount = existingConsultationsForCampaign.length;
        const unscheduledCount = unscheduledAbnormalResults.length;



        // Log to confirm the code is reached


        setConsultationCandidates(studentsNeedingConsultation.map((student, index) => ({
          id: index,
          studentId: student.studentId,
          studentName: student.studentName,
          reason: student.reason,
          isScheduled: student.isScheduled,
          parentId: student.parentId,
          parentName: student.parentName,
          resultId: student.resultId
        })));
        setConsultationStats({
          totalAbnormal: studentsNeedingConsultation.length,
          alreadyScheduled: 0, // Not displayed anymore, only students needing booking are shown
          needsScheduling: studentsNeedingConsultation.length
        });
        setIsConsultationModalVisible(true);
        return;
      } else {
        notification.success({
          message: 'Thành công',
          description: 'Tất cả học sinh đều có kết quả khám bình thường. Đã gửi kết quả cho phụ huynh.',
        });
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi xử lý kết quả khám');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to reload consultation candidates list
  const reloadConsultationCandidates = async () => {
    if (!selectedCampaign) return;

    try {
      // Get current campaign results and student-parent relations from the API
      const [resultsResponse, relationsResponse] = await Promise.all([
        nurseService.getCampaignResults(selectedCampaign._id),
        nurseService.getStudentParentRelations()
      ]);

      if (!resultsResponse.success || !resultsResponse.data) {
        return;
      }

      // Create a map of student ID to parent information
      const studentParentMap = new Map();
      if (relationsResponse.success && relationsResponse.data) {
        relationsResponse.data.forEach((relation: any) => {
          const studentId = typeof relation.student === 'object' ? relation.student._id : relation.student;
          const parentId = typeof relation.parent === 'object' ? relation.parent._id : relation.parent;
          const parentName = typeof relation.parent === 'object' 
            ? `${relation.parent.first_name || ''} ${relation.parent.last_name || ''}`.trim()
            : 'Unknown Parent';
          
          studentParentMap.set(studentId, {
            parentId,
            parentName,
            relationship: relation.relationship
          });
        });
      }

      // Filter results that require consultation
      const abnormalResults = resultsResponse.data.filter((result: CampaignResult) =>
        result.checkupDetails && result.checkupDetails.requiresConsultation
      );

      if (abnormalResults.length > 0) {
        // Fetch existing consultation schedules to avoid duplicates
        let existingConsultations: any[] = [];
        try {
          const consultationResponse = await nurseService.getConsultationSchedules();


          // Handle different response formats for consultation data (same as calculateConsultationProgress)
          if (Array.isArray(consultationResponse)) {
            existingConsultations = consultationResponse;
          } else if (consultationResponse && consultationResponse.data) {
            existingConsultations = consultationResponse.data;
          } else if (consultationResponse && consultationResponse.success && consultationResponse.data) {
            existingConsultations = consultationResponse.data;
          }

          if (!Array.isArray(existingConsultations)) {
            existingConsultations = [];
          }
        } catch (error) {
          // Silent fail - use empty array as fallback
        }

        // Create a mapping of campaign result IDs to student IDs for better matching
        const resultIdToStudentId = new Map();
        abnormalResults.forEach((result: CampaignResult) => {
          const studentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
          resultIdToStudentId.set(result._id, studentId);
        });

        // Create a set of students who already have consultation schedules for THIS campaign
        const studentsWithConsultations = new Set();
        existingConsultations.forEach((consultation: any) => {
          // Use the same robust matching logic as calculateConsultationProgress
          let belongsToCurrentCampaign = false;
          let campaignResultId = null;
          let consultationStudentId: string | null = null;

          // Get consultation student ID
          if (consultation.student) {
            if (typeof consultation.student === 'object' && consultation.student._id) {
              consultationStudentId = consultation.student._id;
            } else if (typeof consultation.student === 'string') {
              consultationStudentId = consultation.student;
            }
          }

          // Method 1: Check via campaignResult object if it exists
          if (consultation.campaignResult && typeof consultation.campaignResult === 'object') {
            campaignResultId = consultation.campaignResult._id;

            // Check if the campaign result belongs to the current campaign via campaign field
            if (consultation.campaignResult.campaign) {
              let consultationCampaignId = null;
              if (typeof consultation.campaignResult.campaign === 'object') {
                consultationCampaignId = consultation.campaignResult.campaign._id;
              } else if (typeof consultation.campaignResult.campaign === 'string') {
                consultationCampaignId = consultation.campaignResult.campaign;
              }

              if (consultationCampaignId === selectedCampaign._id) {
                belongsToCurrentCampaign = true;
              }
            }

            // Also check if the campaignResult ID matches any of our campaign results
            if (!belongsToCurrentCampaign && campaignResultId && resultIdToStudentId.has(campaignResultId)) {
              belongsToCurrentCampaign = true;
            }
          }

          // Method 2: If campaignResult is a string, check if it matches
          if (!belongsToCurrentCampaign && consultation.campaignResult && typeof consultation.campaignResult === 'string') {
            campaignResultId = consultation.campaignResult;


            if (resultIdToStudentId.has(campaignResultId)) {
              belongsToCurrentCampaign = true;
            }
          }

          // Method 3: Cross-reference student in consultation with students in campaignResult
          if (!belongsToCurrentCampaign && consultationStudentId) {
            // Check if this student has any abnormal result in current campaign
            const matchingResult = abnormalResults.find((result: CampaignResult) => {
              const resultStudentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
              return resultStudentId === consultationStudentId;
            });

            if (matchingResult) {
              belongsToCurrentCampaign = true;
            }
          }

          // If this consultation belongs to the current campaign, add the student to the set
          if (belongsToCurrentCampaign && consultationStudentId) {
            studentsWithConsultations.add(consultationStudentId);
          }
        });

        // Filter out students who already have consultation schedules for THIS campaign
        const unscheduledAbnormalResults = abnormalResults.filter((result: CampaignResult) => {
          let studentId;
          if (typeof result.student === 'object' && (result.student as any)._id) {
            studentId = (result.student as any)._id;
          } else if (typeof result.student === 'string') {
            studentId = result.student;
          } else {
            return false; // Skip this result if we can't get the student ID
          }

          const hasSchedule = studentsWithConsultations.has(studentId);
          return !hasSchedule;
        });


        // Only include students who need to book a consultation (unscheduled students)
        const studentsNeedingConsultation: Array<{ 
          studentId: string; 
          studentName: string; 
          reason: string; 
          isScheduled: boolean;
          parentId?: string;
          parentName?: string;
          resultId?: string;
        }> = [];

        // Only add unscheduled students who need booking
        unscheduledAbnormalResults.forEach((result: CampaignResult) => {
          const studentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
          const studentName = typeof result.student === 'object'
            ? `${(result.student as any).first_name || ''} ${(result.student as any).last_name || ''}`.trim()
            : 'Unknown Student';

          // Get parent info from our map
          const parentInfo = studentParentMap.get(studentId);

          studentsNeedingConsultation.push({
            studentId,
            studentName,
            reason: result.checkupDetails?.recommendations || 'Cần tư vấn thêm sau khám sức khỏe',
            isScheduled: false,
            parentId: parentInfo?.parentId,
            parentName: parentInfo?.parentName,
            resultId: result._id
          });
        });

        // Update the consultation candidates list
        setConsultationCandidates(studentsNeedingConsultation.map((student, index) => ({
          id: index,
          studentId: student.studentId,
          studentName: student.studentName,
          reason: student.reason,
          isScheduled: student.isScheduled,
          parentId: student.parentId,
          parentName: student.parentName,
          resultId: student.resultId
        })));

        // Update consultation stats
        setConsultationStats({
          totalAbnormal: studentsNeedingConsultation.length,
          alreadyScheduled: 0,
          needsScheduling: studentsNeedingConsultation.length
        });
      } else {
        // No students need consultation
        setConsultationCandidates([]);
        setConsultationStats({
          totalAbnormal: 0,
          alreadyScheduled: 0,
          needsScheduling: 0
        });
      }
    } catch (error) {
      console.error('Error reloading consultation candidates:', error);
    }
  };

  const submitConsultationSchedule = async (values: any) => {
   

    // Validation checks
    if (!selectedCampaign) {
      message.error('Không tìm thấy thông tin chiến dịch hoặc học sinh. Vui lòng chọn học sinh trước khi đặt lịch.');
      return;
    }
    if (!currentConsultationStudent) {
      message.error('Không tìm thấy thông tin chiến dịch hoặc học sinh. Vui lòng chọn học sinh trước khi đặt lịch.');
      return;
    }

    if (!selectedCampaign || !currentConsultationStudent) {
      message.error('Không tìm thấy thông tin chiến dịch hoặc học sinh. Vui lòng chọn học sinh trước khi đặt lịch.');
      return;
    }
    try {
      setLoading(true);

      // Check if the student has parent information
      if (!currentConsultationStudent.parentId) {
        message.error('Học sinh này không có thông tin phụ huynh. Không thể đặt lịch tư vấn.');
        return;
      }

      // Validate form values
      if (!values.scheduledDate) {
        message.error('Vui lòng chọn ngày và giờ tư vấn');
        return;
      }

      // Check for overlapping consultations
      try {
        const shouldCancelBooking = await checkForOverlappingConsultations(values.scheduledDate, values.duration || 30);
        if (shouldCancelBooking) {
          // User chose to cancel due to overlap - return without showing additional message
          return;
        }
      } catch (error) {
        // If overlap check fails, show error and stop booking
        message.error({
          content: '❌ Không thể kiểm tra trùng lịch. Vui lòng thử lại hoặc kiểm tra thủ công.',
          duration: 6
        });
        return;
      }

      const scheduleData = {
        campaignResult: currentConsultationStudent.resultId,
        student: currentConsultationStudent.studentId,
        attending_parent: currentConsultationStudent.parentId,
        scheduledDate: values.scheduledDate.toISOString(),
        duration: values.duration || 30,
        reason: currentConsultationStudent.reason,
        notes: values.notes || ''
      };


      const response = await nurseService.createConsultationSchedule(scheduleData);

      if (response.success) {
        notification.success({
          message: 'Thành công',
          description: `Đã đặt lịch tư vấn cho học sinh ${currentConsultationStudent.studentName}. Tiến độ đã được cập nhật.`,
          duration: 3
        });

        // Update consultation progress for the current campaign
        if (selectedCampaign) {
          const updatedProgress = await calculateConsultationProgress(selectedCampaign._id);
          setConsultationProgress(prev => ({
            ...prev,
            [selectedCampaign._id]: updatedProgress
          }));
        }

        // Reload the consultation candidates list to reflect the updated data
        await reloadConsultationCandidates();
        
        // Clear current student selection to allow fresh selection from updated list
        setCurrentConsultationStudent(null);

        // Store current student ID before clearing the state
        const currentStudentId = currentConsultationStudent.studentId;

        // Update scheduled students list and handle next steps in the callback
        setScheduledStudents(prevScheduled => {
          const newScheduled = [...prevScheduled, currentStudentId];

          // Handle next steps after state update - use a timeout to allow reloadConsultationCandidates to complete
          setTimeout(() => {
            // Since we cleared currentConsultationStudent after reload, 
            // check if there are any students left in the updated consultationCandidates list
            if (consultationCandidates.length > 0) {
              // Select the first available student from the updated list
              selectStudentForConsultation(consultationCandidates[0]);
            } else {
              // All students are scheduled, close modal
              setTimeout(async () => {
                // Refresh consultation progress for the current campaign
                if (selectedCampaign) {
                  const updatedProgress = await calculateConsultationProgress(selectedCampaign._id);
                  setConsultationProgress(prev => ({
                    ...prev,
                    [selectedCampaign._id]: updatedProgress
                  }));
                }

                setIsConsultationModalVisible(false);
                setConsultationCandidates([]);
                setScheduledStudents([]);
                setConsultationStats({ totalAbnormal: 0, alreadyScheduled: 0, needsScheduling: 0 });
                message.success('Đã đặt lịch tư vấn cho tất cả học sinh cần tư vấn');
              }, 300);
            }
          }, 500); // Increased timeout to allow reload to complete

          return newScheduled;
        });

        // Reset form
        consultationForm.resetFields();

      } else {
        // Check if it's a conflict error (409 status) or backend reports conflict
        if ((response as any).conflict || (response.message && response.message.includes('conflict')) || (response.message && response.message.includes('overlap'))) {
          message.error({
            content: '🚫 Thời gian tư vấn bị trùng lặp với lịch khác. Backend đã từ chối yêu cầu đặt lịch.',
            duration: 6
          });
        } else if (response.message && response.message.includes('validation')) {
          message.error({
            content: '❌ Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đặt lịch.',
            duration: 4
          });
        } else {
          message.error({
            content: response.message || '❌ Có lỗi xảy ra khi đặt lịch tư vấn. Vui lòng thử lại.',
            duration: 4
          });
        }
      }

    } catch (error) {
      message.error('Có lỗi xảy ra khi đặt lịch tư vấn');
    } finally {
      setLoading(false);
    }
  };

  const submitNotification = async (values: any) => {
    try {
      // Here you would call API to send notifications to parents
      message.success('Đã gửi thông báo thành công đến phụ huynh');
      setIsNotificationModalVisible(false);
      notificationForm.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi gửi thông báo');
    }
  };

  const submitExamResult = async (values: any) => {
    if (!selectedCampaign) {
      message.error('Không tìm thấy thông tin chiến dịch');
      return;
    }

    try {
      setLoading(true);

      // Prepare the result data with the simplified structure
      const resultData = {
        campaign: selectedCampaign._id,
        student: values.studentId,
        notes: values.notes || '',
        checkupDetails: {
          findings: values.findings,
          recommendations: values.recommendations,
          status: values.status,
          requiresConsultation: values.requiresConsultation || false,
        }
      };

      // Submit to backend
      const response = await nurseService.submitCampaignResult(resultData);

      if (response.success) {
        // Add to local state for immediate UI update
        const newResult = {
          studentId: values.studentId,
          findings: values.findings,
          recommendations: values.recommendations,
          status: values.status,
          requiresConsultation: values.requiresConsultation,
          notes: values.notes,
          examDate: new Date(),
        };

        setExamResults([...examResults, newResult]);
        message.success('Đã lưu kết quả khám thành công');
        examForm.resetFields();

        // Refresh the results data
        if (selectedCampaign) {
          loadCampaignDetails(selectedCampaign._id);

          // Refresh consultation progress since new exam results might require consultation
          const updatedProgress = await calculateConsultationProgress(selectedCampaign._id);
          setConsultationProgress(prev => ({
            ...prev,
            [selectedCampaign._id]: updatedProgress
          }));
        }
      } else {
        message.error('Có lỗi xảy ra khi lưu kết quả khám');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu kết quả khám');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to select a student for individual consultation scheduling
  const selectStudentForConsultation = (candidate: any) => {

    setCurrentConsultationStudent(candidate);
    consultationForm.resetFields();
    consultationForm.setFieldsValue({
      duration: 30
    });
  }

  // Get the next unscheduled student
  const getNextUnscheduledStudent = () => {
    return consultationCandidates.find(c =>
      !scheduledStudents.includes(c.studentId) && (!currentConsultationStudent || c.studentId !== currentConsultationStudent.studentId)
    );
  };

  // Helper function to check for overlapping consultation times via backend
  // Returns true if booking should be cancelled due to overlap, false if booking should proceed
  const checkForOverlappingConsultations = async (newScheduledDate: moment.Moment, newDuration: number): Promise<boolean> => {
    try {
      // Call backend API to check for overlaps
      const response = await nurseService.checkConsultationOverlap({
        scheduledDate: newScheduledDate.toISOString(),
        duration: newDuration
      });
      
      if (response.success && response.data && response.data.hasOverlap) {
        const conflict = response.data.conflictingConsultation;
        
        // Extract student name from different possible structures
        let conflictStudentName = 'Không xác định';
        if (conflict?.student) {
          if (typeof conflict.student === 'object' && conflict.student.first_name && conflict.student.last_name) {
            conflictStudentName = `${conflict.student.first_name} ${conflict.student.last_name}`;
          } else if (typeof conflict.student === 'string') {
            conflictStudentName = conflict.student;
          }
        }
        
        // Show error message for overlap
        message.error({
          content: `🚫 Trùng lịch tư vấn với học sinh ${conflictStudentName} vào ${moment(conflict?.scheduledDate).format('DD/MM/YYYY HH:mm')}. Vui lòng chọn thời gian khác!`,
          duration: 8
        });
        
        // Show informational alert dialog about overlap
        window.alert(
          `⚠️ PHÁT HIỆN TRÙNG LỊCH TƯ VẤN!\n\n` +
          `🔸 Học sinh hiện có: ${conflictStudentName}\n` +
          `🔸 Thời gian đã đặt: ${moment(conflict?.scheduledDate).format('DD/MM/YYYY HH:mm')} - ${moment(conflict?.scheduledDate).add(conflict?.duration || 30, 'minutes').format('HH:mm')}\n` +
          `🔸 Thời gian bạn chọn: ${newScheduledDate.format('DD/MM/YYYY HH:mm')} - ${moment(newScheduledDate).add(newDuration, 'minutes').format('HH:mm')}\n\n` +
          `❌ Không thể đặt lịch trùng với lịch hiện có.\n` +
          `💡 Vui lòng chọn thời gian khác để tránh xung đột!`
        );
        
        // Always cancel booking when overlap is detected (no user choice)
        const userChoice = false;
        
        // Since we have overlap, always cancel the booking
        message.info({
          content: '✅ Đã hủy đặt lịch do trùng thời gian. Vui lòng chọn thời gian khác.',
          duration: 6
        });
        
        return true; // Cancel booking due to overlap
      }

      return false; // No overlaps found - continue booking
    } catch (error) {
      // If backend check fails, show warning but allow booking
      message.warning({
        content: 'Không thể kiểm tra trùng lịch với máy chủ. Vui lòng kiểm tra thủ công trước khi đặt lịch.',
        duration: 6
      });
      return false; // Continue booking despite check failure
    }
  };

  return (
    <div className="p-6">
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Title level={2}>Quản lý Chiến dịch</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateCampaign}
          >
            Tạo chiến dịch mới
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={campaigns}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} chiến dịch`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingCampaign ? 'Chỉnh sửa chiến dịch' : 'Tạo chiến dịch mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingCampaign(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Tên chiến dịch"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên chiến dịch' },
                  { min: 5, message: 'Tên chiến dịch phải có ít nhất 5 ký tự' },
                  { max: 100, message: 'Tên chiến dịch không được quá 100 ký tự' }
                ]}
              >
                <Input
                  placeholder="Nhập tên chiến dịch"
                  showCount
                  maxLength={100}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="campaign_type"
                label="Loại chiến dịch"
                rules={[{ required: true, message: 'Vui lòng chọn loại chiến dịch' }]}
              >
                <Select placeholder="Chọn loại chiến dịch">
                  <Option value="vaccination">Tiêm phòng</Option>
                  <Option value="health_check">Khám sức khỏe</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả' },
              { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' },
              { max: 500, message: 'Mô tả không được quá 500 ký tự' }
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Nhập mô tả chi tiết về chiến dịch, mục tiêu và nội dung thực hiện"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date_range"
                label="Thời gian thực hiện"
                rules={[
                  { required: true, message: 'Vui lòng chọn thời gian' },
                  {
                    validator: (_, value) => {
                      if (!value || value.length !== 2) {
                        return Promise.reject(new Error('Vui lòng chọn khoảng thời gian hợp lệ'));
                      }
                      if (!editingCampaign && value[0].isBefore(moment().startOf('day'))) {
                        return Promise.reject(new Error('Ngày bắt đầu không thể là ngày trong quá khứ'));
                      }
                      if (value[1].isBefore(value[0])) {
                        return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  disabledDate={(current) => {
                    // Only disable past dates for new campaigns
                    if (!current) return false;
                    const today = moment().startOf('day');
                    const currentMoment = moment(current.toDate());
                    return !editingCampaign && currentMoment.isBefore(today);
                  }}
                  showTime={{ format: 'HH:mm' }}
                  format="DD/MM/YYYY HH:mm"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="draft">Bản nháp</Option>
                  <Option value="active">Đang hoạt động</Option>
                  <Option value="completed">Hoàn thành</Option>
                  <Option value="cancelled">Đã hủy</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="target_classes"
            label={
              <span>
                Nhóm đối tượng{' '}
                <Button
                  type="link"
                  size="small"
                  onClick={() => loadAvailableClasses()}
                  loading={loadingClasses}
                  title="Tải lại danh sách lớp"
                  style={{ padding: 0, height: 'auto' }}
                >
                  🔄
                </Button>
              </span>
            }
            tooltip="Chọn lớp hoặc khối lớp mà chiến dịch sẽ nhắm tới. Danh sách được tạo từ học sinh hiện có trong hệ thống."
            rules={[
              { required: true, message: 'Vui lòng chọn nhóm đối tượng' },
              {
                validator: (_, value) => {
                  if (!value || value.length === 0) {
                    return Promise.reject(new Error('Vui lòng chọn ít nhất một nhóm đối tượng'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn nhóm đối tượng"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={getTargetClassOptions()}
            />
          </Form.Item>

          <Form.Item
            name="instructions"
            label="Hướng dẫn thực hiện"
          >
            <TextArea
              rows={3}
              placeholder="Nhập hướng dẫn chi tiết cho nhân viên y tế và phụ huynh về cách thực hiện chiến dịch"
              showCount
              maxLength={300}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="requires_consent"
                label="Yêu cầu đồng ý của phụ huynh"
                tooltip="Có yêu cầu phụ huynh đồng ý trước khi thực hiện chiến dịch không?"
              >
                <Select defaultValue={true}>
                  <Option value={true}>Có - Cần đồng ý của phụ huynh</Option>
                  <Option value={false}>Không - Không cần đồng ý</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="consent_deadline"
                label="Hạn cuối đồng ý"
                tooltip="Ngày hạn cuối để phụ huynh gửi đồng ý tham gia"
                dependencies={['requires_consent']}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Chọn hạn cuối đồng ý"
                  disabledDate={(current) => {
                    if (!current) return false;
                    const today = moment().startOf('day');
                    const currentMoment = moment(current.toDate());
                    return currentMoment.isBefore(today);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={editingCampaign ? <EditOutlined /> : <PlusOutlined />}
              >
                {editingCampaign ? 'Cập nhật chiến dịch' : 'Tạo chiến dịch'}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setEditingCampaign(null);
                }}
                disabled={loading}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title="Chi tiết chiến dịch"
        placement="right"
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
        width={720}
      >
        {selectedCampaign && (
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Thông tin chung" key="info">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Tên chiến dịch">
                  {selectedCampaign.title}
                </Descriptions.Item>
                <Descriptions.Item label="Loại">
                  {getCampaignTypeTag(selectedCampaign.campaign_type)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {getStatusTag(selectedCampaign.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian">
                  {moment(selectedCampaign.start_date).format('DD/MM/YYYY')} - {moment(selectedCampaign.end_date).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                  {selectedCampaign.description}
                </Descriptions.Item>
                <Descriptions.Item label="Hướng dẫn">
                  {selectedCampaign.instructions}
                </Descriptions.Item>
                <Descriptions.Item label="Nhóm đối tượng">
                  {selectedCampaign.target_classes?.map((group: string) => (
                    <Tag key={group} color="default">{group}</Tag>
                  ))}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Quy trình thực hiện" key="workflow">
              <Steps direction="vertical" size="small" current={0}>
                <Step
                  title="Gửi thông báo"
                  description="Gửi thông báo khám sức khỏe đến phụ huynh"
                  icon={<SendOutlined />}
                />
                <Step
                  title="Chuẩn bị danh sách"
                  description="Lập danh sách học sinh tham gia khám"
                  icon={<UserOutlined />}
                />
                <Step
                  title="Thực hiện khám"
                  description="Tiến hành khám và ghi nhận kết quả"
                  icon={<FileTextOutlined />}
                />
                <Step
                  title="Gửi kết quả & hẹn lịch"
                  description="Gửi kết quả cho phụ huynh và đặt lịch tư vấn nếu cần"
                  icon={<CalendarOutlined />}
                />
              </Steps>
            </TabPane>

            <TabPane tab="Đồng ý tham gia" key="consents">
              <div className="mb-4">
                <Progress
                  percent={calculateProgress(selectedCampaign)}
                  format={(percent) => `${percent}% đã đồng ý`}
                />
              </div>
              {eligibleStudents.length > 0 ? (
                <List
                  dataSource={eligibleStudents}
                  renderItem={(student: any) => {
                    // Find corresponding consent for this student
                    const consent = consents.find((c: any) => {
                      const studentId = typeof c.student === 'object' ? c.student._id : c.student;
                      return studentId === student._id;
                    });

                    return (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <>
                              <Tag color="blue" style={{ marginRight: 8 }}>Phụ huynh</Tag>
                              {consent && typeof consent.answered_by === 'object' && consent.answered_by
                                ? `${(consent.answered_by as any).first_name || ''} ${(consent.answered_by as any).last_name || ''}`.trim() || 'Chưa phản hồi'
                                : (typeof consent?.answered_by === 'string' ? consent.answered_by : 'Chưa phản hồi')}
                            </>
                          }
                          description={
                            <>
                              <Tag color="green" style={{ marginRight: 8 }}>Học sinh</Tag>
                              {`${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A'}
                            </>
                          }
                        />
                        <Tag color={
                          !selectedCampaign?.requires_consent ? 'green' :
                          consent?.status === 'Approved' ? 'green' : 
                          consent?.status === 'Declined' ? 'red' : 'orange'
                        }>
                          {!selectedCampaign?.requires_consent ? 'Không cần đồng ý' :
                           consent?.status === 'Approved' ? 'Đã đồng ý' : 
                           consent?.status === 'Declined' ? 'Đã từ chối' : 'Chờ phản hồi'}
                        </Tag>
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <Alert
                  message="Chưa có dữ liệu đồng ý tham gia"
                  description="Chưa có phụ huynh nào phản hồi về việc tham gia chiến dịch này."
                  type="info"
                  showIcon
                />
              )}
            </TabPane>

            <TabPane tab="Kết quả khám" key="results">
              {results.length > 0 ? (
                <List
                  dataSource={results}
                  renderItem={(result: CampaignResult) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <>
                            <Tag color="green" style={{ marginRight: 8 }}>Học sinh</Tag>
                            {typeof (result as any).student === 'object' && (result as any).student
                              ? `${(result as any).student.first_name || ''} ${(result as any).student.last_name || ''}`.trim() || 'N/A'
                              : (result as any).student || result.student || 'N/A'}
                          </>
                        }
                        description={
                          <div>
                            <div><strong>Ghi chú:</strong> {result.notes || 'Không có ghi chú'}</div>
                            <div><strong>Ngày khám:</strong> {moment(result.createdAt).format('DD/MM/YYYY')}</div>
                            {result.checkupDetails && (
                              <>
                                <div style={{ marginTop: 8 }}>
                                  <strong>Trạng thái:</strong>
                                  <Tag 
                                    color={result.checkupDetails.status === 'HEALTHY' ? 'green' :
                                      result.checkupDetails.status === 'NEEDS_ATTENTION' ? 'orange' : 'red'}
                                    style={{ marginLeft: 8 }}
                                  >
                                    {result.checkupDetails.status === 'HEALTHY' ? 'Khỏe mạnh' :
                                      result.checkupDetails.status === 'NEEDS_ATTENTION' ? 'Cần chú ý' : 'Nghiêm trọng'}
                                  </Tag>
                                </div>
                                {result.checkupDetails.findings && (
                                  <div><strong>Kết quả khám:</strong> {result.checkupDetails.findings}</div>
                                )}
                                {result.checkupDetails.recommendations && (
                                  <div><strong>Khuyến nghị:</strong> {result.checkupDetails.recommendations}</div>
                                )}
                                {result.checkupDetails.requiresConsultation && (
                                  <div style={{ marginTop: 8 }}>
                                    <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                                      Cần tư vấn
                                    </Tag>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Alert
                  message="Chưa có kết quả khám"
                  description="Chưa có kết quả khám nào được ghi nhận cho chiến dịch này."
                  type="info"
                  showIcon
                />
              )}
            </TabPane>
          </Tabs>
        )}
      </Drawer>

      {/* Step 1: Send Notification Modal */}
      <Modal
        title="Gửi thông báo khám sức khỏe"
        open={isNotificationModalVisible}
        onCancel={() => setIsNotificationModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={notificationForm}
          layout="vertical"
          onFinish={submitNotification}
        >
          <Form.Item
            name="title"
            label="Tiêu đề thông báo"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề thông báo" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung thông báo"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea rows={10} placeholder="Nhập nội dung thông báo" />
          </Form.Item>

          <Alert
            message="Lưu ý"
            description="Thông báo sẽ được gửi đến tất cả phụ huynh có con trong các lớp mục tiêu."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                Gửi thông báo
              </Button>
              <Button onClick={() => setIsNotificationModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Step 2: Student List Modal */}
      <Modal
        title="Danh sách học sinh tham gia khám"
        open={isStudentListModalVisible}
        onCancel={() => setIsStudentListModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsStudentListModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        <Alert
          message="Danh sách học sinh đủ điều kiện tham gia khám sức khỏe"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Table
          dataSource={eligibleStudents}
          rowKey="_id"
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          columns={[
            {
              title: 'Họ và tên',
              render: (_, record) => `${record.first_name} ${record.last_name}`,
              width: 200,
            },
            {
              title: 'Lớp',
              dataIndex: 'class_name',
              width: 100,
            },
            {
              title: 'Ngày sinh',
              dataIndex: 'dateOfBirth',
              render: (date) => date ? moment(date).format('DD/MM/YYYY') : 'N/A',
              width: 120,
            },
            {
              title: 'Trạng thái đồng ý',
              dataIndex: 'consentStatus',
              render: (status: string, record: any) => {
                if (!selectedCampaign?.requires_consent) {
                  return <Tag color="green">Không cần đồng ý</Tag>;
                }

                const colorMap = {
                  'approved': 'green',
                  'declined': 'red',
                  'pending': 'orange',
                  'none': 'default'
                };

                const textMap = {
                  'approved': 'Đã đồng ý',
                  'declined': 'Đã từ chối',
                  'pending': 'Chờ phản hồi',
                  'none': 'Chưa có phản hồi'
                };

                return (
                  <Tag color={colorMap[status as keyof typeof colorMap]}>
                    {textMap[status as keyof typeof textMap]}
                  </Tag>
                );
              },
              width: 150,
            },
            {
              title: 'Có thể tham gia',
              dataIndex: 'confirmed',
              render: (confirmed: boolean) => (
                <Tag color={confirmed ? 'green' : 'orange'} icon={confirmed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
                  {confirmed ? 'Có thể tham gia' : 'Chờ xác nhận'}
                </Tag>
              ),
              width: 140,
            }
          ]}
          summary={(pageData) => {
            const total = pageData.length;
            const confirmed = pageData.filter(record => record.confirmed).length;
            const pending = total - confirmed;

            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong>Tổng kết:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <Tag color="blue">{total} học sinh</Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    <Space>
                      <Tag color="green">{confirmed} có thể tham gia</Tag>
                      <Tag color="orange">{pending} chờ xác nhận</Tag>
                    </Space>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Modal>

      {/* Step 3: Record Exam Results Modal */}
      <Modal
        title="Ghi nhận kết quả khám sức khỏe"
        open={isExamResultModalVisible}
        onCancel={() => setIsExamResultModalVisible(false)}
        footer={null}
        width={700}
      >
        {eligibleStudents.length > 0 ? (
          <>
            <Form
              form={examForm}
              layout="vertical"
              onFinish={submitExamResult}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="studentId"
                    label="Học sinh"
                    rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
                  >
                    <Select placeholder="Chọn học sinh">
                      {eligibleStudents.map(student => (
                        <Option key={student._id} value={student._id}>
                          {student.first_name} {student.last_name} - {student.class_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="examDate"
                    label="Ngày khám"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày khám' }]}
                    initialValue={moment()}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="findings"
                label="Kết quả khám"
                rules={[{ required: true, message: 'Vui lòng nhập kết quả khám' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập kết quả chi tiết của cuộc khám (chiều cao, cân nặng, thị lực, huyết áp, nhịp tim, v.v.)"
                />
              </Form.Item>

              <Form.Item
                name="recommendations"
                label="Khuyến nghị"
                rules={[{ required: true, message: 'Vui lòng nhập khuyến nghị' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Nhập khuyến nghị cho học sinh (ví dụ: cần theo dõi, tái khám, tư vấn chuyên khoa, v.v.)"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="Trạng thái sức khỏe"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                  >
                    <Select placeholder="Chọn trạng thái sức khỏe">
                      <Option value="HEALTHY">Khỏe mạnh</Option>
                      <Option value="NEEDS_ATTENTION">Cần chú ý</Option>
                      <Option value="CRITICAL">Nghiêm trọng</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="requiresConsultation"
                    label="Cần tư vấn"
                  >
                    <Select placeholder="Có cần tư vấn không?" defaultValue={false}>
                      <Option value={false}>Không</Option>
                      <Option value={true}>Có</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="notes" label="Ghi chú bổ sung">
                <TextArea rows={2} placeholder="Nhập ghi chú bổ sung (tùy chọn)" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                                       icon={<CheckCircleOutlined />}
                    loading={loading}
                  >
                    Lưu kết quả
                  </Button>
                  <Button onClick={() => setIsExamResultModalVisible(false)}>
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>

            {examResults.length > 0 && (
              <>
                <Divider>Kết quả đã ghi nhận</Divider>
                <List
                  dataSource={examResults}
                  renderItem={(result, index) => (
                    <List.Item>
                      <List.Item.Meta
                        title={`Kết quả khám #${index + 1}`}
                        description={
                          <div>
                            <div><strong>Kết quả:</strong> {result.findings}</div>
                            <div><strong>Khuyến nghị:</strong> {result.recommendations}</div>
                            <div><strong>Trạng thái:</strong>
                              <Tag color={result.status === 'HEALTHY' ? 'green' :
                                result.status === 'NEEDS_ATTENTION' ? 'orange' : 'red'}
                                style={{ marginLeft: 8 }}>
                                {result.status === 'HEALTHY' ? 'Khỏe mạnh' :
                                  result.status === 'NEEDS_ATTENTION' ? 'Cần chú ý' : 'Nghiêm trọng'}
                              </Tag>
                            </div>
                            {result.requiresConsultation && (
                              <div>
                                <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                                  Cần tư vấn
                                </Tag>
                              </div>
                            )}
                            {result.notes && (
                              <div><strong>Ghi chú:</strong> {result.notes}</div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </>
            )}
          </>
        ) : (
          <Alert
            message="Không có học sinh nào để khám"
            description={
              selectedCampaign?.requires_consent
                ? "Chưa có học sinh nào được phụ huynh đồng ý tham gia khám"
                : "Tất cả học sinh trong chiến dịch này đã được khám hoặc chưa có học sinh nào trong danh sách mục tiêu."
            }
            type="info"
            showIcon
            action={
              <Button
                size="small"
                onClick={() => setIsExamResultModalVisible(false)}
              >
                Đóng
              </Button>
            }
          />
        )}
      </Modal>

      {/* Step 4: Schedule Consultation Modal - Simple Review */}
      <Modal
        title={`Lịch tư vấn - ${selectedCampaign?.title || 'Chiến dịch'}`}
        open={isConsultationModalVisible}
        onCancel={() => {
          setIsConsultationModalVisible(false);
          setConsultationCandidates([]);
          setScheduledStudents([]);
          setCurrentConsultationStudent(null);
          setConsultationStats({ totalAbnormal: 0, alreadyScheduled: 0, needsScheduling: 0 });
          consultationForm.resetFields();
        }}
        footer={[
          <Button key="close" onClick={() => setIsConsultationModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={500}
      >
        <div style={{ marginTop: 16 }}>

      {/* List of students needing consultation booking */}
      <Card size="small" title="Danh sách học sinh cần đặt lịch tư vấn" style={{ marginBottom: 16 }}>
        {consultationCandidates.length === 0 && (
          <div style={{ marginTop: 4 }}>
            <Tag color="green">Tất cả học sinh đều đã có lịch tư vấn</Tag>
          </div>
        )}
        <List
          dataSource={consultationCandidates}
          renderItem={(candidate) => {
            const isCurrent = currentConsultationStudent?.studentId === candidate.studentId;

            return (
              <List.Item
                key={`candidate-${candidate.studentId}`}
                style={{
                  backgroundColor: isCurrent ? '#e6fffb' : 'transparent',
                  border: isCurrent ? '1px solid #36cfc9' : '1px solid #f0f0f0',
                  borderRadius: '6px',
                  marginBottom: '4px',
                  padding: '8px 12px'
                }}
                actions={[
                  isCurrent ? (
                    <Tag color="blue">🔄 Đang xử lý</Tag>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => selectStudentForConsultation(candidate)}
                    >
                      Chọn đặt lịch
                    </Button>
                  )
                ]}
              >
                <List.Item.Meta
                  title={
                    <div>
                      <Text strong>
                        {candidate.studentName}
                      </Text>
                      {!candidate.parentId && (
                        <Tag color="orange" style={{ marginLeft: 8 }}>⚠️ Thiếu thông tin PH</Tag>
                      )}
                    </div>
                  }
                  description={`Lý do tư vấn: ${candidate.reason}`}
                />
              </List.Item>
            );
          }}
          size="small"
        />
      </Card>

      {/* Scheduling form */}
      {currentConsultationStudent && (
        <Form
          form={consultationForm}
          layout="vertical"
          onFinish={submitConsultationSchedule}
          onFinishFailed={(errorInfo) => {
            message.error('Vui lòng kiểm tra lại thông tin trong form');
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="scheduledDate"
                label="Ngày và giờ tư vấn"
                rules={[{ required: true, message: 'Vui lòng chọn ngày tư vấn' }]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày và giờ"
                  disabledDate={(current) => {
                    if (!current) return false;
                    const today = moment().startOf('day');
                    const currentMoment = moment(current.toDate());
                    return currentMoment.isBefore(today);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Thời gian (phút)"
                rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
                initialValue={30}
              >
                <InputNumber
                  min={15}
                  max={120}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Ghi chú cho buổi tư vấn">
            <TextArea
              rows={3}
              placeholder="Nhập ghi chú cho buổi tư vấn (tùy chọn)"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CalendarOutlined />}
                loading={loading}
                disabled={!currentConsultationStudent?.parentId}
              >
                Đặt lịch cho {currentConsultationStudent?.studentName || 'học sinh'}
              </Button>

              {/* Auto-select next student */}
              {(() => {
                const nextStudent = getNextUnscheduledStudent();
                return nextStudent && (
                  <Button
                    onClick={() => selectStudentForConsultation(nextStudent)}
                    disabled={loading}
                  >
                    Chuyển sang học sinh tiếp theo
                  </Button>
                );
              })()}
            </Space>
          </Form.Item>

          {!currentConsultationStudent.parentId && (
            <Alert
              message="Không thể đặt lịch"
              description="Học sinh này không có thông tin phụ huynh. Vui lòng bỏ qua hoặc cập nhật thông tin phụ huynh trước."
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Form>
      )}


        </div>
      </Modal>
    </div>
  );
};

export default CampaignsPage;
