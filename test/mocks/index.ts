import { vi } from 'vitest';
import './request';

vi.mock(import('@libchat/service/support/audit/util'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    addAuditLog: vi.fn()
  };
});
