import { z } from 'zod';

export const objectModelSchema = z.object({
    name: z.string(),
    category: z.string(),
    visible: z.boolean().optional().default(true),
});

export type ObjectModel = z.infer<typeof objectModelSchema>;
