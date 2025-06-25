import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Row,
  Col,
  Typography,
  message,
  Descriptions,
  Drawer,
  Timeline,
  Alert,
  Input
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import apiService from '../../services/api';
import { MedicineRequest } from '../../types';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const MedicineRequestsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MedicineRequest | null>(null);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<MedicineRequest | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMedicineRequests();
      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        message.error('Không thể tải danh sách yêu cầu thuốc');
      }
    } catch (error) {
      console.error('Error loading medicine requests:', error);
      message.error('Có lỗi xảy ra khi tải danh sách yêu cầu thuốc');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request: MedicineRequest) => {
    setSelectedRequest(request);
    setIsDetailDrawerVisible(true);
  };

  const handleProcessRequest = (request: MedicineRequest) => {
    setProcessingRequest(request);
    form.setFieldsValue({
      status: request.status,
      notes: request.notes || ''
    });
    setIsStatusModalVisible(true);
  };

  const handleUpdateStatus = async (values: any) => {
    if (!processingRequest) return;

    try {
      const response = await apiService.updateMedicineRequestStatus(
        processingRequest._id,
        values.status
      );

      if (response.success) {
        message.success('Cập nhật trạng thái thành công');
        setIsStatusModalVisible(false);
        form.resetFields();
        loadRequests();
      } else {
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
      approved: { color: 'green', text: 'Đã duyệt', icon: <CheckCircleOutlined /> },
      rejected: { color: 'red', text: 'Từ chối', icon: <CloseCircleOutlined /> },
      completed: { color: 'blue', text: 'Hoàn thành', icon: <CheckCircleOutlined /> }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      color: 'default', 
      text: status, 
      icon: <ExclamationCircleOutlined /> 
    };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getUrgencyColor = (endDate: string) => {
    const daysLeft = moment(endDate).diff(moment(), 'days');
    if (daysLeft < 0) return 'red';
    if (daysLeft <= 3) return 'orange';
    if (daysLeft <= 7) return 'yellow';
    return 'green';
  };

  const columns: ColumnsType<MedicineRequest> = [
    {
      title: 'Mã yêu cầu',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => id.slice(-8).toUpperCase(),
    },
    {
      title: 'Tên thuốc',
      dataIndex: 'medicine_name',
      key: 'medicine_name',
      render: (text: string, record: MedicineRequest) => (
        <div>
          <strong>{text}</strong>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.dosage} - {record.frequency}
          </div>
        </div>
      ),
    },
    {
      title: 'Học sinh',
      dataIndex: 'student_id',
      key: 'student_id',
      render: (studentId: string) => (
        <div>
          <div>ID: {studentId.slice(-6).toUpperCase()}</div>
        </div>
      ),
    },
    {
      title: 'Phụ huynh',
      dataIndex: 'parent_id',
      key: 'parent_id',
      render: (parentId: string) => (
        <div>
          <div>ID: {parentId.slice(-6).toUpperCase()}</div>
        </div>
      ),
    },
    {
      title: 'Thời gian sử dụng',
      key: 'duration',
      render: (_, record: MedicineRequest) => (
        <div>
          <div>{moment(record.start_date).format('DD/MM/YYYY')}</div>
          <div>{moment(record.end_date).format('DD/MM/YYYY')}</div>
          <Tag color={getUrgencyColor(record.end_date)}>
            {record.duration}
          </Tag>
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
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record: MedicineRequest) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewRequest(record)}
            title="Xem chi tiết"
          />
          {record.status === 'pending' && (
            <Button
              type="primary"
              onClick={() => handleProcessRequest(record)}
              title="Xử lý yêu cầu"
            >
              Xử lý
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="p-6">
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Title level={2}>Quản lý Yêu cầu Thuốc</Title>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{pendingCount}</div>
              <div className="text-gray-600">Chờ duyệt</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{approvedCount}</div>
              <div className="text-gray-600">Đã duyệt</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{rejectedCount}</div>
              <div className="text-gray-600">Từ chối</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{requests.length}</div>
              <div className="text-gray-600">Tổng cộng</div>
            </div>
          </Card>
        </Col>
      </Row>

      {pendingCount > 0 && (
        <Alert
          message={`Có ${pendingCount} yêu cầu thuốc đang chờ duyệt`}
          type="warning"
          icon={<ExclamationCircleOutlined />}
          className="mb-4"
        />
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} yêu cầu`,
          }}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title="Chi tiết yêu cầu thuốc"
        placement="right"
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
        width={600}
      >
        {selectedRequest && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Mã yêu cầu">
                {selectedRequest._id.slice(-8).toUpperCase()}
              </Descriptions.Item>
              <Descriptions.Item label="Tên thuốc">
                <div>
                  <strong>{selectedRequest.medicine_name}</strong>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Liều lượng">
                {selectedRequest.dosage}
              </Descriptions.Item>
              <Descriptions.Item label="Tần suất">
                {selectedRequest.frequency}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {selectedRequest.duration}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">
                {moment(selectedRequest.start_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">
                {moment(selectedRequest.end_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Hướng dẫn sử dụng">
                {selectedRequest.instructions}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedRequest.status)}
              </Descriptions.Item>
              {selectedRequest.notes && (
                <Descriptions.Item label="Ghi chú">
                  {selectedRequest.notes}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ngày tạo">
                {moment(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            {selectedRequest.approved_by && (
              <div className="mt-4">
                <Title level={4}>Thông tin phê duyệt</Title>
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Người phê duyệt">
                    {selectedRequest.approved_by}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày phê duyệt">
                    {moment(selectedRequest.approved_at).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            <div className="mt-4">
              <Timeline>
                <Timeline.Item color="blue">
                  <div>
                    <strong>Yêu cầu được tạo</strong>
                    <div>{moment(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                  </div>
                </Timeline.Item>
                {selectedRequest.approved_at && (
                  <Timeline.Item color="green">
                    <div>
                      <strong>Yêu cầu được phê duyệt</strong>
                      <div>{moment(selectedRequest.approved_at).format('DD/MM/YYYY HH:mm')}</div>
                      <div>Bởi: {selectedRequest.approved_by}</div>
                    </div>
                  </Timeline.Item>
                )}
              </Timeline>
            </div>
          </div>
        )}
      </Drawer>

      {/* Status Update Modal */}
      <Modal
        title="Xử lý yêu cầu thuốc"
        open={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        footer={null}
        width={500}
      >
        {processingRequest && (
          <div>
            <Alert
              message={`Yêu cầu: ${processingRequest.medicine_name}`}
              description={`Học sinh ID: ${processingRequest.student_id.slice(-6).toUpperCase()}`}
              type="info"
              className="mb-4"
            />
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateStatus}
            >
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="approved">Duyệt</Option>
                  <Option value="rejected">Từ chối</Option>
                  <Option value="completed">Hoàn thành</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="notes"
                label="Ghi chú"
              >
                <TextArea rows={3} placeholder="Nhập ghi chú (tùy chọn)" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Cập nhật
                  </Button>
                  <Button onClick={() => setIsStatusModalVisible(false)}>
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicineRequestsPage;
