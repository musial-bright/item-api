import * as esbuild from 'esbuild'
import esbuildPluginTsc from 'esbuild-plugin-tsc'

const isAWS = !!process.env.CODEBUILD_BUILD_ID;

const processEnv = (envVariable) => {
  if (!isAWS) {
    return '""';
  }
    
  return JSON.stringify(process.env[envVariable]);
}

const stageContext = process.env.ENVIRONMENT ?? 'development';

const plugins = [
  esbuildPluginTsc({
    force: true
  })
]

esbuild
  .build({
    bundle: true,
    entryPoints: ['src/index.ts'],
    format: 'cjs',
    logLevel: 'info',
    minify: true,
    outfile: 'dist/index.cjs',
    platform: 'node',
    plugins: [...plugins],
    sourcemap: false,
    sourcesContent: false,
    target: 'node22',
    define: {
      'process.env.ENVIRONMENT': JSON.stringify(stageContext),
      'process.env.DYNAMO_DB_ENDPOINT': processEnv('DYNAMO_DB_ENDPOINT'),
      'process.env.API_KEY_AUTH': processEnv('API_KEY_AUTH'),
    }
  })
  .then(() => {
      console.log('Build complete')
  })
  .catch((err) => {
      console.error(err)
      process.exit(1)
  });