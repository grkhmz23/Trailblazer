import { z } from "zod";

export const NarrativeLabelSchema = z.object({
  title: z.string().min(5).max(120),
  summary: z.string().min(20).max(600),
  evidenceHints: z.array(z.string()).min(1).max(10),
});

export type NarrativeLabel = z.infer<typeof NarrativeLabelSchema>;

export const IdeaSchema = z.object({
  title: z.string().min(5).max(120),
  pitch: z.string().min(10).max(400),
  targetUser: z.string().min(5).max(200),
  mvpScope: z.string().min(10).max(400),
  whyNow: z.string().min(10).max(400),
  validation: z.string().min(10).max(400),
});

export type Idea = z.infer<typeof IdeaSchema>;

export const IdeasResponseSchema = z.object({
  ideas: z.array(IdeaSchema).min(1).max(5),
});

export const ActionPackSchema = z.object({
  specMd: z.string().min(50),
  techMd: z.string().min(50),
  milestonesMd: z.string().min(50),
  depsJson: z.string().min(10),
});

export type ActionPack = z.infer<typeof ActionPackSchema>;

export const SaturationCheckSchema = z.object({
  level: z.enum(["low", "medium", "high"]),
  score: z.number().min(0).max(1),
  neighbors: z.array(
    z.object({
      name: z.string(),
      similarity: z.number(),
      url: z.string(),
    })
  ),
});

export type SaturationCheck = z.infer<typeof SaturationCheckSchema>;
