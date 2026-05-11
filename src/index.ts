/**
 * @creadev.org/cache
 *
 * LRU cache with TTL and metrics.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CacheOptions {
  /** Max entries (default: 1000) */
  maxSize?: number;
  /** Default TTL in ms (default: 3600000 = 1hr) */
  ttl?: number;
}

export interface CacheEntry<T> {
  value: T;
  expiry: number;
  accessCount: number;
  size: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
}

// ============================================================================
// CACHE
// ============================================================================

export class Cache<T = unknown> {
  private cache: Map<string, CacheEntry<T>>;
  private accessOrder: string[];
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private maxSize: number;
  private defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.accessOrder = [];
    this.maxSize = options.maxSize ?? 1000;
    this.defaultTTL = options.ttl ?? 3600000;
  }

  /** Set cache entry */
  set(key: string, value: T, options?: { ttl?: number }): void {
    const ttl = options?.ttl ?? this.defaultTTL;
    const expiry = Date.now() + ttl;

    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evict();
    }

    const entry: CacheEntry<T> = {
      value,
      expiry,
      accessCount: 0,
      size: this.estimateSize(value),
    };

    const existingIdx = this.accessOrder.indexOf(key);
    if (existingIdx >= 0) {
      this.accessOrder.splice(existingIdx, 1);
    }

    this.cache.set(key, entry);
    this.accessOrder.push(key);
  }

  /** Get cache entry */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiry) {
      this.delete(key);
      this.misses++;
      return undefined;
    }

    entry.accessCount++;
    this.hits++;
    return entry.value;
  }

  /** Check if key exists */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiry) {
      this.delete(key);
      return false;
    }
    return true;
  }

  /** Delete entry */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    const idx = this.accessOrder.indexOf(key);
    if (idx >= 0) {
      this.accessOrder.splice(idx, 1);
    }
    return true;
  }

  /** Clear cache */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  /** Evict oldest */
  private evict(): void {
    if (this.accessOrder.length === 0) return;
    const oldestKey = this.accessOrder.shift()!;
    this.cache.delete(oldestKey);
    this.evictions++;
  }

  /** Cleanup expired */
  clean(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of this.cache) {
      if (now > entry.expiry) {
        this.delete(key);
        cleaned++;
      }
    }
    return cleaned;
  }

  /** Get stats */
  stats(): CacheStats {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: this.hits / (this.hits + this.misses) || 0,
    };
  }

  private estimateSize(value: unknown): number {
    if (typeof value === 'string') return value.length;
    return 1;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    const values: T[] = [];
    for (const [key] of this.cache) {
      const value = this.get(key);
      if (value !== undefined) values.push(value);
    }
    return values;
  }
}

// ============================================================================
// FACTORY
// ============================================================================

export function createCache<T>(options?: CacheOptions): Cache<T> {
  return new Cache<T>(options);
}

export class LRU<T> extends Cache<T> {
  constructor(options?: CacheOptions) {
    super(options);
  }
}