import { describe, it, expect } from 'vitest';
import { Cache, createCache } from '../src/index';

describe('Cache', () => {
  it('creates cache', () => {
    const cache = createCache();
    expect(cache).toBeDefined();
  });
});
