import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockGoodnessDeleteMany = mock();
const mockBadnessDeleteMany = mock();
const mockAuditLogCreate = mock();
const mockGoodnessCount = mock();
const mockBadnessCount = mock();

mock.module("@/libs/prisma", () => ({
  prisma: {
    goodnessIndividual: {
      count: mockGoodnessCount,
      deleteMany: mockGoodnessDeleteMany,
    },
    badnessIndividual: {
      count: mockBadnessCount,
      deleteMany: mockBadnessDeleteMany,
    },
    auditLog: {
      create: mockAuditLogCreate,
    },
    $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
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
    mockGoodnessCount.mockResolvedValueOnce(8);
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
    mockBadnessCount.mockResolvedValueOnce(5);
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
