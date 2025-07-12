import React, { useState, useEffect } from 'react';
  import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Row,
    Col,
    Typography,
    Tabs,
    List,
    message,
    Descriptions,
    Progress,
    Alert,
    Checkbox,
    Popconfirm,
    Steps,
    Timeline,
    Statistic,
    Badge,
    Tooltip,
    notification,
    Drawer
  } from 'antd';
  import {
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    MedicineBoxOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    QuestionCircleOutlined,
    UserOutlined,
    WarningOutlined,
    SafetyOutlined,
    FileTextOutlined,
    CalendarOutlined,
    TeamOutlined
  } from '@ant-design/icons';
  import type { ColumnsType } from 'antd/es/table';
  import moment from 'moment';
  import apiService from '../../services/api';
  import { Campaign, CampaignConsent, CampaignResult, HealthProfile } from '../../types';
  import dayjs from 'dayjs';
  import { Collapse } from 'antd';

  const { Title, Text } = Typography;
  const { TextArea } = Input;
  const { Option } = Select;
  const { RangePicker } = DatePicker;
  const { TabPane } = Tabs;
  const { Step } = Steps;
  const { Panel } = Collapse;

  interface VaccinationRecord {
    _id: string;
    student: any;
    campaign: Campaign;
    vaccinated_at: string;
    vaccine_details: {
      brand: string;
      batch_number: string;
      dose_number: number;
      expiry_date: string;
    };
    vaccination_details?: {
      vaccinated_at: string;
      status: string;
      follow_up_required: boolean;
      side_effects: string[];
      follow_up_notes?: string; // Thêm thuộc tính này
    last_follow_up?: string;
    };
    administered_by: string;
    side_effects: string[];
    follow_up_required: boolean;
    follow_up_date?: string;
    notes: string;
    status: 'completed' | 'pending' | 'follow_up_needed';
  }

  interface VaccinationList {
    campaign: Campaign;
    eligible_students: any[];
    vaccinated_students: VaccinationRecord[];
    pending_students: any[];
    consent_summary: {
      total: number;
      approved: number;
      declined: number;
      pending: number;
    };
  }

  const VaccinationManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [vaccinationList, setVaccinationList] = useState<VaccinationList | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [medicalStaff, setMedicalStaff] = useState<any[]>([]);
    const [allVaccinationData, setAllVaccinationData] = useState<any[]>([]);
    const [consentData, setConsentData] = useState<any[]>([]);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [availableClasses, setAvailableClasses] = useState<string[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    
    
    // Modals
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isListModalVisible, setIsListModalVisible] = useState(false);
    const [isRecordModalVisible, setIsRecordModalVisible] = useState(false);
    const [isFollowUpModalVisible, setIsFollowUpModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    
    // Forms
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [recordForm] = Form.useForm();
    const [followUpForm] = Form.useForm();
    const [filterForm] = Form.useForm();
    const [filterValues, setFilterValues] = useState({
  searchName: '',
  className: [] as string[], // Sử dụng mảng cho className
  consentStatus: [] as string[], // Sử dụng mảng cho consentStatus
  vaccinationStatus: '',
  followUpRequired: '',
});

const handleFilter = (values: any) => {
  setFilterValues({
    searchName: values.searchName || '',
    className: values.className || [], // Lưu mảng giá trị
    consentStatus: values.consentStatus || [], // Lưu mảng giá trị
    vaccinationStatus: values.vaccinationStatus || '',
    followUpRequired: values.followUpRequired || '',
  });
};

const handleResetFilter = () => {
  filterForm.resetFields();
  setFilterValues({
    searchName: '',
   className: [] as string[], // Sử dụng mảng cho className
  consentStatus: [] as string[], // Sử dụng mảng cho consentStatus
    vaccinationStatus: '',
    followUpRequired: '',
  });
};

const filterStudents = (students: any[]) => {
  return students.filter((student) => {
    // Lọc theo tên
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    if (filterValues.searchName && !fullName.includes(filterValues.searchName.toLowerCase())) {
      return false;
    }

    // Lọc theo lớp (xử lý mảng)
    if (filterValues.className.length > 0 && !filterValues.className.includes(student.class_name)) {
      return false;
    }

    // Lọc theo trạng thái đồng ý (xử lý mảng)
    if (filterValues.consentStatus.length > 0) {
      const consent = consentData.find((c: any) => {
        const studentId = typeof c.student === 'object' ? c.student._id : c.student;
        return studentId === student._id;
      });
      const consentStatus = consent ? consent.status : 'no_response';
      if (!filterValues.consentStatus.includes(consentStatus)) {
        return false;
      }
    }

    // Lọc theo trạng thái tiêm chủng
    if (filterValues.vaccinationStatus) {
      const isVaccinated = vaccinationList?.vaccinated_students.find((v) => {
        const studentId = v.student?._id || v.student;
        return studentId === student._id;
      });
      if (filterValues.vaccinationStatus === 'vaccinated' && !isVaccinated) {
        return false;
      }
      if (filterValues.vaccinationStatus === 'not_vaccinated' && isVaccinated) {
        return false;
      }
    }

    // Lọc theo cần theo dõi
    if (filterValues.followUpRequired) {
      const vaccinationRecord = vaccinationList?.vaccinated_students.find((v) => {
        const studentId = v.student?._id || v.student;
        return studentId === student._id;
      });
      const followUpRequired = vaccinationRecord?.vaccination_details?.follow_up_required || vaccinationRecord?.follow_up_required;
      const hasFollowUpNotes = vaccinationRecord?.vaccination_details?.follow_up_notes;
      const lastFollowUp = vaccinationRecord?.vaccination_details?.last_follow_up;
      const isFollowUpCompleted = hasFollowUpNotes && lastFollowUp;

      if (filterValues.followUpRequired === 'yes' && (!followUpRequired || isFollowUpCompleted)) {
        return false;
      }
      if (filterValues.followUpRequired === 'no' && followUpRequired && !isFollowUpCompleted) {
        return false;
      }
    }

    return true;
  });
};
    
    // Current operations
    const [currentStudent, setCurrentStudent] = useState<any>(null);
    const [selectedVaccinationRecord, setSelectedVaccinationRecord] = useState<VaccinationRecord | null>(null);
    const [activeTab, setActiveTab] = useState('campaigns');

    useEffect(() => {
      if (editingCampaign) {
        editForm.setFieldsValue({
          title: editingCampaign.title || '',
          description: editingCampaign.description || '',
          date_range: editingCampaign.start_date && editingCampaign.end_date
            ? [dayjs(editingCampaign.start_date), dayjs(editingCampaign.end_date)]
            : [],
          consent_deadline: editingCampaign.consent_deadline ? dayjs(editingCampaign.consent_deadline) : null,
          target_classes: editingCampaign.target_classes || [],
          instructions: editingCampaign.instructions || '',
          vaccine_brand: editingCampaign.vaccineDetails?.brand || '',
          batch_number: editingCampaign.vaccineDetails?.batchNumber || '',
          dosage: editingCampaign.vaccineDetails?.dosage || '',
          status: editingCampaign.status || 'draft',
          campaign_type: editingCampaign.campaign_type || 'vaccination',
        });
      }
    }, [editingCampaign, editForm]);

    useEffect(() => {
      loadVaccinationCampaigns();
      loadMedicalStaff();
      loadAvailableClasses(true); // Pass true to indicate initial load (silent)
    }, []);

    useEffect(() => {
      if (campaigns.length > 0) {
        loadAllVaccinationStatistics();
      }
    }, [campaigns]);

    useEffect(() => {
      if (isFollowUpModalVisible && selectedVaccinationRecord) {
        const followUpDate = (selectedVaccinationRecord as any).vaccination_details?.follow_up_date || 
                            selectedVaccinationRecord.follow_up_date;
        
        followUpForm.setFieldsValue({
          follow_up_date: followUpDate ? dayjs(followUpDate) : dayjs(),
          status: 'normal'
        });
      }
    }, [isFollowUpModalVisible, selectedVaccinationRecord, followUpForm]);

    const loadMedicalStaff = async () => {
      try {
        const response = await apiService.getMedicalStaffForVaccination();
        if (response.success && response.data) {
          setMedicalStaff(response.data);
        }
      } catch (error) {
        console.error('Error loading medical staff:', error);
      }
    };

    const loadAvailableClasses = async (silent = false) => {
      try {
        setLoadingClasses(true);
        const response = await apiService.getNurseStudents();
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
          console.warn('Could not load student class names');
          setAvailableClasses(['6A', '6B', '6C', '7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C', '10A1', '10A2']);
          if (!silent) {
            message.warning('Không thể tải danh sách lớp, sử dụng danh sách mặc định');
          }
        }
      } catch (error) {
        console.error('Error loading available classes:', error);
        setAvailableClasses(['6A', '6B', '6C', '7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C', '10A1', '10A2']);
        if (!silent) {
          message.error('Có lỗi khi tải danh sách lớp, sử dụng danh sách mặc định');
        }
      } finally {
        setLoadingClasses(false);
      }
    };

    const getTargetClassOptions = () => {
      const options: { label: string; value: string }[] = [
        { label: 'Tất cả các lớp', value: 'all_grades' }
      ];

      if (availableClasses.length > 0) {
        const grades = Array.from(new Set(availableClasses.map(className => {
          const match = className.match(/^(\d+)/);
          return match ? match[1] : null;
        }).filter(Boolean)));

        grades.sort().forEach(grade => {
          options.push({ label: `Khối ${grade}`, value: `grade_${grade}` });
        });

        availableClasses.forEach(className => {
          options.push({ label: `Lớp ${className}`, value: className });
        });
      }

      return options;
    };

    const loadAllVaccinationStatistics = async () => {
      try {
        const allVaccinationPromises = campaigns.map(async (campaign) => {
          try {
            const response = await apiService.getVaccinationList(campaign._id);
            let data: any;
            if (response.success && response.data) {
              data = response.data;
            } else {
              data = response as any;
            }
            return {
              campaign,
              data: data || {}
            };
          } catch (error) {
            console.error(`Error loading vaccination data for campaign ${campaign._id}:`, error);
            return { campaign, data: {} };
          }
        });

        const allData = await Promise.all(allVaccinationPromises);
        setAllVaccinationData(allData);
      } catch (error) {
        console.error('Error loading vaccination statistics:', error);
      }
    };

    const loadVaccinationCampaigns = async () => {
      try {
        setLoading(true);
        const response = await apiService.getVaccinationCampaigns();
        console.log('API Response:', response);
        
        if (response && Array.isArray(response)) {
          setCampaigns(response);
        } else if (response.success && response.data && Array.isArray(response.data)) {
          setCampaigns(response.data);
        } else if (response.data && Array.isArray(response.data)) {
          setCampaigns(response.data);
        } else if (Array.isArray(response)) {
          setCampaigns(response);
        } else {
          console.log('Unexpected response format:', response);
          setCampaigns([]);
        }
      } catch (error) {
        console.error('Error loading vaccination campaigns:', error);
        message.error('Có lỗi xảy ra khi tải danh sách chiến dịch tiêm chủng');
      } finally {
        setLoading(false);
      }
    };

    const loadVaccinationList = async (campaignId: string) => {
      try {
        const [vaccinationResponse, consentResponse] = await Promise.all([
          apiService.getVaccinationList(campaignId),
          apiService.getCampaignConsents(campaignId)
        ]);
        
        console.log('Vaccination List Response:', vaccinationResponse);
        console.log('Consent Response:', consentResponse);

        let data: any;
        if (vaccinationResponse.success && vaccinationResponse.data) {
          data = vaccinationResponse.data;
        } else {
          data = vaccinationResponse as any;
        }

        if (consentResponse.success && consentResponse.data) {
          setConsentData(consentResponse.data);
        } else {
          setConsentData([]);
        }

        console.log('Processed vaccination data:', data);

        if (data && data.campaign) {
          setVaccinationList({
            campaign: data.campaign,
            eligible_students: data.eligible_students || [],
            vaccinated_students: data.vaccination_results || [],
            pending_students: (data.eligible_students || []).filter(
              (student: any) => !(data.vaccination_results || []).find((v: any) => {
                const studentId = v.student?._id || v.student;
                return studentId === student._id;
              })
            ),
            consent_summary: data.consent_summary || { total: 0, approved: 0, declined: 0, pending: 0 }
          });
          
          console.log('Set vaccination list:', {
            eligible_students: data.eligible_students?.length || 0,
            vaccinated_students: data.vaccination_results?.length || 0
          });
        }
      } catch (error) {
        console.error('Error loading vaccination list:', error);
        message.error('Có lỗi xảy ra khi tải danh sách tiêm chủng');
      }
    };

    const handleCreateCampaign = async (values: any) => {
  try {
    const startDate = values.date_range[0];
    const endDate = values.date_range[1];
    const consentDeadline = values.consent_deadline;

    const campaignData = {
      title: values.title,
      campaign_type: values.campaign_type || 'vaccination',
      description: values.description,
      start_date: startDate.toDate(),
      end_date: endDate.toDate(),
      target_classes: values.target_classes,
      requires_consent: true,
      consent_deadline: consentDeadline?.toDate(),
      instructions: values.instructions,
      vaccineDetails: {
        brand: values.vaccine_brand,
        batchNumber: values.batch_number,
        dosage: values.dosage,
      },
    };

    const response = await apiService.createVaccinationCampaign(campaignData);
    if (response.success) {
      message.success('Tạo chiến dịch tiêm chủng thành công');
      setIsCreateModalVisible(false);
      createForm.resetFields();
      loadVaccinationCampaigns();
    } else {
      message.error(response.message || 'Có lỗi xảy ra');
    }
  } catch (error) {
    console.error('Error creating vaccination campaign:', error);
    message.error('Có lỗi xảy ra khi tạo chiến dịch');
  }
};

    const handleEditCampaign = (campaign: Campaign) => {
      setEditingCampaign(campaign);
      editForm.setFieldsValue({
        title: campaign.title,
        description: campaign.description,
        date_range: campaign.start_date && campaign.end_date ? 
          [moment(campaign.start_date), moment(campaign.end_date)] : null,
        consent_deadline: campaign.consent_deadline ? moment(campaign.consent_deadline) : null,
        target_classes: campaign.target_classes,
        instructions: campaign.instructions,
        vaccine_brand: campaign.vaccineDetails?.brand,
        batch_number: campaign.vaccineDetails?.batchNumber,
        dosage: campaign.vaccineDetails?.dosage,
        status: campaign.status,
        campaign_type: campaign.campaign_type,
      });
      setIsEditModalVisible(true);
    };

    const handleUpdateCampaign = async (values: any) => {
      if (!editingCampaign) return;

      try {
        if (!values.date_range || values.date_range.length !== 2) {
          message.error('Vui lòng chọn khoảng thời gian hợp lệ');
          return;
        }

        if (values.date_range[1].isBefore(values.date_range[0])) {
          message.error('Ngày kết thúc phải sau ngày bắt đầu');
          return;
        }

        const campaignData = {
          title: values.title,
          campaign_type: values.campaign_type || 'vaccination',
          description: values.description,
          start_date: values.date_range[0].toDate(),
          end_date: values.date_range[1].toDate(),
          target_classes: values.target_classes,
          consent_deadline: values.consent_deadline?.toDate(),
          instructions: values.instructions,
          status: values.status,
          vaccineDetails: {
            brand: values.vaccine_brand,
            batchNumber: values.batch_number,
            dosage: values.dosage
          }
        };

        const response = await apiService.updateCampaign(editingCampaign._id, campaignData);
        
        if (response.success) {
          notification.success({
            message: 'Thành công',
            description: 'Chiến dịch đã được cập nhật thành công!',
            duration: 3
          });
          setIsEditModalVisible(false);
          editForm.resetFields();
          setEditingCampaign(null);
          await loadVaccinationCampaigns();
        } else {
          notification.error({
            message: 'Lỗi',
            description: response.message || 'Có lỗi xảy ra khi cập nhật chiến dịch',
            duration: 4
          });
        }
      } catch (error) {
        console.error('Error updating vaccination campaign:', error);
        notification.error({
          message: 'Lỗi hệ thống',
          description: 'Có lỗi xảy ra khi kết nối với máy chủ. Vui lòng thử lại sau.',
          duration: 4
        });
      }
    };

    const handleOpenRecordModal = (student: any) => {
      setCurrentStudent(student);
      setIsRecordModalVisible(true);
      
      recordForm.setFieldsValue({
        vaccinated_at: dayjs(),
        vaccine_brand: selectedCampaign?.vaccineDetails?.brand,
        batch_number: selectedCampaign?.vaccineDetails?.batchNumber,
        dose_number: 1,
        administered_by: medicalStaff.length > 0 ? `${medicalStaff[0].first_name} ${medicalStaff[0].last_name}` : undefined
      });
    };

    const handlePrepareList = (campaign: Campaign) => {
      setSelectedCampaign(campaign);
      loadVaccinationList(campaign._id);
      setIsListModalVisible(true);
    };

    const handleRecordVaccination = async (values: any) => {
      try {
        if (selectedCampaign?.consent_deadline && moment().isAfter(moment(selectedCampaign.consent_deadline))) {
          notification.error({
            message: 'Không thể ghi nhận',
            description: 'Hạn đồng ý của phụ huynh đã qua, không thể ghi nhận kết quả tiêm chủng',
            duration: 4
          });
          return;
        }

        const recordData = {
      student_id: currentStudent._id,
      vaccinated_at: values.vaccinated_at.toDate(),
      vaccine_details: {
        brand: values.vaccine_brand,
        batch_number: values.batch_number,
        dose_number: values.dose_number,
        expiry_date: values.expiry_date.toDate(),
      },
      administered_by: values.administered_by,
      side_effects: values.side_effects || [],
      follow_up_required: values.follow_up_required,
      follow_up_date: values.follow_up_date?.toDate(),
      notes: values.notes || '',
    };

        console.log('Recording vaccination data:', recordData);

        const response = await apiService.recordVaccination(selectedCampaign!._id, recordData);

        console.log('Record vaccination response:', response);

        if (response.success) {
          message.success('Ghi nhận kết quả tiêm chủng thành công!');
          setIsRecordModalVisible(false);
          recordForm.resetFields();
          setCurrentStudent(null);

          if (selectedCampaign) {
            await loadVaccinationList(selectedCampaign._id);
          }
        } else {
          message.error(response.message || 'Có lỗi xảy ra khi ghi nhận kết quả tiêm chủng');
        }
      } catch (error) {
        console.error('Error recording vaccination:', error);
        message.error('Có lỗi xảy ra khi ghi nhận kết quả');
      }
    };

    const handleFollowUp = async (values: any) => {
      try {
        const followUpData = {
          follow_up_date: values.follow_up_date.toDate(),
          follow_up_notes: values.follow_up_notes,
          status: values.status,
          additional_actions: values.additional_actions || []
        };

        const response = await apiService.updateVaccinationFollowUp(
          currentStudent.vaccination_record_id,
          followUpData
        );

        if (response.success) {
          message.success('Cập nhật theo dõi sau tiêm thành công');
          setIsFollowUpModalVisible(false);
          setSelectedVaccinationRecord(null);
          followUpForm.resetFields();
          setCurrentStudent(null);
          if (selectedCampaign) {
            loadVaccinationList(selectedCampaign._id);
          }
        } else {
          message.error(response.message || 'Có lỗi xảy ra');
        }
      } catch (error) {
        console.error('Error updating follow-up:', error);
        message.error('Có lỗi xảy ra khi cập nhật theo dõi');
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'green';
        case 'completed': return 'blue';
        case 'draft': return 'orange';
        case 'cancelled': return 'red';
        default: return 'default';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'active': return 'Đang tiến hành';
        case 'completed': return 'Hoàn thành';
        case 'draft': return 'Bản nháp';
        case 'cancelled': return 'Đã hủy';
        default: return status;
      }
    };

    const calculateStatistics = () => {
      let totalStudentsNeedingFollowUp = 0;
      let totalVaccinated = 0;
      let totalEligible = 0;

      allVaccinationData.forEach(({ data }) => {
        if (data.vaccination_results && data.eligible_students) {
          totalVaccinated += data.vaccination_results.length || 0;
          totalEligible += data.eligible_students.length || 0;

          const needingFollowUp = (data.vaccination_results || []).filter((record: any) => {
            const followUpRequired = record.vaccination_details?.follow_up_required || record.follow_up_required;
            const hasFollowUpNotes = record.vaccination_details?.follow_up_notes;
            const lastFollowUp = record.vaccination_details?.last_follow_up;
            const isFollowUpCompleted = hasFollowUpNotes && lastFollowUp;
            return followUpRequired && !isFollowUpCompleted;
          });
          totalStudentsNeedingFollowUp += needingFollowUp.length;
        }
      });

      return {
        totalVaccinated,
        totalEligible,
        totalStudentsNeedingFollowUp,
        vaccinationRate: totalEligible > 0 ? Math.round((totalVaccinated / totalEligible) * 100) : 0
      };
    };

    const campaignColumns: ColumnsType<Campaign> = [
  {
    title: 'Tên chiến dịch',
    dataIndex: 'title',
    key: 'title',
    render: (text: string, record: Campaign) => (
      <Space direction="vertical" size="small">
        <Text strong>{text}</Text>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {record.vaccineDetails?.brand} - {record.vaccineDetails?.dosage}
        </Text>
      </Space>
    )
  },
  {
    title: 'Thời gian',
    key: 'date_range',
    render: (_, record: Campaign) => (
      <Space direction="vertical" size="small">
        <Text>{moment(record.start_date).format('DD/MM/YYYY')}</Text>
        <Text>{moment(record.end_date).format('DD/MM/YYYY')}</Text>
      </Space>
    )
  },
  {
    title: 'Đối tượng',
    dataIndex: 'target_classes',
    key: 'target_classes',
    render: (classes: string[]) => {
      const options = getTargetClassOptions();
      if (classes.includes('all_grades')) {
        return (
          <Tag color="blue" style={{ marginBottom: 4 }}>
            Tất cả các lớp
          </Tag>
        );
      }
      return (
        <div>
          {classes.map((cls: string) => {
            const option = options.find(opt => opt.value === cls);
            return (
              <Tag key={cls} color="blue" style={{ marginBottom: 4 }}>
                {option ? option.label : cls}
              </Tag>
            );
          })}
        </div>
      );
    }
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={getStatusColor(status)}>
        {getStatusText(status)}
      </Tag>
    )
  },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 300,
    render: (_, record: Campaign) => (
      <Space direction="vertical" size="small">
        <Space>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => handlePrepareList(record)}
            type="primary"
            size="small"
          >
            Ghi nhận
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedCampaign(record);
              setActiveTab('details');
            }}
            size="small"
          >
            Chi tiết
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditCampaign(record)}
            size="small"
            title="Chỉnh sửa chiến dịch"
          >
            Chỉnh sửa
          </Button>
        </Space>
      </Space>
    )
  }
];

    const studentColumns: ColumnsType<any> = [
      {
        title: 'Học sinh',
        key: 'student',
        render: (_, record: any) => (
          <Space>
            <UserOutlined />
            <div>
              <Text strong>{`${record.first_name} ${record.last_name}`}</Text>
              <br />
              <Text type="secondary">Lớp: {record.class_name}</Text>
            </div>
          </Space>
        )
      },
      {
    title: 'Đồng ý PH',
    key: 'consent',
    render: (_, record: any) => {
      if (selectedCampaign?.status !== 'active') {
        return <Tag color="gray">Chưa áp dụng</Tag>;
      }
      const consent = consentData.find((c: any) => {
        const studentId = typeof c.student === 'object' ? c.student._id : c.student;
        return studentId === record._id;
      });
      if (consent) {
        return consent.status === 'Approved' ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>Đã đồng ý</Tag>
        ) : consent.status === 'Declined' ? (
          <Tag color="red" icon={<CloseCircleOutlined />}>Từ chối</Tag>
        ) : (
          <Tag color="orange" icon={<ClockCircleOutlined />}>Chờ phản hồi</Tag>
        );
      }
      return <Tag color="gray" icon={<QuestionCircleOutlined />}>Chưa có phản hồi</Tag>;
    },
  },
      {
        title: 'Trạng thái tiêm chủng',
        key: 'vaccination_status',
        render: (_, record: any) => {
          const vaccinationRecord = vaccinationList?.vaccinated_students.find(
            v => {
              const studentId = v.student?._id || v.student;
              const recordId = record._id;
              return studentId === recordId;
            }
          );
          
          if (vaccinationRecord) {
            const status = vaccinationRecord.vaccination_details?.status || vaccinationRecord.status;
            const followUpRequired = vaccinationRecord.vaccination_details?.follow_up_required || vaccinationRecord.follow_up_required;
            const vaccinatedAt = vaccinationRecord.vaccination_details?.vaccinated_at || vaccinationRecord.vaccinated_at;
            const sideEffects = vaccinationRecord.vaccination_details?.side_effects || vaccinationRecord.side_effects || [];
            const hasFollowUpNotes = (vaccinationRecord as any).vaccination_details?.follow_up_notes;
            const lastFollowUp = (vaccinationRecord as any).vaccination_details?.last_follow_up;
            
            const isFollowUpCompleted = hasFollowUpNotes && lastFollowUp;
            const displayStatus = isFollowUpCompleted && status !== 'completed' ? 'completed' : status;
            
            return (
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  Đã tiêm
                </Tag>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {moment(vaccinatedAt).format('DD/MM/YYYY HH:mm')}
                </Text>
                {followUpRequired && (
                  <Tag 
                    color={displayStatus === 'completed' ? 'blue' : displayStatus === 'follow_up_needed' ? 'orange' : 'red'}
                  >
                    {displayStatus === 'completed' ? 'Hoàn thành theo dõi' : 
                    displayStatus === 'follow_up_needed' ? 'Cần theo dõi' : 
                    displayStatus === 'mild_reaction' ? 'Phản ứng nhẹ' :
                    displayStatus === 'moderate_reaction' ? 'Phản ứng vừa' :
                    displayStatus === 'severe_reaction' ? 'Phản ứng nặng' :
                    displayStatus === 'normal' ? 'Bình thường' :
                    'Đang theo dõi'}
                  </Tag>
                )}
                {sideEffects.length > 0 && (
                  <Tag color="yellow" icon={<WarningOutlined />}>
                    Có tác dụng phụ
                  </Tag>
                )}
              </Space>
            );
          } else {
            return (
              <Tag color="orange" icon={<ClockCircleOutlined />}>
                Chưa tiêm
              </Tag>
            );
          }
        }
      },
      
      {
        title: 'Thao tác',
        key: 'actions',
        render: (_, record: any) => {
          const isVaccinated = vaccinationList?.vaccinated_students.find(
            v => {
              const studentId = v.student?._id || v.student;
              const recordId = record._id;
              return studentId === recordId;
            }
          );

          const consent = consentData.find((c: any) => {
            const studentId = typeof c.student === 'object' ? c.student._id : c.student;
            return studentId === record._id;
          });

          const hasApprovedConsent = consent && consent.status === 'Approved';

          const consentDeadlinePassed = selectedCampaign?.consent_deadline
            ? moment().isAfter(moment(selectedCampaign.consent_deadline))
            : false;

          const followUpRequired = isVaccinated?.vaccination_details?.follow_up_required || isVaccinated?.follow_up_required;
          const hasFollowUpNotes = (isVaccinated as any)?.vaccination_details?.follow_up_notes;
          const lastFollowUp = (isVaccinated as any)?.vaccination_details?.last_follow_up;
          const isFollowUpCompleted = hasFollowUpNotes && lastFollowUp;

          const needsFollowUp = followUpRequired && !isFollowUpCompleted;

          return (
            <Space>
              {!isVaccinated ? (
                <Tooltip
                  title={
                    consentDeadlinePassed
                      ? "Hạn đồng ý của phụ huynh đã qua"
                      : !hasApprovedConsent
                      ? "Cần có sự đồng ý của phụ huynh trước khi tiêm chủng"
                      : ""
                  }
                >
                  <Button
                    icon={<MedicineBoxOutlined />}
                    onClick={() => handleOpenRecordModal(record)}
                    type="primary"
                    size="small"
                    disabled={consentDeadlinePassed || !hasApprovedConsent}
                  >
                    Ghi nhận tiêm
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setCurrentStudent(record);
                    setSelectedVaccinationRecord(isVaccinated);
                    setIsDetailModalVisible(true);
                  }}
                  size="small"
                >
                  Xem kết quả
                </Button>
              )}
              {needsFollowUp && (
                <Button
                  icon={<WarningOutlined />}
                  onClick={() => {
                    setCurrentStudent({
                      ...record,
                      vaccination_record_id: isVaccinated?._id
                    });
                    setSelectedVaccinationRecord(isVaccinated);
                    setIsFollowUpModalVisible(true);
                  }}
                  type="dashed"
                  size="small"
                >
                  Theo dõi
                </Button>
              )}
            </Space>
          );
        }
      }
    ];

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={2}>
              <SafetyOutlined className="mr-2" />
              Quản lý tiêm chủng
            </Title>
            <Text type="secondary">
              Quản lý các chiến dịch tiêm chủng, chuẩn bị danh sách và theo dõi sau tiêm
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
          >
            Tạo chiến dịch tiêm chủng
          </Button>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Danh sách chiến dịch" key="campaigns">
            <Card>
              <Table
                columns={campaignColumns}
                dataSource={campaigns}
                rowKey="_id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} chiến dịch`,
                }}
              />
            </Card>
          </TabPane>

          <TabPane tab="Thống kê" key="statistics">
            {(() => {
              const stats = calculateStatistics();
              return (
                <div>
                  <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="Tổng chiến dịch"
                          value={campaigns.length}
                          prefix={<CalendarOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="Đang tiến hành"
                          value={campaigns.filter(c => c.status === 'active').length}
                          prefix={<SafetyOutlined />}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="Hoàn thành"
                          value={campaigns.filter(c => c.status === 'completed').length}
                          prefix={<CheckCircleOutlined />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="Cần theo dõi"
                          value={stats.totalStudentsNeedingFollowUp}
                          prefix={<WarningOutlined />}
                          valueStyle={{ color: '#faad14' }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="Tổng học sinh đủ điều kiện"
                          value={stats.totalEligible}
                          prefix={<TeamOutlined />}
                          valueStyle={{ color: '#722ed1' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="Đã tiêm chủng"
                          value={stats.totalVaccinated}
                          prefix={<MedicineBoxOutlined />}
                          valueStyle={{ color: '#13c2c2' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="Tỷ lệ tiêm chủng"
                          value={stats.vaccinationRate}
                          suffix="%"
                          prefix={<SafetyOutlined />}
                          valueStyle={{ color: stats.vaccinationRate >= 80 ? '#52c41a' : stats.vaccinationRate >= 60 ? '#faad14' : '#ff4d4f' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="Chưa tiêm"
                          value={stats.totalEligible - stats.totalVaccinated}
                          prefix={<ClockCircleOutlined />}
                          valueStyle={{ color: '#fa8c16' }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Card title="Tiến độ theo chiến dịch" className="mb-4">
                    {allVaccinationData.length > 0 ? (
                      <div>
                        {allVaccinationData.map(({ campaign, data }, index) => {
                          const vaccinated = data.vaccination_results?.length || 0;
                          const eligible = data.eligible_students?.length || 0;
                          const percentage = eligible > 0 ? Math.round((vaccinated / eligible) * 100) : 0;
                          
                          return (
                            <div key={campaign._id} className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <Space>
                                  <Text strong>{campaign.title}</Text>
                                  <Tag color={getStatusColor(campaign.status)}>
                                    {getStatusText(campaign.status)}
                                  </Tag>
                                </Space>
                                <Text type="secondary">
                                  {vaccinated}/{eligible} ({percentage}%)
                                </Text>
                              </div>
                              <Progress 
                                percent={percentage} 
                                strokeColor={percentage >= 80 ? '#52c41a' : percentage >= 60 ? '#faad14' : '#ff4d4f'}
                                size="small"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Text type="secondary">Đang tải dữ liệu thống kê...</Text>
                      </div>
                    )}
                  </Card>

                  <Card title="Thống kê theo lớp học">
                  {allVaccinationData.length > 0 ? (
                    <Collapse accordion defaultActiveKey={allVaccinationData[0]?.campaign._id}>
                      {allVaccinationData.map(({ campaign, data }) => {
                        // Tính toán thống kê theo lớp cho chiến dịch hiện tại
                        const classSummary: { [key: string]: { eligible: number; vaccinated: number } } = {};
                        if (data.eligible_students && data.vaccination_results) {
                          data.eligible_students.forEach((student: { _id: string; class_name: string }) => {
                            const className = student.class_name || 'N/A';
                            if (!classSummary[className]) {
                              classSummary[className] = { eligible: 0, vaccinated: 0 };
                            }
                            classSummary[className].eligible++;
                            const isVaccinated = data.vaccination_results.find((v: any) => {
                              const studentId = v.student?._id || v.student;
                              return studentId === student._id;
                            });
                            if (isVaccinated) {
                              classSummary[className].vaccinated++;
                            }
                          });
                        }

                        return (
                          <Panel
                            header={
                              <Space>
                                <Text strong>{campaign.title}</Text>
                                <Tag color={getStatusColor(campaign.status)}>
                                  {getStatusText(campaign.status)}
                                </Tag>
                              </Space>
                            }
                            key={campaign._id}
                          >
                            <Row gutter={[16, 16]}>
                              {Object.entries(classSummary).map(([className, stats]) => {
                                const percentage = stats.eligible > 0 ? Math.round((stats.vaccinated / stats.eligible) * 100) : 0;
                                return (
                                  <Col key={className} xs={24} sm={12} md={8} lg={6}>
                                    <Card size="small">
                                      <Statistic
                                        title={`Lớp ${className}`}
                                        value={percentage}
                                        suffix="%"
                                        valueStyle={{
                                          color: percentage >= 80 ? '#52c41a' : percentage >= 60 ? '#faad14' : '#ff4d4f',
                                          fontSize: '16px',
                                        }}
                                      />
                                      <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {stats.vaccinated}/{stats.eligible} học sinh
                                      </Text>
                                    </Card>
                                  </Col>
                                );
                              })}
                            </Row>
                          </Panel>
                        );
                      })}
                    </Collapse>
                  ) : (
                    <div className="text-center py-4">
                      <Text type="secondary">Chưa có dữ liệu</Text>
                    </div>
                  )}
                </Card>
              </div>
            );
          })()}
        </TabPane>

          {selectedCampaign && (
            <TabPane tab="Chi tiết chiến dịch" key="details">
              <Card>
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Tên chiến dịch" span={2}>
                    {selectedCampaign.title}
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại chiến dịch">
                    {selectedCampaign.campaign_type === 'vaccination' ? 'Tiêm chủng' : selectedCampaign.campaign_type}
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại vaccine">
                    {selectedCampaign.vaccineDetails?.brand}
                  </Descriptions.Item>
                  <Descriptions.Item label="Liều lượng">
                    {selectedCampaign.vaccineDetails?.dosage}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian bắt đầu">
                    {moment(selectedCampaign.start_date).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian kết thúc">
                    {moment(selectedCampaign.end_date).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả" span={2}>
                    {selectedCampaign.description}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hướng dẫn" span={2}>
                    {selectedCampaign.instructions}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </TabPane>
          )}
        </Tabs>

        <Modal
          title="Tạo chiến dịch tiêm chủng mới"
          open={isCreateModalVisible}
          onCancel={() => setIsCreateModalVisible(false)}
          footer={null}
          width={800}
        >
          <Form form={createForm} layout="vertical" onFinish={handleCreateCampaign}>
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
                  <Input placeholder="VD: Tiêm chủng HPV cho học sinh lớp 6" showCount maxLength={100} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="vaccine_brand"
                  label="Tên vaccine"
                  rules={[{ required: true, message: 'Vui lòng nhập tên vaccine' }]}
                >
                  <Input placeholder="VD: Gardasil 9" />
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
              <TextArea rows={3} placeholder="Mô tả về chiến dịch tiêm chủng..." showCount maxLength={500} />
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
          const today = dayjs().startOf('day'); // 10/7/2025, 01:06 PM +07
          if (!value || value.length !== 2) {
            return Promise.reject(new Error('Vui lòng chọn khoảng thời gian hợp lệ'));
          }
          if (value[1].isBefore(value[0])) {
            return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
          }
          if (value[0].isSame(today, 'day') || value[0].isBefore(today)) {
            return Promise.reject(new Error('Thời gian bắt đầu phải sau ngày hiện tại'));
          }
          return Promise.resolve();
        },
      },
    ]}
    validateTrigger="onChange"
  >
    <RangePicker
      style={{ width: '100%' }}
      disabledDate={(current) => {
        const today = dayjs().startOf('day'); // 10/7/2025, 01:06 PM +07
        return current && (current.isBefore(today) || current.isSame(today, 'day'));
      }}
    />
  </Form.Item>
</Col>
<Col span={12}>
  <Form.Item
    name="consent_deadline"
    label="Hạn đồng ý của phụ huynh"
    rules={[
      { required: true, message: 'Vui lòng chọn hạn đồng ý' },
      ({ getFieldValue }) => ({
        validator(_, value) {
          const range = getFieldValue('date_range');
          const today = dayjs().startOf('day'); // 10/7/2025, 01:06 PM +07
          if (!value || !range || range.length !== 2) return Promise.resolve();
          if (value.isBefore(today)) {
            return Promise.reject(new Error('Hạn đồng ý không được nhỏ hơn ngày hiện tại'));
          }
          if (!value.isBefore(range[0])) {
            return Promise.reject(new Error('Hạn đồng ý phải trước thời gian bắt đầu'));
          }
          return Promise.resolve();
        },
      }),
    ]}
  >
    <DatePicker
      style={{ width: '100%' }}
      disabledDate={(current) => {
        const range = createForm.getFieldValue('date_range');
        if (range && range.length === 2) {
          return current && (current.isBefore(dayjs().startOf('day')) || !current.isBefore(range[0]));
        }
        return current && current.isBefore(dayjs().startOf('day'));
      }}
      onChange={() => createForm.validateFields(['consent_deadline', 'date_range'])}
    />
  </Form.Item>
</Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="batch_number"
                  label="Số lô"
                  rules={[{ required: true, message: 'Vui lòng nhập số lô' }]}
                >
                  <Input placeholder="VD: LOT001" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="dosage"
                  label="Liều lượng"
                  rules={[{ required: true, message: 'Vui lòng nhập liều lượng' }]}
                >
                  <Input placeholder="VD: 0.5ml" />
                </Form.Item>
              </Col>
              <Col span={8}>
  <Form.Item
    name="target_classes"
    label={
      <span>
        Lớp đối tượng{' '}
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
    tooltip="Chọn lớp mà chiến dịch tiêm chủng sẽ nhắm tới. Danh sách được tạo từ học sinh hiện có trong hệ thống."
    rules={[{ required: true, message: 'Vui lòng chọn lớp đối tượng' }]}
  >
    <Select
      mode="multiple"
      placeholder="Chọn lớp"
      options={getTargetClassOptions()}
      optionLabelProp="label" // Hiển thị label thay vì value
      tagRender={(props) => {
        const { label, value, closable, onClose } = props;
        return (
          <Tag
            color="blue"
            closable={closable}
            onClose={onClose}
            style={{ marginRight: 3 }}
          >
            {label} {/* Hiển thị nhãn tiếng Việt trong tag */}
          </Tag>
        );
      }}
    />
  </Form.Item>
</Col>
            </Row>

            <Form.Item
              name="instructions"
              label="Hướng dẫn"
              rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn' }]}
            >
              <TextArea rows={2} placeholder="Hướng dẫn chuẩn bị trước khi tiêm..." />
            </Form.Item>

            

          

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Tạo chiến dịch
                </Button>
                <Button onClick={() => setIsCreateModalVisible(false)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Chỉnh sửa chiến dịch tiêm chủng"
          open={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            editForm.resetFields();
            setEditingCampaign(null);
          }}
          footer={null}
          width={800}
          destroyOnClose
          maskClosable={false}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleUpdateCampaign}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Tên chiến dịch"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên chiến dịch' },
                    { min: 5, message: 'Tên chiến dịch phải có ít nhất 5 ký tự' },
                    { max: 100, message: 'Tên chiến dịch không được quá 100 ký tự' },
                  ]}
                >
                  <Input placeholder="Nhập tên chiến dịch" showCount maxLength={100} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="vaccine_brand"
                  label="Tên vaccine"
                  rules={[{ required: true, message: 'Vui lòng nhập tên vaccine' }]}
                >
                  <Input placeholder="VD: Gardasil 9" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả' },
                { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' },
                { max: 500, message: 'Mô tả không được quá 500 ký tự' },
              ]}
            >
              <TextArea rows={3} placeholder="Nhập mô tả chi tiết về chiến dịch tiêm chủng..." showCount maxLength={500} />
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
          const today = dayjs().startOf('day'); // 10/7/2025, 01:03 PM +07
          if (!value || value.length !== 2) {
            return Promise.reject(new Error('Vui lòng chọn khoảng thời gian hợp lệ'));
          }
          if (value[1].isBefore(value[0])) {
            return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
          }
          if (value[0].isSame(today, 'day') || value[0].isBefore(today)) {
            return Promise.reject(new Error('Thời gian bắt đầu phải sau ngày hiện tại'));
          }
          return Promise.resolve();
        },
      },
    ]}
    validateTrigger="onChange"
  >
    <RangePicker
      style={{ width: '100%' }}
      disabledDate={(current) => {
        const today = dayjs().startOf('day'); // 10/7/2025, 01:03 PM +07
        return current && (current.isBefore(today) || current.isSame(today, 'day'));
      }}
    />
  </Form.Item>
</Col>
<Col span={12}>
  <Form.Item
    name="consent_deadline"
    label="Hạn đồng ý của phụ huynh"
    rules={[
      { required: true, message: 'Vui lòng chọn hạn đồng ý' },
      ({ getFieldValue }) => ({
        validator(_, value) {
          const range = getFieldValue('date_range');
          const today = dayjs().startOf('day'); // 10/7/2025, 01:03 PM +07
          if (!value || !range || range.length !== 2) return Promise.resolve();
          if (value.isBefore(today)) {
            return Promise.reject(new Error('Hạn đồng ý không được nhỏ hơn ngày hôm nay'));
          }
          if (!value.isBefore(range[0])) {
            return Promise.reject(new Error('Hạn đồng ý phải nằm trước thời gian bắt đầu'));
          }
          return Promise.resolve();
        },
      }),
    ]}
    validateTrigger="onChange"
  >
    <DatePicker
      style={{ width: '100%' }}
      disabledDate={(current) => {
        const range = editForm.getFieldValue('date_range');
        if (range && range.length === 2) {
          return current && (current.isBefore(dayjs().startOf('day')) || !current.isBefore(range[0]));
        }
        return current && current.isBefore(dayjs().startOf('day'));
      }}
      onChange={() => editForm.validateFields(['consent_deadline', 'date_range'])}
    />
  </Form.Item>
</Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="batch_number"
                  label="Số lô"
                  rules={[{ required: true, message: 'Vui lòng nhập số lô' }]}
                >
                  <Input placeholder="VD: LOT001" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="dosage"
                  label="Liều lượng"
                  rules={[{ required: true, message: 'Vui lòng nhập liều lượng' }]}
                >
                  <Input placeholder="VD: 0.5ml" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="target_classes"
                  label={
                    <span>
                      Lớp đối tượng{' '}
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
                  tooltip="Chọn lớp mà chiến dịch tiêm chủng sẽ nhắm tới. Danh sách được tạo từ học sinh hiện có trong hệ thống."
                  rules={[{ required: true, message: 'Vui lòng chọn lớp đối tượng' }]}
                >
                  <Select mode="multiple" placeholder="Chọn lớp" options={getTargetClassOptions()} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="instructions"
              label="Hướng dẫn"
              rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn' }]}
            >
              <TextArea rows={2} placeholder="Hướng dẫn chuẩn bị trước khi tiêm..." showCount maxLength={300} />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="draft">Bản nháp</Option>
                <Option value="active">Tiến hành</Option>
                <Option value="completed">Hoàn thành</Option>
                <Option value="cancelled">Hủy</Option>
              </Select>
            </Form.Item>

            

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<EditOutlined />}
                  disabled={loading}
                >
                  Cập nhật chiến dịch
                </Button>
                <Button
                  onClick={() => {
                    setIsEditModalVisible(false);
                    editForm.resetFields();
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

        <Modal
  title={`Danh sách tiêm chủng - ${selectedCampaign?.title}`}
  open={isListModalVisible}
  onCancel={() => {
    setIsListModalVisible(false);
    setConsentData([]);
    filterForm.resetFields();
    setFilterValues({
      searchName: '',
      className: [] as string[], // Sử dụng mảng cho className
  consentStatus: [] as string[],
      vaccinationStatus: '',
      followUpRequired: '',
    });
  }}
  footer={null}
  width={1200} // Tăng chiều rộng để chứa form lọc
>
  {vaccinationList && (
    <div>
      {selectedCampaign?.consent_deadline && moment().isAfter(moment(selectedCampaign.consent_deadline)) && (
        <Alert
          message="Hạn đồng ý của phụ huynh đã qua"
          description="Không thể thực hiện thêm hành động liên quan đến đồng ý của phụ huynh cho chiến dịch này."
          type="warning"
          showIcon
          className="mb-4"
        />
      )}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số HS"
              value={vaccinationList.eligible_students.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã đồng ý"
              value={vaccinationList.consent_summary.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã tiêm"
              value={vaccinationList.vaccinated_students.length}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chưa tiêm"
              value={vaccinationList.pending_students.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      

      {/* Form lọc */}
      <Card title="Lọc danh sách học sinh" className="mb-4">
  <Form form={filterForm} layout="vertical" onFinish={handleFilter}>
    <Row gutter={16}>
      <Col span={6}>
        <Form.Item name="searchName" label="Tên học sinh">
          <Input placeholder="Nhập tên học sinh" allowClear />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item name="className" label="Lớp học">
          <Select 
            mode="multiple" // Cho phép chọn nhiều lớp
            placeholder="Chọn các lớp" 
            allowClear
            options={availableClasses.map((className) => ({
              label: className,
              value: className,
            }))}
          />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item name="consentStatus" label="Trạng thái đồng ý">
          <Select 
            mode="multiple" // Cho phép chọn nhiều trạng thái
            placeholder="Chọn các trạng thái" 
            allowClear
          >
            <Option value="Approved">Đã đồng ý</Option>
            <Option value="Declined">Từ chối</Option>
            <Option value="Pending">Chờ phản hồi</Option>
            <Option value="no_response">Chưa có phản hồi</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item name="vaccinationStatus" label="Trạng thái tiêm">
          <Select placeholder="Chọn trạng thái" allowClear>
            <Option value="vaccinated">Đã tiêm</Option>
            <Option value="not_vaccinated">Chưa tiêm</Option>
          </Select>
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col span={6}>
        <Form.Item name="followUpRequired" label="Cần theo dõi">
          <Select placeholder="Chọn trạng thái" allowClear>
            <Option value="yes">Có</Option>
            <Option value="no">Không</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={18}>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
            <Button onClick={handleResetFilter}>
              Xóa bộ lọc
            </Button>
          </Space>
        </Form.Item>
      </Col>
    </Row>
  </Form>
</Card>

      <Table
        columns={studentColumns}
        dataSource={filterStudents(vaccinationList.eligible_students)}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} học sinh`,
        }}
      />
    </div>
  )}
</Modal>

        <Modal
          title="Ghi nhận kết quả tiêm chủng"
          open={isRecordModalVisible}
          onCancel={() => setIsRecordModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form form={recordForm} layout="vertical" onFinish={handleRecordVaccination}>
            <Alert
              message={`Học sinh: ${currentStudent?.first_name} ${currentStudent?.last_name} - Lớp: ${currentStudent?.class_name}`}
              type="info"
              showIcon
              className="mb-4"
            />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="vaccinated_at"
                  label="Thời gian tiêm"
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                  
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current < moment().startOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="administered_by"
                  label="Người tiêm"
                  rules={[{ required: true, message: 'Vui lòng chọn người tiêm' }]}
                >
                  <Select placeholder="Chọn bác sĩ/y tá" showSearch optionFilterProp="children">
                    {medicalStaff.map((staff) => (
                      <Option key={staff._id} value={`${staff.last_name} ${staff.first_name}`}>
                        <Space>
                          <span>{` ${staff.last_name} ${staff.first_name}`}</span>
                          <Tag color={staff.staff_role === 'Doctor' ? 'blue' : staff.staff_role === 'Nurse' ? 'green' : 'orange'}>
                            {staff.staff_role === 'Doctor' ? 'Bác sĩ' : staff.staff_role === 'Nurse' ? 'Y tá' : staff.staff_role}
                          </Tag>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="vaccine_brand"
                  label="Tên vaccine"
                  rules={[{ required: true, message: 'Vui lòng nhập tên vaccine' }]}
                  initialValue={selectedCampaign?.vaccineDetails?.brand}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="batch_number"
                  label="Số lô"
                  rules={[{ required: true, message: 'Vui lòng nhập số lô' }]}
                  initialValue={selectedCampaign?.vaccineDetails?.batchNumber}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="dose_number"
                  label="Mũi số"
                  rules={[{ required: true, message: 'Vui lòng nhập mũi số' }]}
                  initialValue={1}
                >
                  <Select>
                    <Option value={1}>Mũi 1</Option>
                    <Option value={2}>Mũi 2</Option>
                    <Option value={3}>Mũi 3</Option>
                    <Option value={4}>Mũi nhắc lại</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="expiry_date"
              label="Hạn sử dụng vaccine"
              rules={[{ required: true, message: 'Vui lòng chọn hạn sử dụng' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < moment().startOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="side_effects"
              label="Tác dụng phụ (nếu có)"
            >
              <Select mode="multiple" placeholder="Chọn tác dụng phụ">
                <Option value="pain">Đau tại chỗ tiêm</Option>
                <Option value="swelling">Sưng tại chỗ tiêm</Option>
                <Option value="fever">Sốt nhẹ</Option>
                <Option value="headache">Đau đầu</Option>
                <Option value="fatigue">Mệt mỏi</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="follow_up_required"
              valuePropName="checked"
            >
              <Checkbox>
                Cần theo dõi sau tiêm
              </Checkbox>
            </Form.Item>

            

            <Form.Item
              name="notes"
              label="Ghi chú"
            >
              <TextArea rows={3} placeholder="Ghi chú thêm..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Lưu kết quả
                </Button>
                <Button onClick={() => setIsRecordModalVisible(false)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Theo dõi sau tiêm"
          open={isFollowUpModalVisible}
          onCancel={() => {
            setIsFollowUpModalVisible(false);
            setSelectedVaccinationRecord(null);
            followUpForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form 
            form={followUpForm} 
            layout="vertical" 
            onFinish={handleFollowUp}
            initialValues={{
  follow_up_date: selectedVaccinationRecord ? 
    dayjs((selectedVaccinationRecord as any).vaccination_details?.follow_up_date || selectedVaccinationRecord.follow_up_date) : 
    dayjs(),
  status: 'normal'
}}
          >
            <Alert
              message={`Học sinh: ${currentStudent?.first_name} ${currentStudent?.last_name} - Lớp: ${currentStudent?.class_name}`}
              type="info"
              showIcon
              className="mb-4"
            />

            {selectedVaccinationRecord && (
              <Alert
                message={`Ngày tiêm chủng: ${moment(
                  (selectedVaccinationRecord as any).vaccination_details?.vaccinated_at || selectedVaccinationRecord.vaccinated_at
                ).format('DD/MM/YYYY')}`}
                type="info"
                showIcon
                className="mb-4"
              />
            )}

          

<Form.Item
  name="follow_up_date"
  label="Ngày theo dõi"
  dependencies={['follow_up_required']}
  rules={[
    ({ getFieldValue }) => ({
      validator(_, value) {
        const followUpRequired = getFieldValue('follow_up_required');
        if (followUpRequired && !value) {
          return Promise.reject(new Error('Vui lòng chọn ngày theo dõi'));
        }
        return Promise.resolve();
      },
    }),
  ]}
>
  <DatePicker
    style={{ width: '100%' }}
    disabledDate={(current) => current && current < dayjs().startOf('day')}
  />
</Form.Item>


            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select>
                <Option value="normal">Bình thường</Option>
                <Option value="mild_reaction">Phản ứng nhẹ</Option>
                <Option value="moderate_reaction">Phản ứng vừa</Option>
                <Option value="severe_reaction">Phản ứng nặng</Option>
                <Option value="completed">Hoàn thành theo dõi</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="additional_actions"
              label="Hành động thêm"
            >
              <Select mode="multiple" placeholder="Chọn hành động">
                <Option value="medication">Dùng thuốc</Option>
                <Option value="rest">Nghỉ ngơi</Option>
                <Option value="hospital_referral">Chuyển viện</Option>
                <Option value="parent_contact">Liên hệ phụ huynh</Option>
                <Option value="continue_monitoring">Tiếp tục theo dõi</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="follow_up_notes"
              label="Ghi chú theo dõi"
              rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
            >
              <TextArea rows={4} placeholder="Mô tả tình trạng học sinh sau tiêm..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Lưu theo dõi
                </Button>
                <Button onClick={() => setIsFollowUpModalVisible(false)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Chi tiết kết quả tiêm chủng"
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={null}
          width={700}
        >
          {selectedVaccinationRecord && currentStudent && (
            <div>
              {console.log('Selected Vaccination Record for Detail Modal:', selectedVaccinationRecord)}
              
              <Alert
                message={`Học sinh: ${currentStudent.first_name} ${currentStudent.last_name} - Lớp: ${currentStudent.class_name}`}
                type="info"
                showIcon
                className="mb-4"
              />

              <Descriptions column={2} bordered>
                <Descriptions.Item label="Thời gian tiêm" span={2}>
                  {moment(selectedVaccinationRecord.vaccination_details?.vaccinated_at || selectedVaccinationRecord.vaccinated_at).format('DD/MM/YYYY')}
                </Descriptions.Item>
                
                <Descriptions.Item label="Tên vaccine">
                  {(selectedVaccinationRecord as any).vaccination_details?.vaccine_details?.brand || 
                  selectedVaccinationRecord.vaccine_details?.brand || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Số lô">
                  {(selectedVaccinationRecord as any).vaccination_details?.vaccine_details?.batch_number || 
                  selectedVaccinationRecord.vaccine_details?.batch_number || 'N/A'}
                </Descriptions.Item>
                
                <Descriptions.Item label="Mũi số">
                  {(selectedVaccinationRecord as any).vaccination_details?.vaccine_details?.dose_number || 
                  selectedVaccinationRecord.vaccine_details?.dose_number || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Hạn sử dụng">
                  {(() => {
                    const expiryDate = (selectedVaccinationRecord as any).vaccination_details?.vaccine_details?.expiry_date || 
                                      selectedVaccinationRecord.vaccine_details?.expiry_date;
                    return expiryDate ? moment(expiryDate).format('DD/MM/YYYY') : 'N/A';
                  })()}
                </Descriptions.Item>
                
                <Descriptions.Item label="Người thực hiện tiêm" span={2}>
                  {(selectedVaccinationRecord as any).vaccination_details?.administered_by || 
                  selectedVaccinationRecord.administered_by || 'N/A'}
                </Descriptions.Item>
                
                <Descriptions.Item label="Trạng thái theo dõi">
                  {(() => {
                    const vaccinationStatus = (selectedVaccinationRecord as any).vaccination_details?.status || selectedVaccinationRecord.status;
                    const hasFollowUpNotes = (selectedVaccinationRecord as any).vaccination_details?.follow_up_notes;
                    const lastFollowUp = (selectedVaccinationRecord as any).vaccination_details?.last_follow_up;
                    
                    const isFollowUpCompleted = hasFollowUpNotes && lastFollowUp;
                    const displayStatus = isFollowUpCompleted && vaccinationStatus !== 'completed' ? 'completed' : vaccinationStatus;
                    
                    return (
                      <Tag color={displayStatus === 'completed' ? 'green' : 
                                displayStatus === 'follow_up_needed' ? 'orange' : 'blue'}>
                        {displayStatus === 'completed' ? 'Hoàn thành' :
                        displayStatus === 'follow_up_needed' ? 'Cần theo dõi' : 
                        displayStatus === 'mild_reaction' ? 'Phản ứng nhẹ' :
                        displayStatus === 'moderate_reaction' ? 'Phản ứng vừa' :
                        displayStatus === 'severe_reaction' ? 'Phản ứng nặng' :
                        displayStatus === 'normal' ? 'Bình thường' :
                        'Đang theo dõi'}
                      </Tag>
                    );
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Cần theo dõi">
                  <Tag color={((selectedVaccinationRecord as any).vaccination_details?.follow_up_required || selectedVaccinationRecord.follow_up_required) ? 'orange' : 'green'}>
                    {((selectedVaccinationRecord as any).vaccination_details?.follow_up_required || selectedVaccinationRecord.follow_up_required) ? 'Có' : 'Không'}
                  </Tag>
                </Descriptions.Item>
                
                {(((selectedVaccinationRecord as any).vaccination_details?.follow_up_date || selectedVaccinationRecord.follow_up_date)) && (
                  <Descriptions.Item label="Ngày theo dõi" span={2}>
                   {dayjs((selectedVaccinationRecord as any).vaccination_details?.follow_up_date || selectedVaccinationRecord.follow_up_date).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                )}
                
                {(() => {
                  const sideEffects = (selectedVaccinationRecord as any).vaccination_details?.side_effects || 
                                    selectedVaccinationRecord.side_effects || [];
                  return sideEffects.length > 0 && (
                    <Descriptions.Item label="Tác dụng phụ" span={2}>
                      <Space wrap>
                        {sideEffects.map((effect: string, index: number) => (
                          <Tag key={index} color="yellow">
                            {effect === 'pain' ? 'Đau tại chỗ tiêm' :
                            effect === 'swelling' ? 'Sưng tại chỗ tiêm' :
                            effect === 'fever' ? 'Sốt nhẹ' :
                            effect === 'headache' ? 'Đau đầu' :
                            effect === 'fatigue' ? 'Mệt mỏi' :
                            effect}
                          </Tag>
                        ))}
                      </Space>
                    </Descriptions.Item>
                  );
                })()}
                
                {(selectedVaccinationRecord.notes || (selectedVaccinationRecord as any).vaccination_details?.notes) && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {selectedVaccinationRecord.notes || (selectedVaccinationRecord as any).vaccination_details?.notes}
                  </Descriptions.Item>
                )}
                
                {((selectedVaccinationRecord as any).vaccination_details?.follow_up_notes) && (
                  <Descriptions.Item label="Ghi chú theo dõi" span={2}>
                    <Space direction="vertical" size="small">
                      <Text>{(selectedVaccinationRecord as any).vaccination_details.follow_up_notes}</Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        Cập nhật: {moment((selectedVaccinationRecord as any).vaccination_details.last_follow_up).format('DD/MM/YYYY HH:mm')}
                      </Text>
                    </Space>
                  </Descriptions.Item>
                )}
                
                {((selectedVaccinationRecord as any).vaccination_details?.additional_actions?.length > 0) && (
                  <Descriptions.Item label="Hành động đã thực hiện" span={2}>
                    <Space wrap>
                      {(selectedVaccinationRecord as any).vaccination_details.additional_actions.map((action: string, index: number) => (
                        <Tag key={index} color="blue">
                          {action === 'medication' ? 'Dùng thuốc' :
                          action === 'rest' ? 'Nghỉ ngơi' :
                          action === 'hospital_referral' ? 'Chuyển viện' :
                          action === 'parent_contact' ? 'Liên hệ phụ huynh' :
                          action === 'continue_monitoring' ? 'Tiếp tục theo dõi' :
                          action}
                        </Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>

              {(() => {
                const followUpRequired = (selectedVaccinationRecord as any).vaccination_details?.follow_up_required || 
                                        selectedVaccinationRecord.follow_up_required;
                const hasFollowUpNotes = (selectedVaccinationRecord as any).vaccination_details?.follow_up_notes;
                const lastFollowUp = (selectedVaccinationRecord as any).vaccination_details?.last_follow_up;
                const isFollowUpCompleted = hasFollowUpNotes && lastFollowUp;
                
                return followUpRequired && !isFollowUpCompleted && (
                  <div className="mt-4">
                    <Button 
                      type="primary" 
                      icon={<EditOutlined />}
                      onClick={() => {
                        setCurrentStudent({
                          ...currentStudent,
                          vaccination_record_id: selectedVaccinationRecord._id
                        });
                        setIsDetailModalVisible(false);
                        setIsFollowUpModalVisible(true);
                      }}
                    >
                      Cập nhật theo dõi
                    </Button>
                  </div>
                );
              })()}
            </div>
          )}
        </Modal>
      </div>
    );
  };

  export default VaccinationManagement;

