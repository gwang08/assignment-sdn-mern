import {
  FileTextOutlined,
  HeartOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { MedicalEvent } from '../../types';

const { Title, Text } = Typography;

const StudentMedicalHistory: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [medicalEvents, setMedicalEvents] = useState<MedicalEvent[]>([]);

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMedicalEvents();
      if (response.success && response.data) {
        // Filter events for current student
        const studentEvents = response.data.filter(event => event.student_id === user?._id);
        setMedicalEvents(studentEvents);
      }
    } catch (error) {
      console.error('Error loading medical history:', error);
      setMedicalEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Accident': 'red',
      'Fever': 'orange',
      'Injury': 'volcano',
      'Epidemic': 'purple',
      'Other': 'default'
    };
    return colors[type] || 'default';
  };

  const getEventTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'Accident': 'Tai nạn',
      'Fever': 'Sốt',
      'Injury': 'Chấn thương',
      'Epidemic': 'Dịch bệnh',
      'Other': 'Khác'
    };
    return labels[type] || type;
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'Low': 'green',
      'Medium': 'orange',
      'High': 'red',
      'Emergency': 'red'
    };
    return colors[severity] || 'default';
  };

  const getSeverityLabel = (severity: string) => {
    const labels: { [key: string]: string } = {
      'Low': 'Nhẹ',
      'Medium': 'Trung bình',
      'High': 'Nặng',
      'Emergency': 'Cấp cứu'
    };
    return labels[severity] || severity;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Open': 'blue',
      'In Progress': 'processing',
      'Resolved': 'success',
      'Referred to Hospital': 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'Open': 'Mở',
      'In Progress': 'Đang xử lý',
      'Resolved': 'Đã giải quyết',
      'Referred to Hospital': 'Chuyển viện'
    };
    return labels[status] || status;
  };

  const medicalEventColumns = [
    {
      title: 'Ngày',
      dataIndex: 'occurred_at', // Updated to match interface
      key: 'occurred_at',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a: MedicalEvent, b: MedicalEvent) => 
        new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
      defaultSortOrder: 'descend' as const
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text strong>{title || 'Không có tiêu đề'}</Text>
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'event_type',
      key: 'event_type',
      render: (type: string) => (
        <Tag color={getEventTypeColor(type)}>
          {getEventTypeLabel(type)}
        </Tag>
      )
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {getSeverityLabel(severity)}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      )
    }
  ];

  const expandedRowRender = (record: MedicalEvent) => {
    return (
      <div className="p-4">
        <Descriptions title="Chi tiết sự kiện" bordered column={2}>
          <Descriptions.Item label="Mô tả" span={2}>
            {record.description}
          </Descriptions.Item>
          <Descriptions.Item label="Triệu chứng">
            {record.symptoms && record.symptoms.length > 0 ? (
              <div>
                {record.symptoms.map((symptom: string, index: number) => (
                  <Tag key={index} className="mb-1">{symptom}</Tag>
                ))}
              </div>
            ) : 'Không có triệu chứng được ghi nhận'}
          </Descriptions.Item>
          <Descriptions.Item label="Thuốc được sử dụng">
            {record.medications_administered && record.medications_administered.length > 0 ? (
              <div>
                {record.medications_administered.map((medication, index: number) => (
                  <div key={index} className="mb-2">
                    <Tag color="blue" className="mb-1">
                      {medication.name}
                      {medication.dosage && ` - ${medication.dosage}`}
                    </Tag>
                    <div className="text-xs text-gray-500">
                      Thời gian: {new Date(medication.time).toLocaleString('vi-VN')}
                      {medication.administered_by && ` | Người thực hiện: ${medication.administered_by}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : 'Không có thuốc được sử dụng'}
          </Descriptions.Item>
          <Descriptions.Item label="Điều trị đã thực hiện" span={2}>
            {record.treatment_notes || 'Chưa có thông tin điều trị'}
          </Descriptions.Item>
          
          {record.follow_up_required && (
            <>
              <Descriptions.Item label="Cần theo dõi">
                <Tag color="orange">Có</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày theo dõi">
                {record.follow_up_date ? 
                  new Date(record.follow_up_date).toLocaleDateString('vi-VN') : 
                  'Chưa xác định'
                }
              </Descriptions.Item>
              {record.follow_up_notes && (
                <Descriptions.Item label="Ghi chú theo dõi" span={2}>
                  {record.follow_up_notes}
                </Descriptions.Item>
              )}
            </>
          )}
          
          <Descriptions.Item label="Phụ huynh đã được thông báo">
            <Tag color={record.parent_notified.status ? 'green' : 'red'}>
              {record.parent_notified.status ? 'Đã thông báo' : 'Chưa thông báo'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian thông báo">
            {record.parent_notified.time ? 
              new Date(record.parent_notified.time).toLocaleString('vi-VN') : 
              'Chưa thông báo'
            }
          </Descriptions.Item>
          {record.parent_notified.method && (
            <Descriptions.Item label="Phương thức thông báo">
              {record.parent_notified.method}
            </Descriptions.Item>
          )}
          
          <Descriptions.Item label="Người tạo">
            {record.created_by}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian tạo">
            {new Date(record.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          
          {record.resolved_at && (
            <Descriptions.Item label="Thời gian giải quyết">
              {new Date(record.resolved_at).toLocaleString('vi-VN')}
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>
          <FileTextOutlined className="mr-2" />
          Lịch sử y tế của tôi
        </Title>
        <Text type="secondary">
          Xem lịch sử các sự kiện y tế và điều trị đã thực hiện
        </Text>
      </div>

      {medicalEvents.length > 0 ? (
        <div>
          {/* Summary */}
          <Card className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {medicalEvents.length}
                </div>
                <div className="text-sm text-gray-600">Tổng số sự kiện</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {medicalEvents.filter(e => e.status === 'Resolved').length}
                </div>
                <div className="text-sm text-gray-600">Đã giải quyết</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {medicalEvents.filter(e => e.status === 'In Progress').length}
                </div>
                <div className="text-sm text-gray-600">Đang xử lý</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {medicalEvents.filter(e => e.follow_up_required).length}
                </div>
                <div className="text-sm text-gray-600">Cần theo dõi</div>
              </div>
            </div>
          </Card>

          {/* Events Table */}
          <Card title="Chi tiết các sự kiện y tế" loading={loading}>
            <Table
              dataSource={medicalEvents}
              columns={medicalEventColumns}
              rowKey="_id"
              expandable={{
                expandedRowRender,
                expandIcon: ({ expanded, onExpand, record }) => (
                  <Button
                    type="link"
                    size="small"
                    onClick={e => onExpand(record, e)}
                    icon={<InfoCircleOutlined />}
                  >
                    {expanded ? 'Thu gọn' : 'Chi tiết'}
                  </Button>
                )
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} sự kiện`
              }}
            />
          </Card>

          {/* Timeline View */}
          <Card title="Dòng thời gian" className="mt-4">
            <Timeline mode="left">
              {medicalEvents
                .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
                .slice(0, 10)
                .map((event) => (
                  <Timeline.Item
                    key={event._id}
                    color={getEventTypeColor(event.event_type)}
                    label={new Date(event.occurred_at).toLocaleDateString('vi-VN')}
                  >
                    <div>
                      <Text strong>{event.title || 'Sự kiện y tế'}</Text>
                      <br />
                      <Text type="secondary">{event.description}</Text>
                      <br />
                      <Space className="mt-2">
                        <Tag color={getEventTypeColor(event.event_type)}>
                          {getEventTypeLabel(event.event_type)}
                        </Tag>
                        <Tag color={getSeverityColor(event.severity)}>
                          {getSeverityLabel(event.severity)}
                        </Tag>
                        <Tag color={getStatusColor(event.status)}>
                          {getStatusLabel(event.status)}
                        </Tag>
                      </Space>
                    </div>
                  </Timeline.Item>
                ))}
            </Timeline>
            {medicalEvents.length > 10 && (
              <div className="text-center mt-4">
                <Text type="secondary">
                  Hiển thị 10 sự kiện gần nhất. Xem bảng chi tiết ở trên để xem tất cả.
                </Text>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <Card>
          <Alert
            message="Chưa có lịch sử y tế"
            description={
              <div>
                <p>Bạn chưa có sự kiện y tế nào được ghi nhận trong hệ thống.</p>
                <p>Đây là điều tích cực, có nghĩa là bạn đang có sức khỏe tốt!</p>
              </div>
            }
            type="success"
            showIcon
            icon={<HeartOutlined />}
          />
        </Card>
      )}
    </div>
  );
};

export default StudentMedicalHistory;