import { router } from '../index'
import { manufacturerRouter } from './manufacturer'
import { productRouter } from './product'
import { documentRouter } from './document'

export const appRouter = router({
  manufacturer: manufacturerRouter,
  product: productRouter,
  document: documentRouter,
})

export type AppRouter = typeof appRouter
