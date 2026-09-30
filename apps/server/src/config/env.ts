import { z } from 'zod'

const MAX_PORT = 65535
const LOG_LEVELS = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
] as const

function portProblem(input: unknown): string {
  return `must be an integer between 1 and ${MAX_PORT} (got "${String(input)}")`
}

const envSchema = z.object({
  PORT: z
    .string()
    .regex(/^\d+$/, { error: (issue) => portProblem(issue.input) })
    .transform(Number)
    .refine((port) => port >= 1 && port <= MAX_PORT, {
      error: (issue) => portProblem(issue.input),
    })
    .default(3000),
  LOG_LEVEL: z
    .enum(LOG_LEVELS, { error: `must be one of ${LOG_LEVELS.join(', ')}` })
    .default('info'),
})

export type LogLevel = (typeof LOG_LEVELS)[number]

export type Config = {
  port: number
  logLevel: LogLevel
}

export class ConfigError extends Error {
  readonly problems: string[]

  constructor(problems: string[]) {
    super(
      ['Invalid configuration:', ...problems.map((p) => `  - ${p}`)].join('\n'),
    )
    this.name = 'ConfigError'
    this.problems = problems
  }
}

export function loadConfig(env: Record<string, string | undefined>): Config {
  const result = envSchema.safeParse(env)
  if (!result.success) {
    throw new ConfigError(
      result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    )
  }

  return { port: result.data.PORT, logLevel: result.data.LOG_LEVEL }
}
