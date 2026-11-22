import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAcademicYearStore } from '@/store/academic-year';
import { useReportCheckInStore } from '@/store/apps/report-check-in';
import { useActivityCheckInStore } from '@/store/apps/activity-check-in';
import type { ReactElement } from 'react';

import { AcademicYearProvider, useAcademicYear } from '../academic-year-context';

const context = vi.hoisted(() => ({
  data: { activeAcademicYear: 2569, version: 1, years: [2569, 2568].map((academicYear) => ({ academicYear })) },
  refetch: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/hooks/queries/use-academic-years', () => ({
  useAcademicYearsContext: () => ({ data: context.data, refetch: context.refetch, isError: false }),
}));
vi.mock('@/@core/utils/http', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const Probe = (): ReactElement => {
  const scope = useAcademicYear();
  const query = useQuery({
    queryKey: ['year-records'],
    queryFn: async (): Promise<number> => useAcademicYearStore.getState().academicYear ?? 0,
  });
  return (
    <>
      <span data-testid='viewed-year'>{scope.academicYear}</span>
      <span data-testid='records-year'>{query.data}</span>
      <button onClick={(): void => scope.selectYear(2568)}>History</button>
      <button onClick={(): void => scope.selectYear(null)}>Current</button>
    </>
  );
};

describe('academic year scope changes', () => {
  beforeEach(() => {
    useAcademicYearStore.setState({
      academicYear: null,
      activeAcademicYear: null,
      selectedAcademicYear: null,
      version: null,
    });
  });

  it('discards prior-year queries and record stores before mounting the new year', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    client.setQueryData(['year-records'], 2500);
    useReportCheckInStore.setState({ reportCheckIn: { id: 'old' } });
    useActivityCheckInStore.setState({ activityCheckIn: { id: 'old' } });
    render(
      <QueryClientProvider client={client}>
        <AcademicYearProvider>
          <Probe />
        </AcademicYearProvider>
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('records-year')).toHaveTextContent('2569'));
    expect(useReportCheckInStore.getState().reportCheckIn).toBeNull();
    expect(useActivityCheckInStore.getState().activityCheckIn).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'History' }));
    await waitFor(() => expect(screen.getByTestId('records-year')).toHaveTextContent('2568'));
    expect(screen.getByTestId('viewed-year')).toHaveTextContent('2568');
    fireEvent.click(screen.getByRole('button', { name: 'Current' }));
    await waitFor(() => expect(screen.getByTestId('records-year')).toHaveTextContent('2569'));
    expect(useAcademicYearStore.getState().selectedAcademicYear).toBeNull();
    client.clear();
  });
});
