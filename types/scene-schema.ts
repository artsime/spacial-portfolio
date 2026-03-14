import { z } from 'zod'

// Module type definitions
export const TextModuleSchema = z.object({
  id: z.string(),
  type: z.literal('text'),
  frameId: z.string().nullable().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  content: z.string(),
  fontSize: z.number().default(16),
  fontFamily: z.string().default('Inter'),
  color: z.string().default('#1a1a1a'),
  align: z.enum(['left', 'center', 'right']).default('left'),
})

export const ImageModuleSchema = z.object({
  id: z.string(),
  type: z.literal('image'),
  frameId: z.string().nullable().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  src: z.string(),
  alt: z.string().default(''),
  objectFit: z.enum(['cover', 'contain', 'fill']).default('cover'),
})

export const ProjectCardModuleSchema = z.object({
  id: z.string(),
  type: z.literal('project-card'),
  frameId: z.string().nullable().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  projectId: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  thumbnail: z.string(),
  tags: z.array(z.string()).default([]),
})

export const NavModuleSchema = z.object({
  id: z.string(),
  type: z.literal('nav'),
  frameId: z.string().nullable().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  targetFrameId: z.string(),
  label: z.string(),
  style: z.enum(['button', 'text', 'pill']).default('text'),
})

export const ShapeModuleSchema = z.object({
  id: z.string(),
  type: z.literal('shape'),
  frameId: z.string().nullable().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  shapeType: z.enum(['rect', 'circle', 'triangle', 'line']).default('rect'),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().default(1),
  opacity: z.number().default(1),
})

export const ModuleSchema = z.discriminatedUnion('type', [
  TextModuleSchema,
  ImageModuleSchema,
  ProjectCardModuleSchema,
  NavModuleSchema,
  ShapeModuleSchema,
])

// Frame definition
export const FrameSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  theme: z.enum(['light', 'dark', 'accent']).default('light'),
  backgroundColor: z.string().optional(),
  showInNav: z.boolean().optional(),
})

// World/Scene document — navigation is now derived from frames
export const SceneDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  version: z.number(),
  world: z.object({
    width: z.number().default(5000),
    height: z.number().default(5000),
    background: z.object({
      color: z.string(),
      grain: z.boolean().default(false),
    }),
    initialViewport: z.object({
      x: z.number(),
      y: z.number(),
      scale: z.number(),
    }),
  }),
  frames: z.array(FrameSchema),
  modules: z.array(ModuleSchema),
})

// Project definition
export const ProjectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  role: z.string(),
  date: z.string(),
  summary: z.string(),
  description: z.string(),
  images: z.array(z.string()),
  externalLink: z.string().optional(),
  tags: z.array(z.string()),
  featured: z.boolean().default(false),
})

// Type exports
export type TextModule = z.infer<typeof TextModuleSchema>
export type ImageModule = z.infer<typeof ImageModuleSchema>
export type ProjectCardModule = z.infer<typeof ProjectCardModuleSchema>
export type NavModule = z.infer<typeof NavModuleSchema>
export type ShapeModule = z.infer<typeof ShapeModuleSchema>
export type ModuleNode = z.infer<typeof ModuleSchema>
export type FrameNode = z.infer<typeof FrameSchema>
export type SceneDocument = z.infer<typeof SceneDocumentSchema>
export type Project = z.infer<typeof ProjectSchema>

// Viewport state
export interface ViewportState {
  x: number
  y: number
  scale: number
}

// Editor/Studio types
export type StudioTool = 'select' | 'hand' | 'frame' | 'shape' | 'text' | 'image' | 'component'

// Validation functions
export function validateScene(data: unknown): SceneDocument {
  return SceneDocumentSchema.parse(data)
}

export function validateProject(data: unknown): Project {
  return ProjectSchema.parse(data)
}
