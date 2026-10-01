import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { brokerCall } from './client';
import { JobdeskStore, DEFAULT_ROOT, recoverOwnerLock, PGLITE_VERSION } from './store';

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === 'open') {
    const { url } = await brokerCall('browser.open', []);
    await new Promise<void>((resolve, reject) =>
      execFile('/usr/bin/open', [url], { env: process.env }, (error) =>
        error ? reject(error) : resolve(),
      ),
    );
    console.log('Opened the private local Jobdesk session.');
    return;
  }
  if (command === 'status') {
    console.log(JSON.stringify(await brokerCall('health', [])));
    return;
  }
  if (command === 'backup') {
    console.log(JSON.stringify(await brokerCall('backup', [])));
    return;
  }
  if (command === 'recover-lock') {
    await recoverOwnerLock(process.env.JOBDESK_DATA_DIR ?? DEFAULT_ROOT);
    console.log(
      'Recovered the stopped owner lock. Submission attempts still require reconciliation.',
    );
    return;
  }
  if (command === 'restore') {
    if (args.length !== 2) throw new Error('Usage: restore BACKUP_DIRECTORY NEW_DATA_DIRECTORY');
    const [backup, destination] = args;
    const manifest = JSON.parse(await readFile(path.join(backup, 'manifest.json'), 'utf8'));
    const data = await readFile(path.join(backup, 'database.tar.gz'));
    if (
      manifest.format !== 1 ||
      manifest.pglite !== PGLITE_VERSION ||
      createHash('sha256').update(data).digest('hex') !== manifest.sha256
    )
      throw new Error('Backup manifest or runtime checksum does not match.');
    const store = await JobdeskStore.open(destination, undefined, new Blob([new Uint8Array(data)]));
    try {
      for (const artifact of manifest.artifacts) {
        if (!/^[a-f0-9-]{36}$/.test(artifact.id)) throw new Error('Invalid artifact in manifest.');
        const file = await readFile(path.join(backup, 'artifacts', `${artifact.id}.pdf`));
        if (createHash('sha256').update(file).digest('hex') !== artifact.content_hash)
          throw new Error('Artifact checksum mismatch.');
      }
      if (manifest.artifacts.length) {
        await mkdir(path.join(store.root, 'artifacts'), { recursive: true, mode: 0o700 });
        for (const artifact of manifest.artifacts)
          await cp(
            path.join(backup, 'artifacts', `${artifact.id}.pdf`),
            path.join(store.root, 'artifacts', `${artifact.id}.pdf`),
            { errorOnExist: true, force: false },
          );
      }
      console.log(
        'Restored and verified a separate database. Review it before any configuration switch.',
      );
    } finally {
      await store.close();
    }
    return;
  }
  throw new Error(
    'Commands: open, status, backup, recover-lock, restore BACKUP_DIRECTORY NEW_DATA_DIRECTORY',
  );
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Jobdesk command failed.');
  process.exitCode = 1;
});
