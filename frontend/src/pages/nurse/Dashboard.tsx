import { Bar } from "@ant-design/charts";
import {
  BarChartOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Space, Statistic, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import nurseService from "../../services/api/nurseService";

const { Title } = Typography;

const EVENT_STATUS_MAP: Record<string, { text: string; color: string }> = {
  Open: { text: "Mở", color: "orange" },
  "In Progress": { text: "Đang xử lý", color: "blue" },
  Resolved: { text: "Đã giải quyết", color: "green" },
  "Referred to Hospital": { text: "Chuyển bệnh viện", color: "red" },
};

const REQUEST_STATUS_MAP: Record<string, { text: string; color: string }> = {
  pending: { text: "Chờ duyệt", color: "orange" },
  approved: { text: "Duyệt", color: "green" },
  rejected: { text: "Từ chối", color: "red" },
  completed: { text: "Hoàn thành", color: "blue"}
};

const NurseDashboard = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await nurseService.getDashboardStats();
      console.log("getDashboardStats", res);
      if (res.success) {
        setData(res.data);
      }
    };
    fetchData();
  }, []);

  const chartData = [
    {
      name: "Sự kiện y tế",
      value: data?.dashboardStats?.totalMedicalEvents || 0,
    },
    {
      name: "Chiến dịch",
      value: data?.dashboardStats?.totalCampaigns || 0,
    },
    {
      name: "Chiến dịch đang diễn ra",
      value: data?.dashboardStats?.activeCampaigns || 0,
    },
    {
      name: "Yêu cầu thuốc",
      value: data?.dashboardStats?.pendingRequests || 0,
    },
    {
      name: "Sự kiện đang hoạt động",
      value: data?.dashboardStats?.activeEvents || 0,
    },
  ];

  const chartConfig = {
    data: chartData,
    xField: "value",
    yField: "name",
    seriesField: "name",
    legend: false,
    color: ({ name }: any) => {
      switch (name) {
        case "Sự kiện y tế":
          return "#5B8FF9";
        case "Chiến dịch":
          return "#61DDAA";
        case "Chiến dịch đang diễn ra":
          return "#65789B";
        case "Yêu cầu thuốc":
          return "#F6BD16";
        case "Sự kiện đang hoạt động":
          return "#FF9D4D";
        default:
          return "#ccc";
      }
    },
    height: 250,
    barWidthRatio: 0.6,
  };

  const columnsEvents = [
    {
      title: "Học sinh",
      dataIndex: "student",
      key: "student",
      render: (student: any) => `${student.last_name} ${student.first_name}`,
    },
    {
      title: "Lớp",
      dataIndex: ["student", "class_name"],
      key: "class_name",
    },
    {
      title: "Loại",
      dataIndex: "event_type",
      key: "event_type",
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      align: "center" as "center",
      render: (status: string) => {
        const statusData = EVENT_STATUS_MAP[status] || {
          text: status,
          color: "default",
        };
        return <Tag color={statusData.color}>{statusData.text}</Tag>;
      },
    },
  ];

  const columnsRequests = [
    {
      title: "Học sinh",
      dataIndex: "student",
      key: "student",
      render: (student: any) => `${student.last_name} ${student.first_name}`,
    },
    {
      title: "Lớp",
      dataIndex: ["student", "class_name"],
      key: "class_name",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center" as "center",
      render: (status: string) => {
        const statusData = REQUEST_STATUS_MAP[status] || {
          text: status,
          color: "default",
        };
        return <Tag color={statusData.color}>{statusData.text}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Card
        style={{
          marginBottom: 20,
          padding: "0 16px",
          height: 60,
          background: "#f0f5ff",
          borderRadius: 12,
          boxShadow: "0 2px 2px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Space
          align="center"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <h4 style={{ margin: 0, fontStyle: "italic" }}>👋 Xin chào:</h4>
          <Title
            level={4}
            style={{ marginBottom: 4, fontSize: 20, color: "#1d39c4" }}
          >
            {data?.nurseInfo?.last_name} {data?.nurseInfo?.first_name}
          </Title>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng sự kiện y tế"
              value={data?.dashboardStats?.totalMedicalEvents || 0}
              prefix={<FileDoneOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng chiến dịch"
              value={data?.dashboardStats?.totalCampaigns || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Chiến dịch đang diễn ra"
              value={data?.dashboardStats?.activeCampaigns || 0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Yêu cầu thuốc chờ duyệt"
              value={
                data?.recentRequests?.filter(
                  (req: any) => req.status === "pending"
                ).length || 0
              }
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Sự kiện đang hoạt động"
              value={data?.dashboardStats?.activeEvents || 0}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>Thống kê tổng quan</Title>
        <Bar {...chartConfig} />
      </Card>

      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Sự kiện y tế gần đây">
            <Table
              dataSource={data?.recentEvents || []}
              columns={columnsEvents}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Yêu cầu thuốc gần đây">
            <Table
              dataSource={data?.recentRequests || []}
              columns={columnsRequests}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NurseDashboard;
