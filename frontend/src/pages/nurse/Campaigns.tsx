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
  DatePicker,
  Row,
  Col,
  Typography,
  Drawer,
  Descriptions,
  List,
  message,
  Tabs,
  Progress
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,

} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import apiService from '../../services/api';
import { Campaign, CampaignConsent, CampaignResult } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

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

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCampaigns();
      if (response.success && response.data) {
        setCampaigns(response.data);
      } else {
        message.error('Không thể tải danh sách chiến dịch');
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      message.error('Có lỗi xảy ra khi tải danh sách chiến dịch');
    } finally {
      setLoading(false);
    }
  };

  const loadCampaignDetails = async (campaignId: string) => {
    try {
      const [consentsResponse, resultsResponse] = await Promise.all([
        apiService.getCampaignConsents(campaignId),
        apiService.getCampaignResults(campaignId)
      ]);

      if (consentsResponse.success && consentsResponse.data) {
        setConsents(consentsResponse.data);
      }
      if (resultsResponse.success && resultsResponse.data) {
        setResults(resultsResponse.data);
      }
    } catch (error) {
      console.error('Error loading campaign details:', error);
      message.error('Có lỗi xảy ra khi tải chi tiết chiến dịch');
    }
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    form.setFieldsValue({
      ...campaign,
      date_range: [moment(campaign.start_date), moment(campaign.end_date)],
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
      const campaignData = {
        ...values,
        start_date: values.date_range[0].toDate(),
        end_date: values.date_range[1].toDate(),
      };
      delete campaignData.date_range;

      let response;
      if (editingCampaign) {
        response = await apiService.updateCampaign(editingCampaign._id, campaignData);
      } else {
        response = await apiService.createCampaign(campaignData);
      }

      if (response.success) {
        message.success(editingCampaign ? 'Cập nhật chiến dịch thành công' : 'Tạo chiến dịch thành công');
        setIsModalVisible(false);
        form.resetFields();
        loadCampaigns();
      } else {
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting campaign:', error);
      message.error('Có lỗi xảy ra khi lưu chiến dịch');
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
      health_screening: { color: 'green', text: 'Khám sức khỏe' },
      health_education: { color: 'purple', text: 'Giáo dục sức khỏe' },
      medical_treatment: { color: 'orange', text: 'Điều trị y tế' }
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
      title: 'Thao tác',
      key: 'actions',
      render: (_, record: Campaign) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewCampaign(record)}
            title="Xem chi tiết"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditCampaign(record)}
            title="Chỉnh sửa"
          />
        </Space>
      ),
    },
  ];

  const calculateProgress = (campaign: Campaign) => {
    if (!consents.length) return 0;
    const approvedConsents = consents.filter(c => c.consent_given === true).length;
    return Math.round((approvedConsents / consents.length) * 100);
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
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
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
                rules={[{ required: true, message: 'Vui lòng nhập tên chiến dịch' }]}
              >
                <Input placeholder="Nhập tên chiến dịch" />
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
                  <Option value="health_screening">Khám sức khỏe</Option>
                  <Option value="health_education">Giáo dục sức khỏe</Option>
                  <Option value="medical_treatment">Điều trị y tế</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={3} placeholder="Nhập mô tả chiến dịch" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date_range"
                label="Thời gian thực hiện"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
              >
                <RangePicker style={{ width: '100%' }} />
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
            label="Nhóm đối tượng"
            rules={[{ required: true, message: 'Vui lòng chọn nhóm đối tượng' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn nhóm đối tượng"
              options={[
                { label: 'Tất cả các lớp', value: 'all_grades' },
                { label: 'Lớp 1', value: 'grade_1' },
                { label: 'Lớp 2', value: 'grade_2' },
                { label: 'Lớp 3', value: 'grade_3' },
                { label: 'Lớp 4', value: 'grade_4' },
                { label: 'Lớp 5', value: 'grade_5' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="instructions"
            label="Hướng dẫn"
          >
            <TextArea rows={2} placeholder="Nhập hướng dẫn thực hiện" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="requires_consent"
                label="Yêu cầu đồng ý"
              >
                <Select defaultValue={true}>
                  <Option value={true}>Có</Option>
                  <Option value={false}>Không</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCampaign ? 'Cập nhật' : 'Tạo chiến dịch'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
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
            
            <TabPane tab="Đồng ý tham gia" key="consents">
              <div className="mb-4">
                <Progress 
                  percent={calculateProgress(selectedCampaign)} 
                  format={(percent) => `${percent}% đã đồng ý`}
                />
              </div>
              <List
                dataSource={consents}
                renderItem={(consent: CampaignConsent) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`Parent ID: ${consent.parent_id}`}
                      description={`Student ID: ${consent.student_id}`}
                    />
                    <Tag color={consent.consent_given ? 'green' : 'orange'}>
                      {consent.consent_given ? 'Đã đồng ý' : 'Chưa đồng ý'}
                    </Tag>
                  </List.Item>
                )}
              />
            </TabPane>
            
            <TabPane tab="Kết quả" key="results">
              <List
                dataSource={results}
                renderItem={(result: CampaignResult) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`Student ID: ${result.student_id}`}
                      description={
                        <div>
                          <div>Tham gia: {result.participated ? 'Có' : 'Không'}</div>
                          <div>Ghi chú: {result.notes}</div>
                          <div>Ngày: {moment(result.conducted_at).format('DD/MM/YYYY')}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  );
};

export default CampaignsPage;
