import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockGoodnessDeleteMany = mock();
const mockBadnessDeleteMany = mock();
const mockAuditLogCreate = mock();

mock.module("@/libs/prisma", () => ({
  prisma: {
    goodnessIndividual: {
      deleteMany: mockGoodnessDeleteMany,
    },
    badnessIndividual: {
      deleteMany: mockBadnessDeleteMany,
    },
    auditLog: {
      create: mockAuditLogCreate,
    },
  },
}));

const { GoodnessService } = await import("@/modules/goodness-individual/service");
const { BadnessService } = await import("@/modules/badness-individual/service");

describe("GoodnessService.resetAllRecords", () => {
  beforeEach(() => {
    mockGoodnessDeleteMany.mockReset();
    mockAuditLogCreate.mockReset();
  });

  it("deletes all goodness records and creates an audit log entry", async () => {
    mockGoodnessDeleteMany.mockResolvedValueOnce({ count: 8 });
    mockAuditLogCreate.mockResolvedValueOnce({ id: "audit-1" });

    const result = await GoodnessService.resetAllRecords("admin");

    expect(mockGoodnessDeleteMany).toHaveBeenCalledWith({});
    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: {
        action: "RESET_ALL_GOODNESS_RECORDS",
        model: "GoodnessIndividual",
        detail: "Reset all goodness summary records (8 records)",
        oldValue: "8",
        newValue: "0",
        createdBy: "admin",
      },
    });
    expect(result).toEqual({ deleted: 8 });
  });
});

describe("BadnessService.resetAllRecords", () => {
  beforeEach(() => {
    mockBadnessDeleteMany.mockReset();
    mockAuditLogCreate.mockReset();
  });

  it("deletes all badness records and creates an audit log entry", async () => {
    mockBadnessDeleteMany.mockResolvedValueOnce({ count: 5 });
    mockAuditLogCreate.mockResolvedValueOnce({ id: "audit-2" });

    const result = await BadnessService.resetAllRecords("admin");

    expect(mockBadnessDeleteMany).toHaveBeenCalledWith({});
    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: {
        action: "RESET_ALL_BADNESS_RECORDS",
        model: "BadnessIndividual",
        detail: "Reset all badness summary records (5 records)",
        oldValue: "5",
        newValue: "0",
        createdBy: "admin",
      },
    });
    expect(result).toEqual({ deleted: 5 });
  });
});