import axios from 'axios';

export default {
  getDomain: async () => {
    try {
      const { data } = await axios.get(
        'https://www.1secmail.com/api/v1/?action=getDomainList'
      );
      return data;
    } catch (error) {
      throw error;
    }
  },
  getMailBox: async (email) => {
    try {
      const login = email.split('@')[0];
      const domain = email.split('@')[1];
      const { data } = await axios.get(
        `https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`
      );
      return data;
    } catch (error) {
      throw error;
    }
  },
};
