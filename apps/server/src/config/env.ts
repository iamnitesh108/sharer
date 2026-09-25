import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
})

export type Env = z.infer<typeof envSchema>

export type Config = {
  env: Env['NODE_ENV']
  port: number
  logLevel: Env['LOG_LEVEL']
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

/**
 * Reads the environment variables the app needs and checks them.
 * Throws a ConfigError listing every problem, so a bad setup fails at startup
 * instead of somewhere in the middle of a request.
 */
export function loadConfig(source: NodeJS.ProcessEnv): Config {
  const result = envSchema.safeParse(source)

  if (!result.success) {
    throw new ConfigError(
      `Invalid environment variables:\n${z.prettifyError(result.error)}`,
    )
  }

  const env = result.data

  return {
    env: env.NODE_ENV,
    port: env.PORT,
    logLevel: env.LOG_LEVEL,
  }
}
