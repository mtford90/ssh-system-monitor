export type NodeEnv = 'production' | 'development'

export type Env = {
  PORT: number,
  NODE_ENV: NodeEnv,
}

const processEnv: any = process.env || {}

const env: Env = {
  PORT:     Number(processEnv.PORT || 3001),
  NODE_ENV: processEnv.NODE_ENV === 'production' ? 'production' : 'development',
}

export default env