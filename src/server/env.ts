export type NodeEnv = 'production' | 'development'

export type Env = {
  PORT: number,
  NODE_ENV: NodeEnv,
}

const env: Env = {
  PORT:     Number(process.env.PORT || 3001),
  NODE_ENV: process.env.NODE_ENV === 'production' ? 'production' : 'development',
}

export default env