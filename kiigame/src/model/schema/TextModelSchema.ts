import { z } from 'zod';

/**
 * A simple texts.json schema to start with
 */
export const textDataSchema = z.record(
    z.string(),
    z.record(z.string(), z.string())
);

export type TextData = z.infer<typeof textDataSchema>;
