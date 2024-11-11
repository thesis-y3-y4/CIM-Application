import axios from 'axios';
import {API_BASE_URL} from '@env';

export async function fetchUser(endpoint, userData) {
  try {
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, userData);
    return response;
  } catch (error) {
    console.error('Api Error fetching data:', error);
    throw error;
  }
}

export async function fetchData(endpoint, token, method = 'POST', data = {}) {
  try {
    const response = await axios({
      url: `${API_BASE_URL}${endpoint}`,
      method: method,
      headers: {
        Authorization: token,
      },
      data: method === 'POST' ? data : null,
    });
    return response;
  } catch (error) {
    console.error('API Error fetching data:', error);
    throw error;
  }
}

export async function updateProfilePicture(downloadURL, token) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/updateprofilepicture`,
      {url: downloadURL},
      {
        headers: {
          Authorization: `${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
}
