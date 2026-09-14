import { getDb, schema } from './client.ts';

const { db, kind, close } = await getDb();
const v = await db.select().from(schema.verifications);
const a = await db.select().from(schema.auditLog);
console.log('backend:', kind);
console.log('verifications rows:', v.length);
for (const r of v) console.log('  ', r.slug, '|', r.field, '|', r.verifiedBy, '|', r.sourceUrl.slice(0, 40));
console.log('audit rows:', a.length);
await close();
