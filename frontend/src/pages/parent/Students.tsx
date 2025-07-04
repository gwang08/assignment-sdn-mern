import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Typography, Avatar, Modal, Descriptions, message } from 'antd';
import { UserOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Student } from '../../types';
import apiService from '../../services/api';

const { Title, Text } = Typography;

const ParentStudents: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getParentStudents();
      
      if (response.success && response.data) {
        // API trả về mảng các object với format: { student: {...}, relationship: "...", is_emergency_contact: ... }
        // Chúng ta cần extract ra các student objects
        const studentData = response.data.map((item: any) => item.student);
        setStudents(studentData);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      message.error('Có lỗi xảy ra khi tải danh sách học sinh');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
  };

  const columns: ColumnsType<Student> = [
    {
      title: 'Ảnh',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: () => <Avatar size={40} icon={<UserOutlined />} />
    },
    {
      title: 'Mã học sinh',
      dataIndex: 'student_id',
      key: 'student_id',
      render: (studentId: string) => studentId || 'Chưa có'
    },
    {
      title: 'Họ tên',
      key: 'full_name',
      render: (_, record) => `${record.first_name} ${record.last_name}`
    },
    {
      title: 'Lớp',
      dataIndex: 'class_name',
      key: 'class_name',
      render: (className: string) => <Tag color="blue">{className}</Tag>
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => {
        const genderLabels = {
          male: 'Nam',
          female: 'Nữ',
          other: 'Khác'
        };
        return genderLabels[gender as keyof typeof genderLabels] || gender;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>Con Em Của Tôi</Title>
        <Text type="secondary">Quản lý thông tin con em học tại trường</Text>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={students}
          loading={loading}
          rowKey="_id"
          pagination={{
            total: students.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} học sinh`,
          }}
        />
      </Card>

      <Modal
        title="Thông tin chi tiết học sinh"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedStudent && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Mã học sinh" span={2}>
              {selectedStudent.student_id || 'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Họ và tên">
              {`${selectedStudent.first_name} ${selectedStudent.last_name}`}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {selectedStudent.gender === 'male' ? 'Nam' : 
               selectedStudent.gender === 'female' ? 'Nữ' : 
               selectedStudent.gender === 'other' ? 'Khác' : selectedStudent.gender}
            </Descriptions.Item>
            <Descriptions.Item label="Lớp">
              {selectedStudent.class_name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedStudent.email || 'Chưa có email'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={2}>
              <Tag color={selectedStudent.is_active ? 'green' : 'red'}>
                {selectedStudent.is_active ? 'Đang học' : 'Tạm nghỉ'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ParentStudents;
