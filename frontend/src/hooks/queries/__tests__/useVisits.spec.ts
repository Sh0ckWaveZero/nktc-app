import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useVisits, useVisit, useStudentVisits, useCreateVisit, useUpdateVisit, useDeleteVisit } from '../useVisits';
import httpClient from '@/@core/utils/http';

vi.mock('@/@core/utils/http');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

const visitPayload = {
  studentKey: 'student-1',
  studentId: 'S1',
  classroomId: 'class-1',
  visitDate: '2026-05-29',
  images: ['img-1', 'img-2', 'img-3'],
};

describe('useVisits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('useVisits', () => {
    it('should fetch visits list', async () => {
      const mockData = [{ id: '1', studentId: 'S1', visitDate: new Date() }];
      vi.mocked(httpClient.get).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useVisits(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useVisit', () => {
    it('should fetch visit by ID', async () => {
      const mockData = { id: '1', studentId: 'S1', visitDate: new Date() };
      vi.mocked(httpClient.get).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useVisit('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should not fetch when visitId is empty', () => {
      const { result } = renderHook(() => useVisit(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useStudentVisits', () => {
    it('should fetch visits for student', async () => {
      const mockData = [{ id: '1', studentId: 'S1', visitDate: new Date() }];
      vi.mocked(httpClient.get).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useStudentVisits('S1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should not fetch when studentId is empty', () => {
      const { result } = renderHook(() => useStudentVisits(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useCreateVisit', () => {
    it('should create visit record', async () => {
      const mockData = { id: '1', studentId: 'S1' };
      vi.mocked(httpClient.post).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useCreateVisit(), { wrapper });

      result.current.mutate(visitPayload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useUpdateVisit', () => {
    it('should update visit record', async () => {
      const mockData = { id: '1', studentId: 'S1' };
      vi.mocked(httpClient.put).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useUpdateVisit(), { wrapper });

      result.current.mutate({ visitId: '1', params: visitPayload });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useDeleteVisit', () => {
    it('should delete visit record', async () => {
      vi.mocked(httpClient.delete).mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useDeleteVisit(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
