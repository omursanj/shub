import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['expense', 'income']),

  amount: z
    .number({
      required_error: 'Enter an amount',
      invalid_type_error: 'Enter a valid amount',
    })
    .positive('Amount must be greater than 0'),

  category: z
    .string()
    .min(1, 'Select a category'),

  date: z
    .string()
    .min(1, 'Select a date'),
})

export type TransactionFormValues = z.infer<
  typeof transactionSchema
>