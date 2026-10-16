Requires bun canary as of 2026-Oct-16 as bun fmt and bun lint is only availbale in canary version

```txt
bun install
bun run dev
```

```txt
bun run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
bun run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```
