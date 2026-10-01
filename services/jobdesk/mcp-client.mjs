import { randomUUID } from 'node:crypto';
import { request as httpRequest } from 'node:http';
import { homedir } from 'node:os';
import path from 'node:path';

// Thin IPC consumer: never opens PGlite, accesses Keychain, or falls back online.
export function localCall(method, args, socketPath) {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        socketPath,
        path: '/rpc',
        method: 'POST',
        headers: { Host: 'jobdesk', 'Content-Type': 'application/json' },
      },
      (res) => {
        const chunks = [];
        let length = 0;
        res.on('data', (chunk) => {
          length += chunk.length;
          if (length > 5_000_000) req.destroy();
          else chunks.push(chunk);
        });
        res.on('end', () => {
          try {
            const result = JSON.parse(Buffer.concat(chunks).toString());
            if (res.statusCode !== 200)
              throw new Error(result.error ?? 'Local Jobdesk rejected the operation.');
            resolve(result.data);
          } catch (error) {
            reject(error);
          }
        });
      },
    );
    req.setTimeout(120_000, () => req.destroy());
    req.on('error', () =>
      reject(
        new Error(
          'Local Jobdesk is unavailable or timed out. Reconcile pending submissions before retrying. No hosted fallback was attempted.',
        ),
      ),
    );
    req.end(JSON.stringify({ method, args }));
  });
}

export function createLocalApiClient({
  socketPath = process.env.JOBDESK_SOCKET ??
    path.join(homedir(), 'Library/Application Support/Arcades Jobdesk/broker.sock'),
} = {}) {
  const workerId = `mcp-${randomUUID()}`;
  const leases = new Map();
  const call = (method, args) => localCall(method, args, socketPath);
  const lease = (itemId) => {
    const current = leases.get(itemId);
    if (!current) throw new Error('Claim preparation first by setting this item to preparing.');
    return { itemId, workerId, generation: current.generation };
  };
  const request = async (method, pathname, body) => {
    if (method === 'GET' && pathname === '/api/jobs/mcp/batches') return call('batches.list', []);
    let match = /^\/api\/jobs\/mcp\/batches\/([a-f0-9-]{36})\/items$/i.exec(pathname);
    if (method === 'GET' && match) return call('batches.items', [match[1]]);
    match = /^\/api\/jobs\/mcp\/items\/([a-f0-9-]{36})(\/submission)?$/i.exec(pathname);
    if (!match) throw new Error('Unsupported local Jobdesk operation.');
    const itemId = match[1];
    if (method === 'GET' && !match[2]) return call('items.read', [itemId]);
    if (method === 'PATCH' && !match[2]) {
      if (body.status === 'preparing' && !leases.has(itemId)) {
        const current = await call('items.claim', [{ itemId, workerId }]);
        leases.set(itemId, current);
        return { item: { id: itemId, status: 'preparing', lease: current } };
      }
      const item = await call('items.status', [
        { ...lease(itemId), status: body.status, note: (body.note ?? '').slice(0, 1000) },
      ]);
      if (body.status !== 'preparing') leases.delete(itemId);
      return { item };
    }
    if (method === 'POST' && match[2])
      return { receipt: await call('submission.record', [{ itemId, ...body }]) };
    throw new Error('Unsupported local Jobdesk operation.');
  };
  const itemSchema = {
    type: 'object',
    properties: { itemId: { type: 'string', format: 'uuid' } },
    required: ['itemId'],
    additionalProperties: false,
  };
  request.workerTools = [
    {
      name: 'job_hunt_renew_lease',
      description:
        'Renew this worker’s preparation lease before it expires. A stale worker cannot write progress.',
      inputSchema: itemSchema,
      run: (args) => call('items.renew', [lease(args.itemId)]),
    },
    {
      name: 'job_hunt_begin_submission',
      description:
        'Save a durable attempt before clicking Submit. Requires the current approved draft and lease. This tool performs no employer action.',
      inputSchema: itemSchema,
      run: (args) => call('submission.begin', [lease(args.itemId)]),
    },
    {
      name: 'job_hunt_mark_submission_uncertain',
      description:
        'Block an interrupted or timed-out submission for reconciliation. Never click Submit again merely because a lease expired.',
      inputSchema: {
        type: 'object',
        properties: {
          attemptId: { type: 'string', format: 'uuid' },
          note: { type: 'string', minLength: 1, maxLength: 1000 },
        },
        required: ['attemptId', 'note'],
        additionalProperties: false,
      },
      run: (args) => call('submission.uncertain', [args.attemptId, args.note]),
    },
  ];
  return request;
}
