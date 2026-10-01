import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { recordApplicationReceipt, type BatchItemStatus } from '../../lib/job-queue';
import type { Sql } from '../../lib/job-storage';

export const leaseSchema = z
  .object({
    itemId: z.uuid(),
    workerId: z.string().regex(/^[A-Za-z0-9._:-]{1,100}$/),
    generation: z.string().regex(/^\d+$/),
  })
  .strict();
export type Lease = z.infer<typeof leaseSchema>;
export const claimSchema = leaseSchema.omit({ generation: true });
export const LEASE_SECONDS = 120;

export async function claimItem(owner: string, input: z.infer<typeof claimSchema>, sql: Sql) {
  const { itemId, workerId } = claimSchema.parse(input);
  const rows = await sql`UPDATE job_application_batch_items i SET lease_worker=${workerId},
    lease_expires_at=clock_timestamp()+interval '120 seconds',lease_generation=lease_generation+1,status='preparing',updated_at=clock_timestamp()
    WHERE i.id=${itemId} AND i.owner_id=${owner} AND (i.status IN ('queued','preparing') OR
      i.status='awaiting_approval' AND EXISTS(SELECT 1 FROM job_application_drafts d WHERE d.lead_id=i.lead_id AND d.review_status='approved'))
      AND (i.lease_expires_at IS NULL OR i.lease_expires_at<clock_timestamp())
      AND EXISTS(SELECT 1 FROM job_leads l WHERE l.id=i.lead_id AND l.application_stage IS DISTINCT FROM 'applied')
      AND NOT EXISTS (SELECT 1 FROM jobdesk_submission_attempts a WHERE a.item_id=i.id AND a.state IN ('pending','uncertain','confirmed'))
    RETURNING i.id AS "itemId", i.lease_generation::text AS generation,i.lease_worker AS "workerId",i.lease_expires_at AS "expiresAt"`;
  if (!rows[0])
    throw new Error('Item is unavailable, leased, or requires submission reconciliation.');
  return rows[0];
}

export async function renewLease(owner: string, input: Lease, sql: Sql) {
  const lease = leaseSchema.parse(input);
  const rows =
    await sql`UPDATE job_application_batch_items SET lease_expires_at=clock_timestamp()+interval '120 seconds'
    WHERE id=${lease.itemId} AND owner_id=${owner} AND lease_worker=${lease.workerId}
      AND lease_generation=${lease.generation}::bigint AND lease_expires_at>clock_timestamp() AND status<>'submitted'
    RETURNING lease_expires_at AS "expiresAt"`;
  if (!rows[0]) throw new Error('Lease expired or changed.');
  return rows[0];
}

export async function leaseStatus(
  owner: string,
  input: Lease & { status: BatchItemStatus; note: string },
  sql: Sql,
) {
  const lease = leaseSchema.parse({
    itemId: input.itemId,
    workerId: input.workerId,
    generation: input.generation,
  });
  const status = z
    .enum(['preparing', 'awaiting_approval', 'blocked', 'skipped'])
    .parse(input.status);
  const note = z.string().max(1000).parse(input.note);
  const rows =
    await sql`UPDATE job_application_batch_items i SET status=${status},note=${note},updated_at=clock_timestamp(),
      lease_expires_at=CASE WHEN ${status}='preparing' THEN lease_expires_at ELSE NULL END,
      lease_worker=CASE WHEN ${status}='preparing' THEN lease_worker ELSE NULL END
    WHERE i.id=${lease.itemId} AND i.owner_id=${owner} AND i.lease_worker=${lease.workerId}
      AND i.lease_generation=${lease.generation}::bigint AND i.lease_expires_at>clock_timestamp() AND i.status<>'submitted'
      AND NOT EXISTS (SELECT 1 FROM jobdesk_submission_attempts a WHERE a.item_id=i.id AND a.state IN ('pending','uncertain','confirmed'))
    RETURNING i.id,i.status,i.note`;
  if (!rows[0]) throw new Error('Lease changed or a submission attempt requires reconciliation.');
  return rows[0];
}

