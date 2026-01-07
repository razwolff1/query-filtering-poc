import {AsyncLocalStorage} from 'async_hooks'

type Store = {
    fileName: string
}
const storage = new AsyncLocalStorage<Store>()

export const getFileName = () => storage.getStore()?.fileName

export const runBenchmarkSuite = async (benchmark: Function[]) => {
    const resultFile = `results_${new Date().toISOString()}.txt`

    const store: Store = {fileName: resultFile}

     return storage.run(store, async () => {
    const results = []

    for (const test of benchmark) {
      const result = await test()
      results.push(result)
    }

    return results
  })
}