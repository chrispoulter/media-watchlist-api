import 'dotenv/config';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(join(process.cwd(), 'package.json'));

const gitCommitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA;

export const version =
    gitCommitSha?.slice(0, 7) ?? require('./package.json').version;

export const environment =
    process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';
