import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { ContactService } from "./contact.service";

function fakeMsg(over: Record<string, unknown> = {}) {
  return { id: "m1", name: "João", email: "joao@x.com", message: "Olá!", read: false, ...over };
}

function fakeModel(stubs: Record<string, unknown> = {}) {
  const chain = {
    sort: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue([]),
    ...stubs,
  };
  return {
    create: vi.fn().mockResolvedValue(fakeMsg()),
    find: vi.fn().mockReturnValue(chain),
    findByIdAndUpdate: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(fakeMsg()) }),
    _chain: chain,
  };
}

describe("ContactService", () => {
  let model: ReturnType<typeof fakeModel>;
  let service: ContactService;

  beforeEach(() => {
    model = fakeModel();
    service = new ContactService(model as never);
  });

  it("creates a contact message and returns it", async () => {
    const dto = { name: "João", email: "joao@x.com", message: "Olá!" };
    const result = await service.create(dto);
    expect(model.create).toHaveBeenCalledWith(dto);
    expect(result.email).toBe("joao@x.com");
  });

  it("lists all messages sorted by createdAt desc", async () => {
    model._chain.exec.mockResolvedValue([fakeMsg(), fakeMsg({ id: "m2" })]);
    const list = await service.listAll();
    expect(model.find).toHaveBeenCalled();
    expect(model._chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(list).toHaveLength(2);
  });

  it("marks a message as read", async () => {
    model.findByIdAndUpdate.mockReturnValue({
      exec: vi.fn().mockResolvedValue(fakeMsg({ read: true })),
    });
    const result = await service.markRead("m1", true);
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith("m1", { read: true }, { new: true });
    expect(result.read).toBe(true);
  });

  it("throws NotFoundException when marking unknown message", async () => {
    model.findByIdAndUpdate.mockReturnValue({ exec: vi.fn().mockResolvedValue(null) });
    await expect(service.markRead("bad-id", true)).rejects.toBeInstanceOf(NotFoundException);
  });
});
