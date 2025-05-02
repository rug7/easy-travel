export const sendEmail = async (emailData) => {
    // This would be an API call to your backend service
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    
    return await response.json();
  };