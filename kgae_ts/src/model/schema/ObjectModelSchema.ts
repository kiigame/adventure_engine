import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const objectModelSchema = z.object({
  name: z.string(),
});

export type ObjectModel = z.infer<typeof objectModelSchema>;
