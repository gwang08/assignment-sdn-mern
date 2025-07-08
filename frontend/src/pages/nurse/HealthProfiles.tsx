import { EyeOutlined, HeartOutlined, SafetyOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Input,
  List,
  message,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import { nurseService } from "../../services/api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// INTERFACES
interface Allergy {
  name: string;
  severity: "mild" | "moderate" | "severe";
  notes?: string;
}

interface ChronicDisease {
  name: string;
  diagnosedDate?: string;
  status: "active" | "inactive" | "resolved";
  notes?: string;
}

interface TreatmentRecord {
  condition: string;
  treatmentDate: string;
  treatment?: string;
  outcome?: string;
}

interface Vision {
  leftEye?: number;
  rightEye?: number;
  lastCheckDate?: string;
}

interface Hearing {
  leftEar?: string;
  rightEar?: string;
  lastCheckDate?: string;
}

interface VaccinationRecord {
  vaccine_name: string;
  date_administered: string;
  dose_number: number;
  administered_by: string;
  lot_number?: string;
  expiration_date?: string;
  notes?: string;
}

interface Student {
  _id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  gender: string;
  dateOfBirth: string;
}

interface HealthProfile {
  _id: string;
  student?: Student | string;
  allergies?: Allergy[];
  chronicDiseases?: ChronicDisease[];
  treatmentHistory?: TreatmentRecord[];
  medications?: string[];
  medical_history?: string[];
  vision?: Vision;
  hearing?: Hearing;
  vaccination_records?: VaccinationRecord[];
  createdAt: string;
  updatedAt: string;
}

const HealthProfilesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<HealthProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchClass, setSearchClass] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await nurseService.getAllHealthProfiles();
      if (response.success) {
        setProfiles(response.data ?? []);
      }
    } catch {
      message.error("Lỗi khi tải hồ sơ sức khỏe");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (profile: HealthProfile) => {
    setSelectedProfile(profile);
    setIsDrawerVisible(true);
  };

  const filteredProfiles = profiles.filter((profile) => {
    const student = profile.student as Student;
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const className = student.class_name.toLowerCase();
    return (
      fullName.includes(searchName.toLowerCase()) &&
      className.includes(searchClass.toLowerCase())
    );
  });

  const columns: ColumnsType<HealthProfile> = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 70,
      align: "center",
    },
    {
      title: "Họ tên",
      dataIndex: "student",
      key: "fullName",
      render: (student: Student) => (
        <strong>{student?.first_name} {student?.last_name}</strong>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "student",
      key: "class",
      align: "center",
      width: "20%",
      render: (student: Student) => <span>{student?.class_name}</span>,
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: "25%",
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => handleViewProfile(record)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>
        <HeartOutlined className="mr-2" />
        Hồ sơ sức khỏe học sinh
      </Title>
      <Card className="mb-4">
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <p style={{ margin: 0, fontWeight: 500 }}>Tìm kiếm:</p>
          <Input
            placeholder="Tìm theo tên học sinh"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            allowClear
            style={{ width: 250 }}
          />
          <Input
            placeholder="Tìm theo lớp"
            value={searchClass}
            onChange={(e) => setSearchClass(e.target.value)}
            allowClear
            style={{ width: 250 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredProfiles}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Drawer
        title="Chi tiết hồ sơ sức khỏe"
        open={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        width={800}
      >
        {selectedProfile && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Tổng quan" key="1">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Họ tên">
                  {(selectedProfile.student as Student)?.first_name}{" "}
                  {(selectedProfile.student as Student)?.last_name}
                </Descriptions.Item>
                <Descriptions.Item label="Lớp">
                  {(selectedProfile.student as Student)?.class_name}
                </Descriptions.Item>
                <Descriptions.Item label="Thị lực">
                  Trái: {selectedProfile.vision?.leftEye ?? "N/A"}, Phải: {selectedProfile.vision?.rightEye ?? "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Thính lực">
                  Trái: {selectedProfile.hearing?.leftEar ?? "N/A"}, Phải: {selectedProfile.hearing?.rightEar ?? "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Dị ứng & Bệnh mãn tính" key="2">
              <Card title="Dị ứng" size="small">
                {selectedProfile.allergies?.length ? (
                  selectedProfile.allergies.map((a, i) => (
                    <Tag key={i} color="red">
                      {a.name} ({a.severity})
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">Không có</Text>
                )}
              </Card>
              <Card title="Bệnh mãn tính" size="small" className="mt-4">
                {selectedProfile.chronicDiseases?.length ? (
                  selectedProfile.chronicDiseases.map((c, i) => (
                    <Tag key={i} color="orange">
                      {c.name} ({c.status})
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">Không có</Text>
                )}
              </Card>
            </TabPane>

            <TabPane tab="Tiền sử & Điều trị" key="3">
              <Card title="Tiền sử bệnh" size="small">
                <List
                  dataSource={selectedProfile.medical_history || []}
                  renderItem={(item, i) => <List.Item>{item}</List.Item>}
                />
              </Card>
              <Card title="Lịch sử điều trị" size="small" className="mt-4">
                <List
                  dataSource={selectedProfile.treatmentHistory || []}
                  renderItem={(t, i) => (
                    <List.Item>
                      <div>
                        <Text strong>{t.condition}</Text> -{" "}
                        {new Date(t.treatmentDate).toLocaleDateString("vi-VN")}
                        <br />
                        {t.treatment && <Text>Điều trị: {t.treatment}</Text>}
                        <br />
                        {t.outcome && <Text>Kết quả: {t.outcome}</Text>}
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </TabPane>

            <TabPane tab="Tiêm chủng" key="4">
              <Card>
                <List
                  dataSource={selectedProfile.vaccination_records || []}
                  renderItem={(v, i) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<SafetyOutlined className="text-green-500" />}
                        title={`${v.vaccine_name} (Mũi ${v.dose_number})`}
                        description={
                          <div>
                            <Text>
                              Ngày tiêm:{" "}
                              {new Date(v.date_administered).toLocaleDateString("vi-VN")}
                            </Text>
                            <br />
                            <Text>Người tiêm: {v.administered_by}</Text>
                            {v.notes && (
                              <>
                                <br />
                                <Text type="secondary">Ghi chú: {v.notes}</Text>
                              </>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  );
};

export default HealthProfilesPage;
