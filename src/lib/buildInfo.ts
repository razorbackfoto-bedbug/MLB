import { execSync } from 'node:child_process';

function safeGit(command: string): string | null {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null;
  } catch {
    return null;
  }
}

const fullSha = safeGit('git rev-parse HEAD');
const shortSha = fullSha ? fullSha.slice(0, 7) : safeGit('git rev-parse --short HEAD');

export const BUILD_INFO = {
  shortSha: shortSha ?? 'dev',
  commitUrl: fullSha ? `https://github.com/razorbackfoto-bedbug/MLB/commit/${fullSha}` : null,
  builtAt: new Date(),
};
