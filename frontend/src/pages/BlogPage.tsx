import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Input,
  Tag,
  Space,
  Button,
  Divider,
  Avatar,
  List,
  Tabs
} from 'antd';
import {
  HeartOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  LikeOutlined,
  ShareAltOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'nutrition', name: 'Dinh dưỡng', color: 'green', icon: <HeartOutlined /> },
    { id: 'health', name: 'Sức khỏe', color: 'blue', icon: <MedicineBoxOutlined /> },
    { id: 'safety', name: 'An toàn', color: 'red', icon: <SafetyOutlined /> },
    { id: 'education', name: 'Giáo dục', color: 'purple', icon: <BookOutlined /> },
  ];

  const blogPosts = [
    {
      id: 1,
      title: 'Hướng dẫn dinh dưỡng cân bằng cho học sinh tiểu học',
      excerpt: 'Tầm quan trọng của việc cung cấp dinh dưỡng đầy đủ cho sự phát triển toàn diện của trẻ...',
      content: 'Dinh dưỡng cân bằng đóng vai trò quan trọng trong sự phát triển của trẻ em. Một chế độ ăn uống khoa học sẽ giúp trẻ có đủ năng lượng học tập, tăng cường sức đề kháng và phát triển về thể chất lẫn tinh thần.',
      category: 'nutrition',
      author: 'BS. Nguyễn Văn A',
      publishDate: '2024-12-01',
      views: 1250,
      likes: 89,
      image: '/images/nutrition.jpg'
    },
    {
      id: 2,
      title: 'Phòng ngừa cảm cúm mùa ở trẻ em',
      excerpt: 'Các biện pháp phòng ngừa hiệu quả giúp bảo vệ trẻ khỏi bệnh cảm cúm trong mùa lạnh...',
      content: 'Cảm cúm mùa là bệnh phổ biến ở trẻ em, đặc biệt trong môi trường học đường. Việc phòng ngừa bao gồm: vệ sinh tay thường xuyên, đeo khẩu trang, tăng cường dinh dưỡng và tiêm vaccine.',
      category: 'health',
      author: 'ThS. Trần Thị B',
      publishDate: '2024-11-28',
      views: 980,
      likes: 67,
      image: '/images/flu-prevention.jpg'
    },
    {
      id: 3,
      title: 'An toàn thực phẩm trong bữa ăn học đường',
      excerpt: 'Những nguyên tắc cơ bản để đảm bảo an toàn thực phẩm cho học sinh...',
      content: 'An toàn thực phẩm trong trường học là vấn đề được quan tâm hàng đầu. Các nguyên tắc bao gồm: kiểm tra nguồn gốc thực phẩm, bảo quản đúng cách, chế biến an toàn và vệ sinh dụng cụ.',
      category: 'safety',
      author: 'CN. Lê Văn C',
      publishDate: '2024-11-25',
      views: 756,
      likes: 45,
      image: '/images/food-safety.jpg'
    },
    {
      id: 4,
      title: 'Tầm quan trọng của việc kiểm tra thị lực định kỳ',
      excerpt: 'Hướng dẫn phát hiện sớm các vấn đề về thị lực ở trẻ em học đường...',
      content: 'Thị lực là yếu tố quan trọng ảnh hưởng đến khả năng học tập của trẻ. Việc kiểm tra thị lực định kỳ giúp phát hiện sớm các vấn đề như cận thị, viễn thị, loạn thị để có biện pháp điều trị kịp thời.',
      category: 'health',
      author: 'BS. Phạm Thị D',
      publishDate: '2024-11-22',
      views: 632,
      likes: 38,
      image: '/images/vision-check.jpg'
    },
    {
      id: 5,
      title: 'Giáo dục kỹ năng sống cho học sinh',
      excerpt: 'Phương pháp giáo dục kỹ năng sống giúp học sinh tự bảo vệ sức khỏe...',
      content: 'Kỹ năng sống là nền tảng giúp học sinh tự chăm sóc bản thân. Bao gồm: vệ sinh cá nhân, dinh dưỡng, thể dục thể thao, quản lý stress và kỹ năng giao tiếp.',
      category: 'education',
      author: 'Cô Hoàng Thị E',
      publishDate: '2024-11-20',
      views: 890,
      likes: 72,
      image: '/images/life-skills.jpg'
    }
  ];

  const healthDocuments = [
    {
      id: 1,
      title: 'Hướng dẫn sơ cứu cơ bản trong trường học',
      type: 'Tài liệu hướng dẫn',
      downloadUrl: '/docs/first-aid-guide.pdf',
      size: '2.5 MB',
      uploadDate: '2024-11-15'
    },
    {
      id: 2,
      title: 'Biểu mẫu khám sức khỏe định kỳ',
      type: 'Biểu mẫu',
      downloadUrl: '/docs/health-check-form.pdf',
      size: '1.2 MB',
      uploadDate: '2024-11-10'
    },
    {
      id: 3,
      title: 'Quy định về vệ sinh an toàn thực phẩm',
      type: 'Quy định',
      downloadUrl: '/docs/food-safety-regulations.pdf',
      size: '3.8 MB',
      uploadDate: '2024-11-05'
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <Title level={2}>Tài liệu & Blog Y tế Học đường</Title>
        <Paragraph>
          Kho tài liệu và bài viết chia sẻ kiến thức về chăm sóc sức khỏe học sinh
        </Paragraph>
      </div>

      <Tabs defaultActiveKey="blog" size="large">
        <TabPane tab="Blog & Bài viết" key="blog">
          {/* Search and Filter */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col span={12}>
              <Search
                placeholder="Tìm kiếm bài viết..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
              />
            </Col>
            <Col span={12}>
              <Space wrap>
                <Button
                  type={selectedCategory === null ? 'primary' : 'default'}
                  onClick={() => setSelectedCategory(null)}
                >
                  Tất cả
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    type={selectedCategory === category.id ? 'primary' : 'default'}
                    icon={category.icon}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </Space>
            </Col>
          </Row>

          {/* Blog Posts Grid */}
          <Row gutter={[24, 24]}>
            {filteredPosts.map(post => (
              <Col key={post.id} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  cover={
                    <div 
                      style={{ 
                        height: 200, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <HeartOutlined style={{ fontSize: 40, color: 'white' }} />
                    </div>
                  }
                  actions={[
                    <Space key="views">
                      <EyeOutlined />
                      {post.views}
                    </Space>,
                    <Space key="likes">
                      <LikeOutlined />
                      {post.likes}
                    </Space>,
                    <ShareAltOutlined key="share" />
                  ]}
                >
                  <Card.Meta
                    title={
                      <div>
                        <Tag color={categories.find(c => c.id === post.category)?.color}>
                          {categories.find(c => c.id === post.category)?.name}
                        </Tag>
                        <Title level={5} className="mt-2">
                          {post.title}
                        </Title>
                      </div>
                    }
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 3 }}>
                          {post.excerpt}
                        </Paragraph>
                        <Divider />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            <Avatar icon={<UserOutlined />} size="small" />
                            <Text type="secondary">{post.author}</Text>
                          </Space>
                          <Space>
                            <CalendarOutlined />
                            <Text type="secondary">{post.publishDate}</Text>
                          </Space>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        <TabPane tab="Tài liệu tham khảo" key="documents">
          <List
            itemLayout="horizontal"
            dataSource={healthDocuments}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button type="primary" icon={<BookOutlined />}>
                    Tải về
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<BookOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                  title={item.title}
                  description={
                    <Space>
                      <Tag>{item.type}</Tag>
                      <Text type="secondary">Kích thước: {item.size}</Text>
                      <Text type="secondary">Ngày tải lên: {item.uploadDate}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane tab="Hỏi đáp" key="qa">
          <div className="text-center py-12">
            <Title level={3}>Tính năng hỏi đáp</Title>
            <Paragraph>
              Tính năng này đang được phát triển. Sẽ cho phép phụ huynh và học sinh đặt câu hỏi 
              với đội ngũ y tế của trường.
            </Paragraph>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default BlogPage;
