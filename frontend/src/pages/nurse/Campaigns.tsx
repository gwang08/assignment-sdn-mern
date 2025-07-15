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
  ExclamationCircleOutlined,
  CloseOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { nurseService } from '../../services/api';
import { Campaign, CampaignConsent, CampaignResult } from '../../types';
import dayjs from 'dayjs';
import { Table as AntTable } from 'antd';
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
  const requiresConsent = Form.useWatch('requires_consent', form);
  const dateRange = Form.useWatch('date_range', form);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [isConsultationScheduleModalVisible, setIsConsultationScheduleModalVisible] = useState(false);
  const [consultationSchedules, setConsultationSchedules] = useState<any[]>([]);
  const [consultationProgress, setConsultationProgress] = useState<{ [key: string]: { completed: number, total: number, percentage: number } }>({});
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
      loadAvailableClasses(true);
    };
    loadData();
  }, []);

  const handleViewConsultationSchedules = async (campaign: Campaign) => {
  setSelectedCampaign(campaign);
  setIsConsultationScheduleModalVisible(true);
  setLoading(true);
  try {
    const res = await nurseService.getConsultationSchedules();
    let data = Array.isArray(res) ? res : res?.data || [];
    data = data.filter((item: any) => {
      if (item.campaignResult && typeof item.campaignResult === 'object' && item.campaignResult.campaign) {
        return (typeof item.campaignResult.campaign === 'object'
          ? item.campaignResult.campaign._id
          : item.campaignResult.campaign) === campaign._id;
      }
      return false;
    });
    // Thêm status mặc định là 'SCHEDULED' nếu không có
    data = data.map((item: any) => {
  const finalStatus = item.status || 'SCHEDULED';
  console.log(`[DEBUG] Consultation ${item._id} => status: ${finalStatus}`);
  return {
    ...item,
    status: finalStatus,
  };
});
    console.log('Consultation Schedules Data:', data); // Kiểm tra dữ liệu đã cập nhật
    setConsultationSchedules(data);
  } catch (e) {
    setConsultationSchedules([]);
    console.error('Error fetching consultation schedules:', e);
  }
  setLoading(false);
};

  const loadAvailableClasses = async (silent = false) => {
    try {
      setLoadingClasses(true);
      const response = await nurseService.getStudents();
      if (response.success && response.data) {
        const classNames = Array.from(new Set(response.data.map((student: any) => student.class_name))).filter(Boolean);
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
        setAvailableClasses(['10A1', '10A2', '11B1', '11B2', '12C1', '12C2']);
        if (!silent) {
          message.warning('Không thể tải danh sách lớp, sử dụng danh sách mặc định');
        }
      }
    } catch (error) {
      setAvailableClasses(['10A1', '10A2', '11B1', '11B2', '12C1', '12C2']);
      if (!silent) {
        message.error('Có lỗi khi tải danh sách lớp, sử dụng danh sách mặc định');
      }
    } finally {
      setLoadingClasses(false);
    }
  };

  const getTargetClassOptions = () => {
  const options = [{ label: 'Tất cả các lớp', value: 'all_grades' }];
  
  // Nếu không có availableClasses thì chỉ trả về option "Tất cả các lớp"
  if (availableClasses.length === 0) {
    return options;
  }

  // Thêm các khối lớp
  const grades = Array.from(new Set(availableClasses.map(className => {
    const match = className.match(/^(\d+)/);
    return match ? match[1] : null;
  }).filter(Boolean)));
  
  grades.sort().forEach(grade => {
    options.push({ label: `Khối ${grade}`, value: `grade_${grade}` });
  });

  // Thêm các lớp cụ thể
  availableClasses.forEach(className => {
    options.push({ label: `Lớp ${className}`, value: className });
  });

  return options;
};

