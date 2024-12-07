import axios from 'axios';
const createHeaders = async (deviceId, auth) => {
  const headers = {
    'User-Agent': 'okhttp/4.12.0',
    Connection: 'Keep-Alive',
    'Accept-Encoding': 'gzip',
    deviceId: deviceId,
    'x-kk-buildversion': 'ANDROID-2.0.6',
    model: 'Xiaomi-Redmi Note 8',
  };
  if (auth) {
    headers.Authorization = `Bearer ${auth}`;
  }
  return headers;
};
export const checkEmail = async (deviceId, email) => {
  try {
    const { data } = await axios.get(
      `https://api-main.kipaskipas.com/api/v1/auth/registers/accounts/exists-by?email=${email}`,
      {
        headers: createHeaders(deviceId),
      }
    );
    if (data) {
      return { success: true };
    }
  } catch (error) {
    if (error.response.data.message == 'Data already exists') {
      return { success: false };
    }
    console.error(error);
  }
};
export const requestOtp = async (deviceId, email) => {
  try {
    const { data } = await axios.post(
      'https://api-main.kipaskipas.com/api/v1/auth/otp/email',
      {
        deviceId: deviceId,
        email: email,
        platform: 'EMAIL',
        type: 'REGISTER',
      },
      { headers: createHeaders(deviceId) }
    );
    if (data) {
      return { success: true };
    }
  } catch (error) {
    console.error(error);
    console.log(error.response.data.data);

    return { success: false };
  }
};
export const verifyEmail = async (deviceId, email, otp) => {
  try {
    const { data } = await axios.post(
      'https://api-main.kipaskipas.com/api/v1/auth/otp/verification/email',
      {
        code: otp,
        deviceId: deviceId,
        email: email,
        platform: 'EMAIL',
        type: 'REGISTER',
      },
      {
        headers: createHeaders(deviceId),
      }
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const registeringUser = async (deviceId, dataToRegist) => {
  try {
    const { data } = await axios.post(
      'https://api-main.kipaskipas.com/api/v1/auth/registers',
      {
        ...dataToRegist,
      },
      {
        headers: createHeaders(deviceId),
      }
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const followUser = async (deviceId, auth, targetId) => {
  try {
    const { data } = await axios.patch(
      `https://api-main.kipaskipas.com/api/v1/profile/${targetId}/follow`,
      '',
      {
        headers: {
          'User-Agent': 'okhttp/4.12.0',
          Connection: 'Keep-Alive',
          'Accept-Encoding': 'gzip',
          deviceId: deviceId,
          Authorization: `Bearer ${auth}`,
          'x-kk-buildversion': 'ANDROID-2.0.6',
          model: 'Xiaomi-Redmi Note 8',
          'sentry-trace': 'a46a6dddb0ec4bfe9f94b8ee0f63e2d0-f19db10016044fa2',
          baggage:
            'sentry-environment=prd,sentry-public_key=9ac581eafc4947ffb55167d21888c7c7,sentry-release=com.koanba.kipaskipas%402.0.6%2B335,sentry-trace_id=a46a6dddb0ec4bfe9f94b8ee0f63e2d0',
        },
      }
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
