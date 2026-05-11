import { describe, it, expect, beforeEach } from 'vitest';
import { Cache, createCache, createLRU, get, set, has } from '../src/index';

describe('Cache', () => {
  let cache: Cache;
  beforeEach(() => { cache = createCache({ maxSize: 10 }); });
  it('creates cache', () => { expect(cache).toBeDefined(); });
  it('has set/get', () => { 
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });
});

describe('createLRU', () => {
  it('creates LRU cache', () => {
    const lru = createLRU(5);
    expect(lru).toBeDefined();
  });
});
