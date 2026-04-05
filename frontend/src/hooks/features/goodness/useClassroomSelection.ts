import { useMemo, useCallback } from 'react';

interface UseClassroomSelectionParams {
  studentsList: any[];
  selectClassrooms: any[];
  onSelectionModelChange: (newSelection: any[]) => void;
}

interface UseClassroomSelectionReturn {
  rowSelectionModel: {
    type: 'include';
    ids: Set<string>;
  };
  handleSelectionChange: (newSelection: any) => void;
}

/**
 * Custom hook for managing cross-classroom student selection
 * Handles selection model derivation and preserves selections from other classrooms
 */
export const useClassroomSelection = ({
  studentsList,
  selectClassrooms,
  onSelectionModelChange,
}: UseClassroomSelectionParams): UseClassroomSelectionReturn => {
  // Derive row selection model from props (MUI X v8+ format)
  const rowSelectionModel = useMemo(() => {
    if (!selectClassrooms || !Array.isArray(selectClassrooms)) {
      return { type: 'include' as const, ids: new Set<string>() };
    }

    const filtered = selectClassrooms.filter((s: any) => s?.id != null);
    const ids = filtered.map((s: any) => String(s.id));

    return { type: 'include' as const, ids: new Set(ids.filter(Boolean)) };
  }, [selectClassrooms]);

  // Handle selection changes with cross-classroom preservation
  const handleSelectionChange = useCallback(
    (newSelection: any) => {
      if (newSelection == null) {
        onSelectionModelChange([]);
        return;
      }

      // Extract IDs from GridRowSelectionModel format (MUI X v8+)
      // newSelection can be either array of IDs or { type, ids } object
      let idArray: string[];

      if (Array.isArray(newSelection)) {
        // Convert all IDs to strings (handle both string and number IDs)
        idArray = newSelection.map((id) => String(id));
      } else if (typeof newSelection === 'object' && 'ids' in newSelection) {
        // Object format: { type: 'include', ids: Set<string | number> }
        idArray = Array.from(newSelection.ids || []).map((id) => String(id));
      } else {
        idArray = [];
      }

      const validIds = idArray.filter((id) => id != null);
      const selectedIDs = new Set(validIds);

      // Get selected students from current classroom
      const currentRoomSelected = Array.isArray(studentsList)
        ? studentsList.filter((s) => s && s.id && selectedIDs.has(String(s.id)))
        : [];

      // Keep selections from other classrooms
      const otherRoomsSelected = Array.isArray(selectClassrooms)
        ? selectClassrooms.filter((s: any) => {
            if (!s || !s.id) return false;
            if (!Array.isArray(studentsList)) return true;
            return !studentsList.some((sl) => sl && sl.id === s.id);
          })
        : [];

      onSelectionModelChange([...otherRoomsSelected, ...currentRoomSelected]);
    },
    [studentsList, selectClassrooms, onSelectionModelChange],
  );

  return {
    rowSelectionModel,
    handleSelectionChange,
  };
};
