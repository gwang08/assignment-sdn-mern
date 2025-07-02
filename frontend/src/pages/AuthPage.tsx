import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Tabs, Row, Col, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LoginRequest, RegisterRequest } from '../types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const AuthPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const { login, register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const onFinishLogin = async (values: any) => {
    setLoading(true);
    clearError();
    
    try {
      const loginData: LoginRequest = {
        username: values.username,
        password: values.password
      };
      
      await login(loginData);
      navigate('/');
    } catch (err) {
      // Error handled in AuthContext
      // Keep form values intact
    } finally {
      setLoading(false);
    }
  };

  // Clear error when user starts typing
  const handleFormChange = () => {
    if (error) {
      clearError();
    }
  };

  const onFinishRegister = async (values: any) => {
    setLoading(true);
    clearError();
    
    try {
      const registerData: RegisterRequest = {
        userData: {
          username: values.username,
          password: values.password,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone_number: values.phone_number,
          gender: values.gender,
        },
        userType: 'parent'
      };
      
      await register(registerData);
      // After successful registration, switch to login tab and reset form
      registerForm.resetFields();
      setActiveTab('login');
      clearError();
    } catch (err) {
      // Error handled in AuthContext
      // Keep form values intact for user to fix
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .ant-form {
          transition: all 0.3s ease;
        }
        
        .ant-alert {
          transition: all 0.3s ease;
        }
      `}</style>
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #e0f2fe 0%, #e8eaf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
      <div style={{ width: '100%', maxWidth: '448px' }}>
        <Card style={{ 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: 'none',
          borderRadius: '16px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              backgroundColor: '#1890ff', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px' 
            }}>
              <UserOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
              Hệ thống Y tế Học đường
            </Title>
            <Text style={{ color: '#888' }}>
              Trường THPT ABC
            </Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              closable
              onClose={clearError}
              style={{ 
                marginBottom: '16px',
                borderRadius: '8px',
                animation: 'fadeIn 0.3s ease-in-out'
              }}
            />
          )}

          <Tabs defaultActiveKey="login" activeKey={activeTab} onChange={setActiveTab} centered>
            <TabPane tab="Đăng nhập" key="login">
              <Form
                form={loginForm}
                name="login"
                onFinish={onFinishLogin}
                onValuesChange={handleFormChange}
                layout="vertical"
                size="large"
                preserve={false}
              >
                <Form.Item
                  name="username"
                  label="Tên đăng nhập"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên đăng nhập!' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập tên đăng nhập"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    style={{ height: '48px' }}
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="Đăng ký (Phụ huynh)" key="register">
              <Form
                form={registerForm}
                name="register"
                onFinish={onFinishRegister}
                onValuesChange={handleFormChange}
                layout="vertical"
                size="large"
                preserve={false}
              >
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      name="first_name"
                      label="Họ"
                      rules={[
                        { required: true, message: 'Vui lòng nhập họ!' }
                      ]}
                    >
                      <Input placeholder="Nhập họ" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="last_name"
                      label="Tên"
                      rules={[
                        { required: true, message: 'Vui lòng nhập tên!' }
                      ]}
                    >
                      <Input placeholder="Nhập tên" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[
                    { required: true, message: 'Vui lòng chọn giới tính!' }
                  ]}
                >
                  <Select placeholder="Chọn giới tính">
                    <Option value="male">Nam</Option>
                    <Option value="female">Nữ</Option>
                    <Option value="other">Khác</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="username"
                  label="Tên đăng nhập"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                    { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập tên đăng nhập"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Nhập email"
                  />
                </Form.Item>

                <Form.Item
                  name="phone_number"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Nhập số điện thoại"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Xác nhận mật khẩu"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    style={{ height: '48px' }}
                  >
                    Đăng ký tài khoản
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Text style={{ color: '#888', fontSize: '14px' }}>
              Cần hỗ trợ? Liên hệ phòng y tế: <Text strong>0123 456 789</Text>
            </Text>
          </div>
        </Card>
      </div>
      </div>
    </>
  );
};

export default AuthPage;
