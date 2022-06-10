/**
 * Like lodash.debounce,
 * but also avoids async invocations to overlap
 *
 * @param callback
 * @param wait
 * @param leading
 * @param maxWait
 */
export function debounceAsync<CB extends (...args: any[]) => Promise<R>, R>(
  callback: CB,
  wait = 100,
  { leading = false, maxWait = Infinity } = {},
) {
  let started = 0 // latest callback invocation
  let runningCallback: Promise<R> | undefined // latest callback invocation result
  let runningDebouncer: Promise<R | undefined> // latest wrapper invocation
  let waitingSince = 0 // we are delaying invocation since
  let whoIsWaiting: undefined | any[] // args' array object identifies the pending instance, and incidentally stores args

  const interceptingWrapper = (...args: any[]) => (runningDebouncer = debouncer(...args))

  return Object.assign(interceptingWrapper, {
    cancel: () => (whoIsWaiting = undefined),
    flush() {
      return whoIsWaiting ? callback(...whoIsWaiting) : this.cancel()
    },
  })

  async function debouncer(...args: any[]) {
    whoIsWaiting = args
    waitingSince ||= Date.now()
    await runningCallback
    const waitingCap = maxWait - (Date.now() - (waitingSince || started))
    const waitFor = Math.min(waitingCap, leading ? wait - (Date.now() - started) : wait)
    if (waitFor > 0) {
      await new Promise(resolve => setTimeout(resolve, waitFor))
    }
    if (!whoIsWaiting) {
      // canceled
      waitingSince = 0
      return
    }
    if (whoIsWaiting !== args) {
      // another fresher call is waiting
      return runningDebouncer
    }
    waitingSince = 0
    whoIsWaiting = undefined
    started = Date.now()
    try {
      runningCallback = callback(...args)
      return await runningCallback
    } finally {
      runningCallback = undefined
    }
  }
}
