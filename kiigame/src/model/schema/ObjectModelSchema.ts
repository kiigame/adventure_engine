import { z } from 'zod';

export const objectModelSchema = z.object({
    name: z.string(),
    category: z.string().optional(),
});

export type ObjectModel = z.infer<typeof objectModelSchema>;
