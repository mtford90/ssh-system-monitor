declare module 'retry' {

  export type OperationOptions = {
    // Whether to retry forever, defaults to false.
    forever: boolean,
    // Whether to unref the setTimeout's, defaults to false.
    unref: boolean,
  }

  export type TimeoutOptions = {
    // Timeout in ms
    timeout: number,
    // Cb called when operation takes longer than timeout
    cb: () => void,
  }

  export function operation(options?: OperationOptions): RetryOperation

  export interface RetryOperation {
    new(timeouts: any, options: any)

    attempt(fn: () => void, timeoutOps?: TimeoutOptions)

    retry(err: any)

    mainError(): any

    attempts(): number

    errors(): any[]
  }
}