import api from './axiosInstance';
 
export const updateConfigurationValue = (key: string, isEnabled: boolean) =>
  api.put('/Configuration', null, {
    params: { key, isEnabled },
});