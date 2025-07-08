// Debug script để test API campaigns với authentication
const token = prompt('Nhập JWT token từ localStorage:');

if (!token) {
  console.error('Cần JWT token để test API');
} else {
  console.log('Testing APIs với token...');
  
  // Test Nurse API
  fetch('/nurse/health-check-campaigns', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log('=== NURSE API RESPONSE ===');
    console.log('Success:', data.success);
    console.log('Count:', data.data?.length || 0);
    if (data.data) {
      data.data.forEach((c, i) => {
        console.log(`${i+1}. ${c.title} (${c.campaign_type}, ${c.status})`);
      });
    }
  })
  .catch(err => console.error('Nurse API Error:', err));

  // Test Parent API  
  fetch('/parent/campaigns', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log('\n=== PARENT API RESPONSE ===');
    console.log('Success:', data.success);
    console.log('Count:', data.data?.length || 0);
    if (data.data) {
      data.data.forEach((c, i) => {
        console.log(`${i+1}. ${c.title} (${c.campaign_type}, ${c.status})`);
      });
    }
  })
  .catch(err => console.error('Parent API Error:', err));
}