/** Called before the worker clicks Submit. An expired attempt never becomes
 * another queued application. It stays durable and must be reconciled. */
export async function beginSubmission(owner: string, input: Lease, sql: Sql) {
  const lease = leaseSchema.parse(input);
  const id = randomUUID();
  const rows =
    await sql`INSERT INTO jobdesk_submission_attempts(id,item_id,owner_id,worker_id,lease_generation,state)
    SELECT ${id},i.id,${owner},${lease.workerId},${lease.generation}::bigint,'pending' FROM job_application_batch_items i
    WHERE i.id=${lease.itemId} AND i.owner_id=${owner} AND i.lease_worker=${lease.workerId}
      AND i.lease_generation=${lease.generation}::bigint AND i.lease_expires_at>clock_timestamp() AND i.status='preparing'
    ON CONFLICT DO NOTHING RETURNING id,state`;
  if (!rows[0]) throw new Error('Submission attempt already exists or the lease changed.');
  return rows[0];
}

export async function markUncertain(owner: string, attemptId: string, note: string, sql: Sql) {
  z.uuid().parse(attemptId);
  z.string().min(1).max(1000).parse(note);
  const rows = await sql`WITH changed AS (
    UPDATE jobdesk_submission_attempts SET state='uncertain',note=${note},updated_at=clock_timestamp()
      WHERE id=${attemptId} AND owner_id=${owner} AND state IN ('pending','uncertain') RETURNING item_id
  ) UPDATE job_application_batch_items i SET status='blocked',note='Submission uncertain; reconcile before further action.',lease_worker=NULL,lease_expires_at=NULL
    FROM changed WHERE i.id=changed.item_id AND i.status<>'submitted' RETURNING i.id`;
  if (!rows[0]) throw new Error('Attempt is unavailable or already reconciled.');
  return rows[0];
}

export async function reconcileNotSubmitted(
  owner: string,
  attemptId: string,
  evidence: string,
  sql: Sql,
) {
  z.uuid().parse(attemptId);
  z.string().min(8).max(1000).parse(evidence);
  const rows =
    await sql`UPDATE jobdesk_submission_attempts SET state='not_submitted',note=${evidence},updated_at=clock_timestamp()
    WHERE id=${attemptId} AND owner_id=${owner} AND state IN ('pending','uncertain') RETURNING item_id AS "itemId"`;
  if (!rows[0]) throw new Error('Attempt is unavailable or already reconciled.');
  // The item stays blocked. The user must deliberately queue it again.
  return rows[0];
}

export async function confirmSubmission(
  owner: string,
  input: {
    attemptId: string;
    itemId: string;
    idempotencyKey: string;
    confirmation: string;
    confirmationUrl?: string;
  },
  sql: Sql,
) {
  z.uuid().parse(input.attemptId);
  z.uuid().parse(input.itemId);
  const attempts = await sql`SELECT id FROM jobdesk_submission_attempts
    WHERE id=${input.attemptId} AND item_id=${input.itemId} AND owner_id=${owner} AND state IN ('pending','uncertain','confirmed')`;
  if (!attempts[0]) throw new Error('A durable submission attempt is required.');
  // This service operation is wrapped in a short transaction, including the
  // existing atomic receipt/event/lead statement, by service.ts.
  const receipt = await recordApplicationReceipt(owner, input.itemId, input, sql);
  await sql`UPDATE jobdesk_submission_attempts SET state='confirmed',updated_at=clock_timestamp() WHERE id=${input.attemptId} AND owner_id=${owner}`;
  await sql`UPDATE job_application_batch_items SET lease_worker=NULL,lease_expires_at=NULL WHERE id=${input.itemId} AND owner_id=${owner}`;
  return receipt;
}
