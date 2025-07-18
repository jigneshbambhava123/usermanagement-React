import api from './axiosInstance';

export interface Resource {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  usedQuantity: number;
}

export type CreateResourcePayload = Omit<Resource, 'id' | 'usedQuantity'>;
export type UpdateResourcePayload = Omit<Resource, 'usedQuantity'>;

export const getResources = () => api.get<Resource[]>('/Resource/allresource');
export const getfilterResources = (params: {
  search?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
}) =>
  api.get<{ data: Resource[]; totalCount: number }>('/Resource', {
    params,
  });

export const getResource = (id: number) => api.get<Resource>(`/Resource/${id}`);
export const createResource = (resource: CreateResourcePayload) => api.post('/Resource', resource);
export const updateResource = (resource: UpdateResourcePayload) => api.put('/Resource', resource);
export const deleteResource = (id: number) => api.delete(`/Resource?id=${id}`);
export const updateResourceField = async (
  id: number,
  field: string,
  value: string
) => {
  const payload = { [field]: value };
  return  api.patch(`/Resource?id=${id}`, payload);
};  
