import { describe, it, expect, beforeEach, vi } from "vitest";
import { VisitorService } from "./visitor.service";

function fakeBehavioral() {
  return {
    pagesVisited: ["/", "/projects"],
    projectsViewed: [],
    postsViewed: [],
    timeOnSite: 42,
    tourCompleted: true,
  };
}

function fakeVisitor(over: Record<string, unknown> = {}) {
  return {
    id: "v1",
    name: "Ana",
    email: "ana@x.com",
    isPublic: true,
    consentVersion: "1.0",
    consentDate: new Date(),
    technicalData: { language: "pt-BR", timezone: "America/Sao_Paulo" },
    behavioralData: fakeBehavioral(),
    locationData: { country: "Brazil" },
    interests: ["Nuxt", "NestJS"],
    ...over,
  };
}

function fakeModel() {
  const publicChain = {
    select: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue([]),
  };
  const allChain = {
    sort: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue([]),
  };
  const countChain = { exec: vi.fn().mockResolvedValue(0) };

  return {
    create: vi.fn().mockResolvedValue(fakeVisitor()),
    find: vi.fn((filter?: Record<string, unknown>) => {
      if (filter?.isPublic) return publicChain;
      return allChain;
    }),
    countDocuments: vi.fn().mockReturnValue(countChain),
    _publicChain: publicChain,
    _allChain: allChain,
    _countChain: countChain,
  };
}

describe("VisitorService", () => {
  let model: ReturnType<typeof fakeModel>;
  let service: VisitorService;

  beforeEach(() => {
    model = fakeModel();
    service = new VisitorService(model as never);
  });

  it("creates a visitor and injects consentDate", async () => {
    const dto = {
      name: "Ana",
      email: "ana@x.com",
      isPublic: true,
      consentVersion: "1.0",
      technicalData: {},
      behavioralData: fakeBehavioral(),
      locationData: {},
      interests: [],
    };
    const result = await service.create(dto);
    expect(model.create).toHaveBeenCalledWith(expect.objectContaining({ consentDate: expect.any(Date) }));
    expect(result.name).toBe("Ana");
  });

  it("listPublic filters by isPublic, selects limited fields, limits to 50", async () => {
    model._publicChain.exec.mockResolvedValue([fakeVisitor(), fakeVisitor({ id: "v2" })]);
    const result = await service.listPublic();
    expect(model.find).toHaveBeenCalledWith({ isPublic: true });
    expect(model._publicChain.select).toHaveBeenCalled();
    expect(model._publicChain.limit).toHaveBeenCalledWith(50);
    expect(result).toHaveLength(2);
  });

  it("listAll returns all visitors sorted desc", async () => {
    model._allChain.exec.mockResolvedValue([fakeVisitor(), fakeVisitor({ id: "v2" })]);
    const result = await service.listAll();
    expect(model.find).toHaveBeenCalledWith();
    expect(model._allChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(result).toHaveLength(2);
  });

  it("count returns total document count", async () => {
    model._countChain.exec.mockResolvedValue(7);
    const n = await service.count();
    expect(model.countDocuments).toHaveBeenCalled();
    expect(n).toBe(7);
  });
});
