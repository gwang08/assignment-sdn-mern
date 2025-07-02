import { Campaign } from '../types';

// Utility functions to handle backward compatibility for Campaign data
export const getCampaignType = (campaign: Campaign): string => {
  return campaign.type || campaign.campaign_type || 'Unknown';
};

export const getCampaignStatus = (campaign: Campaign): string => {
  if (campaign.status) return campaign.status;
  
  // Infer status from date if not provided
  const campaignDate = new Date(campaign.date || campaign.start_date || '');
  const now = new Date();
  
  if (campaignDate > now) return 'active';
  if (campaignDate < now) return 'completed';
  return 'draft';
};

export const getCampaignStartDate = (campaign: Campaign): string => {
  return campaign.date || campaign.start_date || '';
};

export const getCampaignEndDate = (campaign: Campaign): string => {
  return campaign.date || campaign.end_date || '';
};

export const getCampaignRequiresConsent = (campaign: Campaign): boolean => {
  if (campaign.requires_consent !== undefined) return campaign.requires_consent;
  
  // Vaccination campaigns typically require consent
  return getCampaignType(campaign).toLowerCase().includes('vaccination');
};

export const getCampaignTargetClasses = (campaign: Campaign): string[] => {
  return campaign.target_classes || [];
};

export const getCampaignTypeText = (type?: string): string => {
  if (!type) return 'Không xác định';
  
  const typeMap: { [key: string]: string } = {
    'Vaccination': 'Tiêm chủng',
    'vaccination': 'Tiêm chủng',
    'Checkup': 'Kiểm tra sức khỏe',
    'health_check': 'Kiểm tra sức khỏe',
    'Health_Check': 'Kiểm tra sức khỏe',
    'screening': 'Sàng lọc',
    'Nutrition_Program': 'Chương trình dinh dưỡng',
    'Mental_Health': 'Sức khỏe tâm thần',
    'other': 'Khác'
  };
  
  return typeMap[type] || type;
};

export const getCampaignTypeIcon = (type?: string) => {
  // Return appropriate icon component based on type
  // This would need to be implemented in the component that uses it
  return null;
};

export const getCampaignTypeColor = (type?: string): string => {
  if (!type) return 'default';
  
  const colorMap: { [key: string]: string } = {
    'Vaccination': 'blue',
    'vaccination': 'blue',
    'Checkup': 'green',
    'health_check': 'green',
    'Health_Check': 'green',
    'screening': 'orange',
    'Nutrition_Program': 'purple',
    'Mental_Health': 'cyan',
    'other': 'default'
  };
  
  return colorMap[type] || 'default';
};

export const getStatusText = (status?: string): string => {
  if (!status) return 'Không xác định';
  
  const statusMap: { [key: string]: string } = {
    'draft': 'Bản nháp',
    'active': 'Đang hoạt động',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy'
  };
  
  return statusMap[status] || status;
};

export const getStatusColor = (status?: string): string => {
  if (!status) return 'default';
  
  const colorMap: { [key: string]: string } = {
    'draft': 'orange',
    'active': 'blue',
    'completed': 'green',
    'cancelled': 'red'
  };
  
  return colorMap[status] || 'default';
};