// Thêm hàm kiểm tra xem có chọn "Tất cả các lớp" không
const hasAllGradesSelected = (values: any) => {
  return values?.target_classes?.includes('all_grades');
};

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await nurseService.getHealthCheckCampaigns();
      if (response.success && response.data) {
        setCampaigns(response.data);
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
        setConsents([]);
      }
      if (resultsResponse.success && resultsResponse.data) {
        setResults(resultsResponse.data);
      } else {
        setResults([]);
      }
    } catch (error) {
      setConsents([]);
      setResults([]);
      message.error('Có lỗi xảy ra khi tải chi tiết chiến dịch');
    }
  };

  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [cancelForm] = Form.useForm();

  const handleCancelConsultation = (consultationId: string) => {
    setSelectedConsultationId(consultationId);
    setIsCancelModalVisible(true);
  };

  const handleCompleteConsultation = async (consultationId: string) => {
  try {
    const response = await nurseService.completeConsultationSchedule(consultationId);
    if (response.success) {
      notification.success({
        message: 'Thành công',
        description: 'Đã hoàn thành lịch tư vấn.',
      });
      // Làm mới danh sách lịch tư vấn
      if (selectedCampaign) {
        const res = await nurseService.getConsultationSchedules();
        let data = Array.isArray(res) ? res : res?.data || [];
        data = data.filter((item: any) => {
          if (
            item.campaignResult &&
            typeof item.campaignResult === 'object' &&
            item.campaignResult.campaign
          ) {
            return (
              (typeof item.campaignResult.campaign === 'object'
                ? item.campaignResult.campaign._id
                : item.campaignResult.campaign) === selectedCampaign._id
            );
          }
          return false;
        });
        data = data.map((item: any) => ({
          ...item,
          status: item.status || 'Scheduled',
        }));
        setConsultationSchedules(data);
      }
    } else {
      notification.error({
        message: 'Lỗi',
        description: response.message || 'Có lỗi xảy ra khi hoàn thành lịch tư vấn.',
      });
    }
  } catch (error) {
    notification.error({
      message: 'Lỗi hệ thống',
      description: 'Có lỗi xảy ra khi kết nối với máy chủ.',
    });
  }
};

  const handleSubmitCancel = async (values: { cancelReason: string }) => {
  if (!selectedConsultationId) return;

  try {
    const response = await nurseService.cancelConsultationSchedule(selectedConsultationId, {
      cancelReason: values.cancelReason,
    });

    if (response.success) {
      notification.success({
        message: 'Thành công',
        description: 'Đã hủy lịch tư vấn thành công.',
      });
      setIsCancelModalVisible(false);
      cancelForm.resetFields();

      // ✅ Làm mới danh sách lịch tư vấn
      if (selectedCampaign) {
        const res = await nurseService.getConsultationSchedules();
        let data = Array.isArray(res) ? res : res?.data || [];

        data = data.filter((item: any) => {
          if (
            item.campaignResult &&
            typeof item.campaignResult === 'object' &&
            item.campaignResult.campaign
          ) {
            return (
              (typeof item.campaignResult.campaign === 'object'
                ? item.campaignResult.campaign._id
                : item.campaignResult.campaign) === selectedCampaign._id
            );
          }
          return false;
        });

        // ✅ Normalize status nếu thiếu
        data = data.map((item: any) => ({
          ...item,
          status: item.status || 'Scheduled',
        }));

        setConsultationSchedules(data);
      }
    } else {
      notification.error({
        message: 'Lỗi',
        description: response.message || 'Có lỗi xảy ra khi hủy lịch tư vấn.',
      });
    }
  } catch (error) {
    notification.error({
      message: 'Lỗi hệ thống',
      description: 'Có lỗi xảy ra khi kết nối với máy chủ.',
    });
  }
};


  const handleCreateCampaign = () => {
  console.log('⚠️ Create campaign: reset form');
  form.resetFields();
  setEditingCampaign(null);
  setIsModalVisible(true);
    setTimeout(() => {
  console.log('🔥 setFieldsValue from edit campaign', campaigns);
      form.setFieldsValue({
        campaign_type: 'health_check',
        status: 'draft',
        requires_consent: true,
        target_classes: [],
        date_range: [dayjs().add(1, 'day'), dayjs().add(7, 'days')]
      });
    }, 0);
  };

  const handleEditCampaign = (campaign: Campaign) => {
  setEditingCampaign(campaign);
  setIsModalVisible(true); // 👉 Hiển thị modal trước

  setTimeout(() => {
    const options = getTargetClassOptions();
    const normalizedTargetClasses = campaign.target_classes?.map(group => {
      const option = options.find(opt => opt.label === group);
      return option ? option.value : group;
    });

    form.setFieldsValue({
      ...campaign,
      date_range: campaign.start_date && campaign.end_date
        ? [dayjs(campaign.start_date), dayjs(campaign.end_date)]
        : undefined,
      consent_deadline: campaign.consent_deadline ? dayjs(campaign.consent_deadline) : undefined,
      target_classes: normalizedTargetClasses || campaign.target_classes
    });

    form.validateFields(['consent_deadline']);
  }, 0); // Đợi Form được render xong
};


  const handleViewCampaign = async (campaign: Campaign) => {
  setSelectedCampaign(campaign);
  await loadCampaignDetails(campaign._id);
  await form.validateFields();
  setActiveTab('info'); // Đặt tab mặc định là 'Thông tin chung'
  setIsDetailDrawerVisible(true);
};

  const handleSubmit = async (values: any) => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      if (!values.date_range || values.date_range.length !== 2) {
        message.error('Vui lòng chọn khoảng thời gian hợp lệ');
        return;
      }
      if (!editingCampaign && values.date_range[0].isBefore(moment().startOf('day'))) {
        message.error('Ngày bắt đầu không thể là ngày trong quá khứ');
        return;
      }
      if (values.date_range[1].isBefore(values.date_range[0])) {
        message.error('Ngày kết thúc phải sau ngày bắt đầu');
        return;
      }
      const campaignData = {
        ...values,
        start_date: values.date_range[0].toDate(),
        end_date: values.date_range[1].toDate(),
        campaign_type: values.campaign_type || 'health_check',
        requires_consent: values.requires_consent !== false,
        status: values.status || 'draft'
      };
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
        await loadCampaigns();
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
  render: (groups: string[]) => {
    const options = getTargetClassOptions();
    return (
      <div>
        {groups?.map((group: string) => {
          const option = options.find(opt => opt.value === group);
          return (
            <Tag key={group} color="default">
              {option ? option.label : group}
            </Tag>
          );
        })}
      </div>
    );
  },
},
    
    {
  title: 'Thao tác',
  key: 'actions',
  render: (_, record: Campaign) => {
    const isDraft = record.status === 'draft';
    const progress = consultationProgress[record._id] || { total: 0 }; // Lấy progress, mặc định total = 0 nếu chưa có
    const isNoConsultationNeeded = progress.total === 0; // Kiểm tra không có ai cần tư vấn

    return (
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
        {!isDraft && (
          <Space wrap>
            <Button
              icon={<UserOutlined />}
              onClick={() => handlePrepareStudentList(record)}
              title="Danh sách học sinh"
              size="small"
            >
              DS HS
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => handleRecordExamResults(record)}
              title="Ghi kết quả khám"
              size="small"
            >
              Ghi KQ
            </Button>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => handleSendResultsAndSchedule(record)}
              title="Gửi KQ & đặt lịch"
              size="small"
              type="primary"
              disabled={isNoConsultationNeeded} // Vô hiệu hóa nếu không có ai cần tư vấn
            >
              Gửi & Hẹn
            </Button>
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewConsultationSchedules(record)}
              title="Xem lịch tư vấn"
              size="small"
              style={{ marginLeft: 4 }}
            >
              Xem lịch tư vấn
            </Button>
          </Space>
        )}
      </Space>
    );
  },
},
  ];

  const calculateProgress = (campaign: Campaign) => {
    if (!consents.length || !eligibleStudents.length) return 0;
    const approvedConsents = consents.filter(c => c.status === 'Approved').length;
    return Math.round((approvedConsents / eligibleStudents.length) * 100);
  };

  const calculateConsultationProgress = async (campaignId: string) => {
    try {
      const [resultsResponse, consultationResponse] = await Promise.all([
        nurseService.getCampaignResults(campaignId),
        nurseService.getConsultationSchedules()
      ]);
      if (!resultsResponse.success || !resultsResponse.data) {
        return { completed: 0, total: 0, percentage: 0 };
      }
      let consultationData: any[] = [];
      if (Array.isArray(consultationResponse)) {
        consultationData = consultationResponse;
      } else if (consultationResponse && consultationResponse.data) {
        consultationData = consultationResponse.data;
      } else if (consultationResponse && consultationResponse.success && consultationResponse.data) {
        consultationData = consultationResponse.data;
      }
      if (!Array.isArray(consultationData)) {
        consultationData = [];
      }
      const abnormalResults = resultsResponse.data.filter((result: any) =>
        result.checkupDetails && result.checkupDetails.requiresConsultation
      );
      if (abnormalResults.length === 0) {
        return { completed: 0, total: 0, percentage: 100 };
      }
      let scheduledStudentIds = new Set();
      const resultIdToStudentId = new Map();
      abnormalResults.forEach((result: any) => {
        const studentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
        resultIdToStudentId.set(result._id, studentId);
      });
      consultationData.forEach((consultation: any) => {
        let belongsToCurrentCampaign = false;
        let campaignResultId = null;
        let consultationStudentId: string | null = null;
        if (consultation.student) {
          if (typeof consultation.student === 'object' && consultation.student._id) {
            consultationStudentId = consultation.student._id;
          } else if (typeof consultation.student === 'string') {
            consultationStudentId = consultation.student;
          }
        }
        if (consultation.campaignResult && typeof consultation.campaignResult === 'object') {
          campaignResultId = consultation.campaignResult._id;
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
          if (!belongsToCurrentCampaign && campaignResultId && resultIdToStudentId.has(campaignResultId)) {
            belongsToCurrentCampaign = true;
          }
        }
        if (!belongsToCurrentCampaign && consultation.campaignResult && typeof consultation.campaignResult === 'string') {
          campaignResultId = consultation.campaignResult;
          if (resultIdToStudentId.has(campaignResultId)) {
            belongsToCurrentCampaign = true;
          }
        }
        if (!belongsToCurrentCampaign && consultationStudentId) {
          const matchingResult = abnormalResults.find((result: any) => {
            const resultStudentId = typeof result.student === 'object' ? result.student._id : result.student;
            return resultStudentId === consultationStudentId;
          });
          if (matchingResult) {
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
        if (belongsToCurrentCampaign && consultationStudentId) {
          scheduledStudentIds.add(consultationStudentId);
        }
      });
      const scheduledCount = abnormalResults.filter((result: any) => {
        const studentId = typeof result.student === 'object'
          ? (result.student as any)._id
          : result.student;
        return scheduledStudentIds.has(studentId);
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

  const handlePrepareStudentList = async (campaign: Campaign) => {
    setIsStudentListModalVisible(true);
    try {
      setSelectedCampaign(campaign);
      setLoading(true);
      const [studentsResponse, consentsResponse] = await Promise.all([
        nurseService.getStudents(),
        nurseService.getCampaignConsents(campaign._id)
      ]);
      if (studentsResponse.success && studentsResponse.data) {
        const allStudents = studentsResponse.data.filter((student: any) => {
          if (campaign.target_classes?.includes('all_grades')) {
            return true;
          }
          if (campaign.target_classes?.includes(student.class_name)) {
            return true;
          }
          const studentGrade = student.class_name?.substring(0, 2);
          const gradeTarget = `grade_${studentGrade}`;
          if (campaign.target_classes?.includes(gradeTarget)) {
            return true;
          }
          return false;
        });
        let consentData: any[] = [];
        if (consentsResponse.success && consentsResponse.data) {
          consentData = consentsResponse.data;
        }
        const studentsWithConsentStatus = allStudents.map((student: any) => {
          let consentStatus = 'none';
          if (campaign.requires_consent) {
            const consent = consentData.find((c: any) => {
              const studentId = typeof c.student === 'object' ? c.student._id : c.student;
              return studentId === student._id;
            });
            if (consent) {
              consentStatus = consent.status === 'Approved' ? 'approved' :
                consent.status === 'Declined' ? 'declined' : 'pending';
            } else {
              consentStatus = 'pending';
            }
          } else {
            consentStatus = 'approved';
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

  const handleRecordExamResults = async (campaign: Campaign) => {
  setIsExamResultModalVisible(true);
  try {
    setSelectedCampaign(campaign);
    setLoading(true);
    const [studentsResponse, resultsResponse, consentsResponse] = await Promise.all([
      nurseService.getStudents(),
      nurseService.getCampaignResults(campaign._id),
      nurseService.getCampaignConsents(campaign._id)
    ]);

    // Kiểm tra dữ liệu API
    if (!studentsResponse.success || !studentsResponse.data) {
      message.error('Không thể tải danh sách học sinh từ hệ thống');
      setEligibleStudents([]);
      return;
    }

    // Lấy danh sách học sinh
    const allStudents = studentsResponse.data.filter((student: any) => {
      // Kiểm tra class_name có tồn tại
      if (!student.class_name) {
        console.warn(`Học sinh ${student._id} không có class_name`);
        return false;
      }

      // Xử lý target_classes linh hoạt
      if (campaign.target_classes?.includes('all_grades')) {
        return true;
      }
      if (campaign.target_classes?.includes(student.class_name)) {
        return true;
      }

      // Lấy khối lớp bằng regex
      const gradeMatch = student.class_name.match(/^(\d+)/);
      const studentGrade = gradeMatch ? gradeMatch[1] : null;
      if (studentGrade) {
        const gradeTarget = `grade_${studentGrade}`;
        if (campaign.target_classes?.includes(gradeTarget)) {
          return true;
        }
      }

      return false;
    });

    // Kiểm tra danh sách học sinh
    console.log('Danh sách học sinh đủ điều kiện:', allStudents.length, allStudents);

    // Lấy dữ liệu đồng ý
    let consentData: any[] = [];
    if (consentsResponse.success && consentsResponse.data) {
      consentData = consentsResponse.data;
    } else {
      console.warn('Không lấy được dữ liệu đồng ý, sử dụng mặc định rỗng');
    }

    // Lọc học sinh được phụ huynh đồng ý
    const approvedStudents = allStudents.filter((student: any) => {
      if (!campaign.requires_consent) {
        return true;
      }
      const consent = consentData.find((c: any) => {
        const studentId = typeof c.student === 'object' ? c.student._id : c.student;
        return studentId === student._id;
      });
      return consent && consent.status === 'Approved';
    });

    console.log('Học sinh được phụ huynh đồng ý:', approvedStudents.length, approvedStudents);

    // Lọc học sinh chưa khám
    const examinedStudentIds = new Set();
    if (resultsResponse.success && resultsResponse.data) {
      resultsResponse.data.forEach((result: CampaignResult) => {
        const studentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
        examinedStudentIds.add(studentId);
      });
    }

    const unexaminedApprovedStudents = approvedStudents.filter((student: any) =>
      !examinedStudentIds.has(student._id)
    );

    console.log('Học sinh chưa khám:', unexaminedApprovedStudents.length, unexaminedApprovedStudents);

    // Cập nhật state
    setEligibleStudents(unexaminedApprovedStudents);
    setIsExamResultModalVisible(true);

    // Thông báo kết quả
    if (unexaminedApprovedStudents.length === 0) {
      if (approvedStudents.length === 0) {
        message.info('Chưa có học sinh nào được phụ huynh đồng ý tham gia khám');
      } else {
        message.info('Tất cả học sinh đã được phụ huynh đồng ý đều đã được khám');
      }
    } else {
      message.success(`Còn ${unexaminedApprovedStudents.length} học sinh đã được đồng ý chưa được khám`);
    }
  } catch (error) {
    console.error('Lỗi khi tải danh sách học sinh:', error);
    message.error('Có lỗi xảy ra khi tải danh sách học sinh');
    setEligibleStudents([]);
  } finally {
    setLoading(false);
  }
};

  const handleSendResultsAndSchedule = async (campaign: Campaign) => {
  setSelectedCampaign(campaign);
  try {
    setLoading(true);
    const [resultsResponse, relationsResponse] = await Promise.all([
      nurseService.getCampaignResults(campaign._id),
      nurseService.getStudentParentRelations()
    ]);
    if (!resultsResponse.success || !resultsResponse.data) {
      message.error('Không thể tải kết quả khám');
      return;
    }
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
    const abnormalResults = resultsResponse.data.filter((result: CampaignResult) =>
      result.checkupDetails && result.checkupDetails.requiresConsultation
    );
    if (abnormalResults.length === 0) {
      notification.success({
        message: 'Thành công',
        description: 'Không có học sinh nào cần tư vấn. Đã gửi kết quả cho phụ huynh.',
      });
      return; // Thoát hàm nếu không có ai cần tư vấn
    }
    // Tiếp tục xử lý nếu có học sinh cần tư vấn
    let existingConsultations: any[] = [];
    try {
      const consultationResponse = await nurseService.getConsultationSchedules();
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
    } catch (error) {}
    const resultIdToStudentId = new Map();
    abnormalResults.forEach((result: CampaignResult) => {
      const studentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
      resultIdToStudentId.set(result._id, studentId);
    });
    const studentsWithConsultations = new Set();
    existingConsultations.forEach((consultation: any) => {
      let belongsToCurrentCampaign = false;
      let campaignResultId = null;
      let consultationStudentId: string | null = null;
      if (consultation.student) {
        if (typeof consultation.student === 'object' && consultation.student._id) {
          consultationStudentId = consultation.student._id;
        } else if (typeof consultation.student === 'string') {
          consultationStudentId = consultation.student;
        }
      }
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
      }
      if (!belongsToCurrentCampaign && consultation.campaignResult && typeof consultation.campaignResult === 'string') {
        campaignResultId = consultation.campaignResult;
        if (resultIdToStudentId.has(campaignResultId)) {
          belongsToCurrentCampaign = true;
        }
      }
      if (!belongsToCurrentCampaign && consultationStudentId) {
        const matchingResult = abnormalResults.find((result: CampaignResult) => {
          const resultStudentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
          return resultStudentId === consultationStudentId;
        });
        if (matchingResult) {
          belongsToCurrentCampaign = true;
        }
      }
      if (belongsToCurrentCampaign && consultationStudentId) {
        studentsWithConsultations.add(consultationStudentId);
      }
    });
    const scheduledResultIds = new Set();
    existingConsultations.forEach((consultation: any) => {
      let campaignResultId = null;
      if (consultation.campaignResult && typeof consultation.campaignResult === 'object') {
        campaignResultId = consultation.campaignResult._id;
      } else if (typeof consultation.campaignResult === 'string') {
        campaignResultId = consultation.campaignResult;
      }
      if (campaignResultId) {
        scheduledResultIds.add(campaignResultId);
      }
    });
    const unscheduledAbnormalResults = abnormalResults.filter((result: CampaignResult) => {
      return !scheduledResultIds.has(result._id);
    });
    const existingConsultationsForCampaign = existingConsultations.filter((consultation: any) => {
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
    const studentsNeedingConsultation: Array<{ 
      studentId: string; 
      studentName: string; 
      reason: string; 
      isScheduled: boolean;
      parentId?: string;
      parentName?: string;
      resultId?: string;
    }> = [];
    unscheduledAbnormalResults.forEach((result: CampaignResult) => {
      const studentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
      const studentName = typeof result.student === 'object'
        ? `${(result.student as any).first_name || ''} ${(result.student as any).last_name || ''}`.trim()
        : 'Unknown Student';
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
      alreadyScheduled: 0,
      needsScheduling: studentsNeedingConsultation.length
    });
    setIsConsultationModalVisible(true);
  } catch (error) {
    message.error('Có lỗi xảy ra khi xử lý kết quả khám');
  } finally {
    setLoading(false);
  }
  
};

  const reloadConsultationCandidates = async () => {
    if (!selectedCampaign) return;
    try {
      const [resultsResponse, relationsResponse] = await Promise.all([
        nurseService.getCampaignResults(selectedCampaign._id),
        nurseService.getStudentParentRelations()
      ]);
      if (!resultsResponse.success || !resultsResponse.data) {
        return;
      }
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
      const abnormalResults = resultsResponse.data.filter((result: CampaignResult) =>
        result.checkupDetails && result.checkupDetails.requiresConsultation
      );
      if (abnormalResults.length > 0) {
        let existingConsultations: any[] = [];
        try {
          const consultationResponse = await nurseService.getConsultationSchedules();
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
        } catch (error) {}
        const resultIdToStudentId = new Map();
        abnormalResults.forEach((result: CampaignResult) => {
          const studentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
          resultIdToStudentId.set(result._id, studentId);
        });
        const studentsWithConsultations = new Set();
        existingConsultations.forEach((consultation: any) => {
          let belongsToCurrentCampaign = false;
          let campaignResultId = null;
          let consultationStudentId: string | null = null;
          if (consultation.student) {
            if (typeof consultation.student === 'object' && consultation.student._id) {
              consultationStudentId = consultation.student._id;
            } else if (typeof consultation.student === 'string') {
              consultationStudentId = consultation.student;
            }
          }
          if (consultation.campaignResult && typeof consultation.campaignResult === 'object') {
            campaignResultId = consultation.campaignResult._id;
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
            if (!belongsToCurrentCampaign && campaignResultId && resultIdToStudentId.has(campaignResultId)) {
              belongsToCurrentCampaign = true;
            }
          }
          if (!belongsToCurrentCampaign && consultation.campaignResult && typeof consultation.campaignResult === 'string') {
            campaignResultId = consultation.campaignResult;
            if (resultIdToStudentId.has(campaignResultId)) {
              belongsToCurrentCampaign = true;
            }
          }
          if (!belongsToCurrentCampaign && consultationStudentId) {
            const matchingResult = abnormalResults.find((result: CampaignResult) => {
              const resultStudentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
              return resultStudentId === consultationStudentId;
            });
            if (matchingResult) {
              belongsToCurrentCampaign = true;
            }
          }
          if (belongsToCurrentCampaign && consultationStudentId) {
            studentsWithConsultations.add(consultationStudentId);
          }
        });
        const scheduledResultIds = new Set();
        existingConsultations.forEach((consultation: any) => {
          let campaignResultId = null;
          if (consultation.campaignResult && typeof consultation.campaignResult === 'object') {
            campaignResultId = consultation.campaignResult._id;
          } else if (typeof consultation.campaignResult === 'string') {
            campaignResultId = consultation.campaignResult;
          }
          if (campaignResultId) {
            scheduledResultIds.add(campaignResultId);
          }
        });
        const unscheduledAbnormalResults = abnormalResults.filter((result: CampaignResult) => {
          return !scheduledResultIds.has(result._id);
        });
        const studentsNeedingConsultation: Array<{ 
          studentId: string; 
          studentName: string; 
          reason: string; 
          isScheduled: boolean;
          parentId?: string;
          parentName?: string;
          resultId?: string;
        }> = [];
        unscheduledAbnormalResults.forEach((result: CampaignResult) => {
          const studentId = typeof result.student === 'object' ? (result.student as any)._id : result.student;
          const studentName = typeof result.student === 'object'
            ? `${(result.student as any).first_name || ''} ${(result.student as any).last_name || ''}`.trim()
            : 'Unknown Student';
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
          alreadyScheduled: 0,
          needsScheduling: studentsNeedingConsultation.length
        });
      } else {
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
  if (!selectedCampaign) {
    message.error('Không tìm thấy thông tin chiến dịch hoặc học sinh. Vui lòng chọn học sinh trước khi đặt lịch.');
    return;
  }
  if (!currentConsultationStudent) {
    message.error('Không tìm thấy thông tin học sinh. Vui lòng chọn học sinh trước khi đặt lịch.');
    return;
  }
  try {
    setLoading(true);
    console.log('[DEBUG] currentConsultationStudent:', currentConsultationStudent);
    console.log('[DEBUG] values:', values);

    if (!currentConsultationStudent.parentId) {
      message.error('Học sinh này không có thông tin phụ huynh. Không thể đặt lịch tư vấn.');
      return;
    }
    if (!values.scheduledDate) {
      message.error('Vui lòng chọn ngày và giờ tư vấn');
      return;
    }
    try {
      const shouldCancelBooking = await checkForOverlappingConsultations(values.scheduledDate, values.duration || 30);
      if (shouldCancelBooking) {
        return;
      }
    } catch (error) {
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
    console.log('[DEBUG] scheduleData gửi API:', scheduleData); // Log dữ liệu gửi đi
    const response = await nurseService.createConsultationSchedule(scheduleData);
    if (response.success) {
  // Hiển thị thông báo thành công
  message.success('Đặt lịch tư vấn thành công!');

  // Reset form
  consultationForm.resetFields();

  // Cập nhật danh sách học sinh cần đặt lịch (ẩn học sinh vừa đặt)
  const updatedCandidates = consultationCandidates.filter(
    c => c.studentId !== currentConsultationStudent.studentId
  );
  setConsultationCandidates(updatedCandidates);

  // Cập nhật danh sách học sinh đã đặt lịch
  setScheduledStudents(prev => [...prev, currentConsultationStudent.studentId]);

  // Cập nhật thống kê
  setConsultationStats(prev => ({
    ...prev,
    needsScheduling: prev.needsScheduling - 1,
    alreadyScheduled: prev.alreadyScheduled + 1
  }));

  // Nếu không còn học sinh nào, đóng modal
  if (updatedCandidates.length === 0) {
    setIsConsultationModalVisible(false);
    setCurrentConsultationStudent(null);
    setConsultationCandidates([]);
    setScheduledStudents([]);
    setConsultationStats({ totalAbnormal: 0, alreadyScheduled: 0, needsScheduling: 0 });
    message.success('Đã hoàn tất đặt lịch cho tất cả học sinh cần tư vấn!');
  } 
  else {
    // Chọn học sinh tiếp theo
    const nextStudent = getNextUnscheduledStudent();
    if (nextStudent) {
      setCurrentConsultationStudent(nextStudent);
      consultationForm.setFieldsValue({
        duration: 30
      });
    }
  }
} else {
  message.error(response.message || 'Có lỗi xảy ra khi đặt lịch tư vấn');
}
  } catch (error) {
    console.error('[ERROR] submitConsultationSchedule:', error); // Log lỗi chi tiết
    message.error('Có lỗi xảy ra khi đặt lịch tư vấn');
  } finally {
    setLoading(false);
  }
};

  const submitNotification = async (values: any) => {
    try {
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
      const response = await nurseService.submitCampaignResult(resultData);
      if (response.success) {
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
        setIsExamResultModalVisible(false);
        if (selectedCampaign) {
          loadCampaignDetails(selectedCampaign._id);
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

  const selectStudentForConsultation = (candidate: any) => {
    setCurrentConsultationStudent(candidate);
    consultationForm.resetFields();
    consultationForm.setFieldsValue({
      duration: 30
    });
  };

  const getNextUnscheduledStudent = () => {
    return consultationCandidates.find(c =>
      !scheduledStudents.includes(c.studentId) && (!currentConsultationStudent || c.studentId !== currentConsultationStudent.studentId)
    );
  };

  const checkForOverlappingConsultations = async (newScheduledDate: moment.Moment, newDuration: number): Promise<boolean> => {
    try {
      const response = await nurseService.checkConsultationOverlap({
        scheduledDate: newScheduledDate.toISOString(),
        duration: newDuration
      });
      if (response.success && response.data && response.data.hasOverlap) {
        const conflict = response.data.conflictingConsultation;
        let conflictStudentName = 'Không xác định';
        if (conflict?.student) {
          if (typeof conflict.student === 'object' && conflict.student.first_name && conflict.student.last_name) {
            conflictStudentName = `${conflict.student.first_name} ${conflict.student.last_name}`;
          } else if (typeof conflict.student === 'string') {
            conflictStudentName = conflict.student;
          }
        }
        message.error({
          content: `🚫 Trùng lịch tư vấn với học sinh ${conflictStudentName} vào ${moment(conflict?.scheduledDate).format('DD/MM/YYYY HH:mm')}. Vui lòng chọn thời gian khác!`,
          duration: 8
        });
        window.alert(
          `⚠️ PHÁT HIỆN TRÙNG LỊCH TƯ VẤN!\n\n` +
          `🔸 Học sinh hiện có: ${conflictStudentName}\n` +
          `🔸 Thời gian đã đặt: ${moment(conflict?.scheduledDate).format('DD/MM/YYYY HH:mm')} - ${moment(conflict?.scheduledDate).add(conflict?.duration || 30, 'minutes').format('HH:mm')}\n` +
          `🔸 Thời gian bạn chọn: ${newScheduledDate.format('DD/MM/YYYY HH:mm')} - ${moment(newScheduledDate).add(newDuration, 'minutes').format('HH:mm')}\n\n` +
          `❌ Không thể đặt lịch trùng với lịch hiện có.\n` +
          `💡 Vui lòng chọn thời gian khác để tránh xung đột!`
        );
        const userChoice = false;
        message.info({
          content: '✅ Đã hủy đặt lịch do trùng thời gian. Vui lòng chọn thời gian khác.',
          duration: 6
        });
        return true;
      }
      return false;
    } catch (error) {
      message.warning({
        content: 'Không thể kiểm tra trùng lịch với máy chủ. Vui lòng kiểm tra thủ công trước khi đặt lịch.',
        duration: 6
      });
      return false;
    }
  };

  // Modal hủy lịch tư vấn
  const CancelModal = () => (
    <Modal
      title="Hủy lịch tư vấn"
      open={isCancelModalVisible}
      onCancel={() => {
        setIsCancelModalVisible(false);
        cancelForm.resetFields();
        setSelectedConsultationId(null);
      }}
      footer={null}
      width={400}
    >
      <Form
        form={cancelForm}
        layout="vertical"
        onFinish={handleSubmitCancel}
      >
        <Form.Item
          name="cancelReason"
          label="Lý do hủy"
          rules={[{ required: true, message: 'Vui lòng nhập lý do hủy' }]}
        >
          <Input.TextArea rows={3} placeholder="Nhập lý do hủy lịch tư vấn" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" danger>
              Xác nhận hủy
            </Button>
            <Button
              onClick={() => {
                setIsCancelModalVisible(false);
                cancelForm.resetFields();
                setSelectedConsultationId(null);
              }}
            >
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

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
          validateTrigger="onSubmit"
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
                      if (value[0].isBefore(dayjs().startOf('day').add(1, 'day'))) {
                        return Promise.reject(new Error('Ngày bắt đầu phải từ ngày mai trở đi'));
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
                    return current && current < dayjs().startOf('day').add(1, 'day');
                  }}
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
                  {editingCampaign ? (
                    <>
                      <Option value="active">Đang tiến hành</Option>
                      <Option value="completed">Hoàn thành</Option>
                      <Option value="cancelled">Hủy</Option>
                    </>
                  ) : (
                    <Option value="active">Tiến hành</Option>
                  )}
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
        if (value.includes('all_grades') && value.length > 1) {
          return Promise.reject(new Error('Khi chọn "Tất cả các lớp" thì không cần chọn thêm lớp nào khác'));
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
    dropdownRender={(menu) => (
      <div>
        {menu}
        <Divider style={{ margin: '4px 0' }} />
        <div style={{ padding: '4px 8px', color: '#999' }}>
          {hasAllGradesSelected(form.getFieldsValue()) ? (
            <Text type="secondary">Đã chọn tất cả các lớp - các lựa chọn khác sẽ bị bỏ qua</Text>
          ) : (
            <Text type="secondary">Chọn "Tất cả các lớp" để bao gồm tất cả học sinh</Text>
          )}
        </div>
      </div>
    )}
    onChange={(value) => {
      // Nếu chọn "Tất cả các lớp" thì xóa các lựa chọn khác
      if (value.includes('all_grades')) {
        form.setFieldsValue({ target_classes: ['all_grades'] });
      }
    }}
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
                dependencies={['requires_consent', 'date_range']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const requiresConsent = getFieldValue('requires_consent');
                      const range = getFieldValue('date_range');
                      if (!requiresConsent) return Promise.resolve();
                      if (!value) {
                        return Promise.reject(new Error('Vui lòng chọn hạn cuối đồng ý'));
                      }
                      if (value.isBefore(dayjs().startOf('day'))) {
                        return Promise.reject(new Error('Hạn cuối đồng ý không được trước ngày hiện tại'));
                      }
                      if (!range || range.length !== 2) {
                        return Promise.reject(new Error('Vui lòng chọn thời gian thực hiện trước'));
                      }
                      if (value.isSame(range[0], 'day') || value.isAfter(range[0])) {
                        return Promise.reject(new Error('Hạn cuối đồng ý phải trước ngày bắt đầu chiến dịch'));
                      }
                      return Promise.resolve();
                    }
                  })
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Chọn hạn cuối đồng ý"
                  disabled={form.getFieldValue('requires_consent') === false}
                  disabledDate={(current) => {
                    const range = form.getFieldValue('date_range');
                    if (range && range.length === 2) {
                      return current && (
                        current.isBefore(dayjs().startOf('day')) ||
                        current.isSame(range[0], 'day') ||
                        current.isAfter(range[0])
                      );
                    }
                    return current && current.isBefore(dayjs().startOf('day'));
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
            {selectedCampaign.target_classes?.includes('all_grades') ? (
              <Tag color="blue">Tất cả các lớp</Tag>
            ) : (
              selectedCampaign.target_classes?.map((group: string) => {
                const options = getTargetClassOptions();
                const option = options.find(opt => opt.value === group);
                return (
                  <Tag key={group} color="default">
                    {option ? option.label : group}
                  </Tag>
                );
              })
            )}
          </Descriptions.Item>
        </Descriptions>
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
                    initialValue={dayjs()}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      disabledDate={(current) => {
                        return current && current < dayjs().startOf('day');
                      }}
                    />
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
    showTime={{
      format: 'HH:mm',
      defaultValue: dayjs('09:00', 'HH:mm'),
    }}
    format="DD/MM/YYYY HH:mm"
    style={{ width: '100%' }}
    placeholder="Chọn ngày và giờ"
    disabledDate={(current) => {
      // Không cho chọn ngày trước hôm nay
      return current && current < dayjs().startOf('day');
    }}
    disabledTime={(current) => {
  if (!current) return {};

  const now = dayjs();
  const selectedDate = dayjs(current);

  if (selectedDate.isSame(now, 'day')) {
    const disabledHours = Array.from({ length: now.hour() }, (_, i) => i);
    const disabledMinutes = (selectedHour: number) =>
      selectedHour === now.hour()
        ? Array.from({ length: now.minute() }, (_, i) => i)
        : [];

    return {
      disabledHours: () => disabledHours,
      disabledMinutes,
    };
  }

  return {};
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
  Đặt lịch
</Button>

              
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
      <Modal
  title={`Lịch tư vấn - ${selectedCampaign?.title || ''}`}
  open={isConsultationScheduleModalVisible}
  onCancel={() => setIsConsultationScheduleModalVisible(false)}
  footer={null}
  width={700}
>
  <AntTable
    dataSource={consultationSchedules}
    rowKey="_id"
    columns={[
      {
        title: 'Học sinh',
        dataIndex: ['student', 'first_name'],
        render: (_, r) =>
          r.student
            ? `${r.student.first_name || ''} ${r.student.last_name || ''}`
            : 'N/A',
      },
      {
        title: 'Thời gian',
        dataIndex: 'scheduledDate',
        render: (d, r) =>
          `${moment(d).format('DD/MM/YYYY HH:mm')} - ${moment(d).add(r.duration || 30, 'minutes').format('HH:mm')}`,
      },
      {
        title: 'Phụ huynh',
        dataIndex: ['attending_parent', 'first_name'],
        render: (_, r) => {
          if (r.attending_parent && typeof r.attending_parent === 'object') {
            return `${r.attending_parent.first_name || ''} ${r.attending_parent.last_name || ''}`.trim() || 'N/A';
          }
          if (typeof r.attending_parent === 'string') {
            return r.attending_parent; // Hiển thị ID nếu không có object
          }
          return 'N/A';
        },
      },
      {
        title: 'Ghi chú',
        dataIndex: 'notes',
      },
    {
  title: 'Thao tác',
  key: 'actions',
  render: (_, record) => (
    <Space>
      {record.status === 'Scheduled' && (
        <>
          <Button
            size="small"
            type="primary"
            onClick={() => handleCompleteConsultation(record._id)}
            icon={<CheckCircleOutlined />}
          >
            Hoàn thành
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleCancelConsultation(record._id)}
            icon={<CloseOutlined />}
          >
            Hủy
          </Button>
        </>
      )}
      {record.status === 'Completed' && (
        <Tag color="green">Hoàn thành</Tag>
      )}
      {record.status === 'Cancelled' && (
        <Tag color="red">Đã hủy</Tag>
      )}
    </Space>
  ),
}
    ]}
    pagination={false}
    locale={{ emptyText: 'Chưa có lịch tư vấn nào cho chiến dịch này.' }}
  />
</Modal>

{/* Thêm modal hủy */}
      <CancelModal />
    </div>
  );
};

export default CampaignsPage;
