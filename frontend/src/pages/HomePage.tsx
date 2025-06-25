import React from 'react';
import { Card, Row, Col, Typography, Button, Space, Carousel, Timeline, Statistic } from 'antd';
import {
  HeartOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const HomePage: React.FC = () => {
  const healthTips = [
    {
      title: 'Dinh dưỡng học đường',
      content: 'Hướng dẫn dinh dưỡng cân bằng cho học sinh, thực đơn hàng ngày và các loại thực phẩm nên ăn.',
      image: '/images/nutrition.jpg'
    },
    {
      title: 'Phòng chống dịch bệnh',
      content: 'Các biện pháp phòng ngừa và xử lý khi có dịch bệnh trong trường học, cách vệ sinh cá nhân.',
      image: '/images/prevention.jpg'
    },
    {
      title: 'An toàn học đường',
      content: 'Hướng dẫn an toàn khi tham gia các hoạt động thể thao, vui chơi và học tập tại trường.',
      image: '/images/safety.jpg'
    }
  ];

  const services = [
    {
      icon: <HeartOutlined className="text-4xl text-red-500" />,
      title: 'Kiểm tra sức khỏe định kỳ',
      description: 'Thực hiện kiểm tra sức khỏe toàn diện cho học sinh theo quy định của Bộ Y tế'
    },
    {
      icon: <MedicineBoxOutlined className="text-4xl text-blue-500" />,
      title: 'Chăm sóc y tế hàng ngày',
      description: 'Xử lý các tình huống y tế phát sinh, cấp cứu và chăm sóc học sinh bị ốm'
    },
    {
      icon: <SafetyOutlined className="text-4xl text-green-500" />,
      title: 'Tiêm chủng và phòng bệnh',
      description: 'Thực hiện các chiến dịch tiêm chủng, tư vấn và giáo dục sức khỏe'
    },
    {
      icon: <TeamOutlined className="text-4xl text-purple-500" />,
      title: 'Tư vấn sức khỏe',
      description: 'Tư vấn dinh dưỡng, tâm lý và sức khỏe sinh sản cho học sinh'
    }
  ];

  const news = [
    {
      date: '2025-06-20',
      title: 'Triển khai chiến dịch tiêm vaccine HPV cho học sinh lớp 6',
      status: 'Đang thực hiện'
    },
    {
      date: '2025-06-15',
      title: 'Kiểm tra sức khỏe định kỳ học kỳ II năm học 2024-2025',
      status: 'Hoàn thành'
    },
    {
      date: '2025-06-10',
      title: 'Tập huấn sơ cấp cứu cho giáo viên và học sinh',
      status: 'Hoàn thành'
    },
    {
      date: '2025-06-05',
      title: 'Khám và tư vấn dinh dưỡng cho học sinh suy dinh dưỡng',
      status: 'Đang theo dõi'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white">
        <Row align="middle" gutter={[32, 32]}>
          <Col xs={24} lg={12}>
            <Space direction="vertical" size="large" className="w-full">
              <Title level={1} className="text-white m-0">
                Hệ thống Y tế Học đường
              </Title>
              <Title level={3} className="text-blue-100 font-normal">
                Trường THPT ABC
              </Title>
              <Paragraph className="text-blue-100 text-lg">
                Chăm sóc sức khỏe toàn diện cho học sinh với đội ngũ y bác sĩ chuyên nghiệp, 
                trang thiết bị hiện đại và quy trình chăm sóc khoa học.
              </Paragraph>
              <Space>
                <Button type="primary" size="large" className="bg-white text-blue-600 border-0">
                  Tìm hiểu thêm
                  <ArrowRightOutlined />
                </Button>
                <Button size="large" className="text-white border-white hover:bg-white hover:text-blue-600">
                  Liên hệ ngay
                </Button>
              </Space>
            </Space>
          </Col>
          <Col xs={24} lg={12}>
            <div className="text-center">
              <HeartOutlined className="text-8xl text-white opacity-20" />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Học sinh"
              value={1234}
              valueStyle={{ color: '#3f8600' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Sự kiện y tế/tháng"
              value={45}
              valueStyle={{ color: '#cf1322' }}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Chiến dịch tiêm chủng"
              value={12}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Tỷ lệ khỏe mạnh"
              value={98.5}
              precision={1}
              valueStyle={{ color: '#722ed1' }}
              suffix="%"
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Services */}
      <Card title={
        <Title level={2} className="m-0">
          <HeartOutlined className="text-red-500 mr-2" />
          Dịch vụ y tế
        </Title>
      }>
        <Row gutter={[24, 24]}>
          {services.map((service, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card hoverable className="h-full text-center">
                <Space direction="vertical" size="large" className="w-full">
                  {service.icon}
                  <Title level={4}>{service.title}</Title>
                  <Paragraph className="text-gray-600">
                    {service.description}
                  </Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Health Tips */}
      <Card title={
        <Title level={2} className="m-0">
          <FileTextOutlined className="text-blue-500 mr-2" />
          Tài liệu sức khỏe học đường
        </Title>
      }>
        <Carousel autoplay dots={{ className: 'custom-dots' }}>
          {healthTips.map((tip, index) => (
            <div key={index}>
              <Card className="m-2">
                <Row gutter={[24, 24]} align="middle">
                  <Col xs={24} md={8}>
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <FileTextOutlined className="text-6xl text-blue-500" />
                    </div>
                  </Col>
                  <Col xs={24} md={16}>
                    <Space direction="vertical" size="middle" className="w-full">
                      <Title level={3} className="text-blue-600">
                        {tip.title}
                      </Title>
                      <Paragraph className="text-gray-600 text-lg">
                        {tip.content}
                      </Paragraph>
                      <Button type="primary" className="bg-blue-500">
                        Xem chi tiết
                        <ArrowRightOutlined />
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </div>
          ))}
        </Carousel>
      </Card>

      {/* News & Activities */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title={
            <Title level={3} className="m-0">
              <CalendarOutlined className="text-green-500 mr-2" />
              Hoạt động y tế gần đây
            </Title>
          }>
            <Timeline>
              {news.map((item, index) => (
                <Timeline.Item 
                  key={index}
                  color={item.status === 'Hoàn thành' ? 'green' : item.status === 'Đang thực hiện' ? 'blue' : 'orange'}
                >
                  <div className="space-y-1">
                    <Text strong className="text-lg">{item.title}</Text>
                    <div className="space-x-4">
                      <Text type="secondary">{item.date}</Text>
                      <Text className={
                        item.status === 'Hoàn thành' ? 'text-green-600' : 
                        item.status === 'Đang thực hiện' ? 'text-blue-600' : 'text-orange-600'
                      }>
                        {item.status}
                      </Text>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title={
            <Title level={3} className="m-0">
              <PhoneOutlined className="text-red-500 mr-2" />
              Thông tin liên hệ
            </Title>
          }>
            <Space direction="vertical" size="large" className="w-full">
              <div>
                <Title level={5}>Phòng Y tế Trường THPT ABC</Title>
                <Space direction="vertical" size="small">
                  <div className="flex items-center space-x-2">
                    <EnvironmentOutlined className="text-gray-500" />
                    <Text>123 Đường ABC, Quận XYZ, TP.HCM</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PhoneOutlined className="text-gray-500" />
                    <Text>Hotline: 0123 456 789</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MailOutlined className="text-gray-500" />
                    <Text>Email: phongyte@thptabc.edu.vn</Text>
                  </div>
                </Space>
              </div>
              
              <div>
                <Title level={5}>Giờ làm việc</Title>
                <Space direction="vertical" size="small">
                  <Text>Thứ 2 - Thứ 6: 7:00 - 17:00</Text>
                  <Text>Thứ 7: 7:00 - 11:00</Text>
                  <Text className="text-red-500">Chủ nhật: Nghỉ</Text>
                </Space>
              </div>
              
              <Button type="primary" block size="large" className="bg-red-500 border-red-500">
                <PhoneOutlined />
                Gọi ngay
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
