import { z } from 'zod';

export const AgentProviderTypeSchema = z.enum(['mock', 'codex', 'claude', 'gemini']);

export const AgentRegistrationSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  providerType: AgentProviderTypeSchema,
  systemPrompt: z.string().optional(),
  specialization: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  modelName: z.string().optional(),
  executionMode: z.enum(['auto', 'manual']),
  enabled: z.boolean(),
});

export const RoomMessageTypeSchema = z.enum([
  'CHAT',
  'REVIEW',
  'HANDOFF',
  'BLOCKER',
  'VERIFICATION',
  'IMPLEMENTATION',
  'BROADCAST',
  'SYSTEM',
]);

export const RoomMessageSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  timestamp: z.number(),
  from: z.string(), // agent id or 'user' or 'system'
  to: z.string().nullable(), // agent id, 'all', or null
  type: RoomMessageTypeSchema,
  subject: z.string().optional(),
  body: z.string(),
  attachments: z.record(z.any()).optional(),
  correlationId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']).optional(),
});

export const RoomReplySchema = RoomMessageSchema.extend({
  replyToId: z.string().uuid(),
});

export const RoomEventSchema = z.object({
  type: z.enum(['agent_joined', 'agent_left', 'user_joined', 'user_left', 'room_closed']),
  timestamp: z.number(),
  roomId: z.string().uuid(),
  data: z.record(z.any()),
});

export const ExecutionPlanSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  steps: z.array(z.string()),
});

export const ExecutionResultSchema = z.object({
  planId: z.string().uuid(),
  success: z.boolean(),
  logs: z.string(),
  error: z.string().optional(),
});

export const TaskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED']);

export const TaskRequestSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  status: TaskStatusSchema,
  assignee: z.string().nullable(),
});

export type AgentProviderType = z.infer<typeof AgentProviderTypeSchema>;
export type AgentRegistration = z.infer<typeof AgentRegistrationSchema>;
export type RoomMessageType = z.infer<typeof RoomMessageTypeSchema>;
export type RoomMessage = z.infer<typeof RoomMessageSchema>;
export type RoomReply = z.infer<typeof RoomReplySchema>;
export type RoomEvent = z.infer<typeof RoomEventSchema>;
export type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskRequest = z.infer<typeof TaskRequestSchema>;

export const RoomSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  createdAt: z.number(),
  activeAgents: z.array(z.string()), // Array of agent IDs
});
export type Room = z.infer<typeof RoomSchema>;
