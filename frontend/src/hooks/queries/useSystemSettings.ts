import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';
import { authConfig } from '@/configs/auth';
import siteConfig from '@/configs/siteConfig';

export interface SystemSettingsData {
  id?: string;
  collegeAcronym: string;
  collegeName: string;
  collegeNameEn: string;
  securityEmail: string;
  primaryDataResidency: string;
  primaryServerDetail: string;
  drRegion: string;
  systemUptime: string;
  latestAuditCycle: string;
  latestAuditMonth: string;
}

const systemSettingsEndpoint = authConfig.systemSettingsEndpoint || '/api/system-settings';

export function useSystemSettings() {
  const queryClient = useQueryClient();

  const fallbackSettings: SystemSettingsData = {
    collegeAcronym: siteConfig.acronym,
    collegeName: siteConfig.name,
    collegeNameEn: siteConfig.nameEn,
    securityEmail: siteConfig.securityEmail,
    primaryDataResidency: siteConfig.dataResidency.primaryLocation,
    primaryServerDetail: siteConfig.dataResidency.primaryServer,
    drRegion: siteConfig.dataResidency.drRegion,
    systemUptime: siteConfig.systemUptime,
    latestAuditCycle: siteConfig.latestAuditCycle,
    latestAuditMonth: siteConfig.latestAuditMonth,
  };

  const query = useQuery<SystemSettingsData>({
    queryKey: queryKeys.systemSettings.config(),
    queryFn: async () => {
      try {
        const response = await httpClient.get(systemSettingsEndpoint);
        if (response.data && response.data.success && response.data.data) {
          return response.data.data;
        }
        return response.data || fallbackSettings;
      } catch (error) {
        console.warn('Failed to fetch system settings from DB, using fallback config:', error);
        return fallbackSettings;
      }
    },
    placeholderData: fallbackSettings,
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SystemSettingsData>) => {
      const response = await httpClient.put(systemSettingsEndpoint, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.systemSettings.all });
    },
  });

  return {
    settings: query.data || fallbackSettings,
    isLoading: query.isLoading,
    isError: query.isError,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export default useSystemSettings;
