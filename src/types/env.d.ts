// Extend auto-generated CloudflareEnv with our D1 and R2 bindings
declare interface CloudflareEnv {
  DB: D1Database;
  PHOTOS: R2Bucket;
}
