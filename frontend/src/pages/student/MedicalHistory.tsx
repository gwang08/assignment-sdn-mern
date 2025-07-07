import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Timeline,
  Descriptions,
  Row,
  Col,
  Statistic,
  Badge,
  Tabs,
  Empty,
  Tooltip,
  Avatar,
  Progress,
} from "antd";
import {
  FileTextOutlined,
  InfoCircleOutlined,
  HeartOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  TrophyOutlined,
  LineChartOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/api";
import "./StudentMedicalHistory.css";
import { MedicalEvent } from "../../types";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const StudentMedicalHistory: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [medicalEvents, setMedicalEvents] = useState<MedicalEvent[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStudentSelfMedicalEvents();
      if (response.success && response.data) {
        const studentEvents = response.data.filter(
          (event) => event.student_id === user?._id
        );
        setMedicalEvents(studentEvents);
      }
    } catch (error) {
      console.error("Error loading medical history:", error);
      setMedicalEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      accident: "red",
      illness: "orange",
      injury: "volcano",
      emergency: "red",
      other: "blue",
    };
    return colors[type] || "default";
  };

  const getEventTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      accident: "Tai nạn",
      illness: "Bệnh tật",
      injury: "Chấn thương",
      emergency: "Cấp cứu",
      other: "Khác",
    };
    return labels[type] || type;
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      low: "green",
      medium: "orange",
      high: "red",
      critical: "red",
    };
    return colors[severity] || "default";
  };

  const getSeverityLabel = (severity: string) => {
    const labels: { [key: string]: string } = {
      low: "Nhẹ",
      medium: "Trung bình",
      high: "Nặng",
      critical: "Nghiêm trọng",
    };
    return labels[severity] || severity;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      open: "blue",
      in_progress: "processing",
      resolved: "success",
      referred: "warning",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      open: "Mở",
      in_progress: "Đang xử lý",
      resolved: "Đã giải quyết",
      referred: "Chuyển tuyến",
    };
    return labels[status] || status;
  };

  const getHealthScore = () => {
    if (medicalEvents.length === 0) return 100;

    const totalEvents = medicalEvents.length;
    const resolvedEvents = medicalEvents.filter(
      (e) => e.status === "resolved"
    ).length;
    const criticalEvents = medicalEvents.filter(
      (e) => e.severity === "critical"
    ).length;

    let score = 100;
    score -= totalEvents * 5; // Giảm 5 điểm mỗi sự kiện
    score -= criticalEvents * 15; // Giảm thêm 15 điểm cho sự kiện nghiêm trọng
    score += resolvedEvents * 3; // Cộng 3 điểm cho sự kiện đã giải quyết

    return Math.max(0, Math.min(100, score));
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "#52c41a";
    if (score >= 60) return "#faad14";
    if (score >= 40) return "#fa8c16";
    return "#f5222d";
  };

  const getHealthScoreStatus = (score: number) => {
    if (score >= 80) return "Tuyệt vời";
    if (score >= 60) return "Tốt";
    if (score >= 40) return "Bình thường";
    return "Cần chú ý";
  };

  const medicalEventColumns = [
    {
      title: "Ngày",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-gray-500" />
          <span>{new Date(date).toLocaleDateString("vi-VN")}</span>
        </div>
      ),
      sorter: (a: MedicalEvent, b: MedicalEvent) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      defaultSortOrder: "descend" as const,
      width: 140,
    },
    {
      title: "Sự kiện",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: MedicalEvent) => (
        <div>
          <Text strong className="text-base">
            {title}
          </Text>
          <br />
          <Text type="secondary" className="text-sm">
            {record.description}
          </Text>
        </div>
      ),
      width: 300,
    },
    {
      title: "Loại",
      dataIndex: "event_type",
      key: "event_type",
      render: (type: string) => (
        <Tag color={getEventTypeColor(type)} className="font-medium">
          {getEventTypeLabel(type)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      key: "severity",
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)} className="font-medium">
          {getSeverityLabel(severity)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={getStatusColor(status) as any}
          text={getStatusLabel(status)}
          className="font-medium"
        />
      ),
      width: 130,
    },
  ];

  const expandedRowRender = (record: MedicalEvent) => {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
        <Descriptions
          title={
            <div className="flex items-center">
              <MedicineBoxOutlined className="mr-2 text-blue-600" />
              <span>Chi tiết sự kiện y tế</span>
            </div>
          }
          bordered
          column={2}
          size="small"
        >
          <Descriptions.Item label="Mô tả chi tiết" span={2}>
            <Paragraph className="mb-0">{record.description}</Paragraph>
          </Descriptions.Item>

          <Descriptions.Item label="Triệu chứng">
            {record.symptoms && record.symptoms.length > 0 ? (
              <Space wrap>
                {record.symptoms.map((symptom: string, index: number) => (
                  <Tag key={index} color="purple" className="mb-1">
                    {symptom}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">Không có triệu chứng được ghi nhận</Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Thuốc đã dùng">
            {record.medications_given && record.medications_given.length > 0 ? (
              <Space wrap>
                {record.medications_given.map(
                  (medication: string, index: number) => (
                    <Tag key={index} color="cyan" className="mb-1">
                      <MedicineBoxOutlined className="mr-1" />
                      {medication}
                    </Tag>
                  )
                )}
              </Space>
            ) : (
              <Text type="secondary">Không có thuốc được sử dụng</Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Điều trị" span={2}>
            {record.treatment_provided || (
              <Text type="secondary">Chưa có thông tin điều trị</Text>
            )}
          </Descriptions.Item>

          {record.follow_up_required && (
            <>
              <Descriptions.Item label="Theo dõi">
                <Tag color="orange" icon={<ClockCircleOutlined />}>
                  Cần theo dõi
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày theo dõi">
                {record.follow_up_date ? (
                  new Date(record.follow_up_date).toLocaleDateString("vi-VN")
                ) : (
                  <Text type="secondary">Chưa xác định</Text>
                )}
              </Descriptions.Item>
              {record.follow_up_notes && (
                <Descriptions.Item label="Ghi chú theo dõi" span={2}>
                  {record.follow_up_notes}
                </Descriptions.Item>
              )}
            </>
          )}

          <Descriptions.Item label="Thông báo phụ huynh">
            <Tag
              color={record.parent_notified ? "green" : "red"}
              icon={
                record.parent_notified ? (
                  <CheckCircleOutlined />
                ) : (
                  <ExclamationCircleOutlined />
                )
              }
            >
              {record.parent_notified ? "Đã thông báo" : "Chưa thông báo"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Thời gian thông báo">
            {record.notification_sent_at ? (
              new Date(record.notification_sent_at).toLocaleString("vi-VN")
            ) : (
              <Text type="secondary">Chưa thông báo</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Health Score Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <Row gutter={24} align="middle">
          <Col span={8}>
            <div className="text-center">
              <Avatar
                size={80}
                icon={<TrophyOutlined />}
                className="mb-4"
                style={{
                  backgroundColor: getHealthScoreColor(getHealthScore()),
                }}
              />
              <Title level={3} className="mb-0">
                Điểm sức khỏe
              </Title>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <Progress
                type="circle"
                percent={getHealthScore()}
                strokeColor={getHealthScoreColor(getHealthScore())}
                size={120}
                format={(percent) => `${percent}`}
              />
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <Title
                level={2}
                style={{ color: getHealthScoreColor(getHealthScore()) }}
              >
                {getHealthScoreStatus(getHealthScore())}
              </Title>
              <Text type="secondary">Tình trạng sức khỏe tổng quan</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số sự kiện"
              value={medicalEvents.length}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã giải quyết"
              value={
                medicalEvents.filter((e) => e.status === "resolved").length
              }
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={
                medicalEvents.filter((e) => e.status === "in_progress").length
              }
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cần theo dõi"
              value={medicalEvents.filter((e) => e.follow_up_required).length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Events */}
      {medicalEvents.length > 0 && (
        <Card
          title={
            <div className="flex items-center">
              <HistoryOutlined className="mr-2" />
              <span>Sự kiện gần đây</span>
            </div>
          }
        >
          <Timeline>
            {medicalEvents
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 5)
              .map((event) => (
                <Timeline.Item
                  key={event._id}
                  color={getEventTypeColor(event.event_type)}
                  dot={
                    <Avatar
                      size="small"
                      style={{
                        backgroundColor: getEventTypeColor(event.event_type),
                      }}
                    >
                      {getEventTypeLabel(event.event_type)[0]}
                    </Avatar>
                  }
                >
                  <div className="ml-4">
                    <div className="flex items-center justify-between mb-2">
                      <Text strong className="text-lg">
                        {event.title}
                      </Text>
                      <Text type="secondary" className="text-sm">
                        {new Date(event.createdAt).toLocaleDateString("vi-VN")}
                      </Text>
                    </div>
                    <Paragraph className="text-gray-600 mb-2">
                      {event.description}
                    </Paragraph>
                    <Space>
                      <Tag color={getEventTypeColor(event.event_type)}>
                        {getEventTypeLabel(event.event_type)}
                      </Tag>
                      <Tag color={getSeverityColor(event.severity)}>
                        {getSeverityLabel(event.severity)}
                      </Tag>
                      <Badge
                        status={getStatusColor(event.status) as any}
                        text={getStatusLabel(event.status)}
                      />
                    </Space>
                  </div>
                </Timeline.Item>
              ))}
          </Timeline>
        </Card>
      )}
    </div>
  );

  const DetailedTab = () => (
    <Card
      title={
        <div className="flex items-center">
          <FileTextOutlined className="mr-2" />
          <span>Chi tiết các sự kiện y tế</span>
        </div>
      }
      loading={loading}
    >
      <Table
        dataSource={medicalEvents}
        columns={medicalEventColumns}
        rowKey="_id"
        expandable={{
          expandedRowRender,
          expandIcon: ({ expanded, onExpand, record }) => (
            <Tooltip title={expanded ? "Thu gọn" : "Xem chi tiết"}>
              <Button
                type="text"
                size="small"
                onClick={(e) => onExpand(record, e)}
                icon={<InfoCircleOutlined />}
                className="text-blue-600 hover:text-blue-800"
              >
                {expanded ? "Thu gọn" : "Chi tiết"}
              </Button>
            </Tooltip>
          ),
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trong tổng số ${total} sự kiện`,
          showQuickJumper: true,
        }}
        className="medical-events-table"
      />
    </Card>
  );

  const TimelineTab = () => (
    <Card
      title={
        <div className="flex items-center">
          <ClockCircleOutlined className="mr-2" />
          <span>Dòng thời gian y tế</span>
        </div>
      }
    >
      <Timeline mode="alternate">
        {medicalEvents
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .map((event, index) => (
            <Timeline.Item
              key={event._id}
              color={getEventTypeColor(event.event_type)}
              label={
                <div className="text-center">
                  <Text strong>
                    {new Date(event.createdAt).toLocaleDateString("vi-VN")}
                  </Text>
                  <br />
                  <Text type="secondary" className="text-xs">
                    {new Date(event.createdAt).toLocaleTimeString("vi-VN")}
                  </Text>
                </div>
              }
            >
              <Card size="small" className="shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <Text strong className="text-base">
                    {event.title}
                  </Text>
                  <Space>
                    <Tag color={getEventTypeColor(event.event_type)}>
                      {getEventTypeLabel(event.event_type)}
                    </Tag>
                    <Tag color={getSeverityColor(event.severity)}>
                      {getSeverityLabel(event.severity)}
                    </Tag>
                  </Space>
                </div>
                <Paragraph className="text-gray-600 mb-2">
                  {event.description}
                </Paragraph>
                <div className="flex items-center justify-between">
                  <Badge
                    status={getStatusColor(event.status) as any}
                    text={getStatusLabel(event.status)}
                  />
                  {event.follow_up_required && (
                    <Tag color="orange">
                      <ClockCircleOutlined className="mr-1" />
                      Cần theo dõi
                    </Tag>
                  )}
                </div>
              </Card>
            </Timeline.Item>
          ))}
      </Timeline>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {medicalEvents.length > 0 ? (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            className="medical-history-tabs"
          >
            <TabPane
              tab={
                <span>
                  <TrophyOutlined />
                  Tổng quan
                </span>
              }
              key="overview"
            >
              <OverviewTab />
            </TabPane>

            <TabPane
              tab={
                <span>
                  <FileTextOutlined />
                  Chi tiết
                </span>
              }
              key="detailed"
            >
              <DetailedTab />
            </TabPane>

            <TabPane
              tab={
                <span>
                  <ClockCircleOutlined />
                  Dòng thời gian
                </span>
              }
              key="timeline"
            >
              <TimelineTab />
            </TabPane>
          </Tabs>
        ) : (
          <Card className="text-center py-16">
            <Empty
              image={
                <div className="text-center">
                  <HeartOutlined className="text-6xl text-green-500 mb-4" />
                </div>
              }
              imageStyle={{ height: 100 }}
              description={
                <div>
                  <Title level={3} className="text-green-600 mb-2">
                    Chúc mừng! Bạn có sức khỏe tốt
                  </Title>
                  <Paragraph className="text-gray-600 text-lg">
                    Hiện tại bạn chưa có sự kiện y tế nào được ghi nhận trong hệ
                    thống.
                    <br />
                    Hãy tiếp tục duy trì lối sống lành mạnh và chăm sóc sức khỏe
                    tốt nhé!
                  </Paragraph>
                </div>
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentMedicalHistory;
