# @creadev.org/cache

> Cache - LRU, TTL cache

[![npm](https://img.shields.io/npm/v/@creadev.org/cache)](https://www.npmjs.com/package/@creadev.org/cache)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Install

```bash
npm install @creadev.org/cache
```

## Usage

```typescript
import { Cache, createCache, createLRU } from '@creadev.org/cache';

const cache = createCache({ maxSize: 100, ttl: 60000 });
await cache.set('key', 'value');
const value = await cache.get('key');
const has = await cache.has('key');
```

## API

| Function | Description |
|----------|-------------|
| `createCache(options?)` | Create TTL cache |
| `createLRU(maxSize)` | Create LRU cache |
| `get(key)` | Get cached value |
| `set(key, value)` | Set cached value |

## License

MIT
trigger
