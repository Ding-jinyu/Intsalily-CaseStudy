import axios from 'axios';

export const getAIMessage = async (userQuery) => {
  console.log('Sending user query to backend:', userQuery);
  try {
    const response = await axios.post('http://localhost:5001/api/message', { message: userQuery });
    console.log('Received response from backend:', response);
    return response.data;
  } catch (error) {
    console.error('Error getting AI message:', error);
    return { role: 'assistant', content: 'Sorry, something went wrong!' };
  }
};