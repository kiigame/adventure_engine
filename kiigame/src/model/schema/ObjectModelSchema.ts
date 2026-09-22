import { z } from 'zod';

export const objectModelSchema = z.object({
    name: z.string(),
});

export type ObjectModel = z.infer<typeof objectModelSchema>;
