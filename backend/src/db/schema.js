import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp, boolean, pgEnum, jsonb } from 'drizzle-orm/pg-core';

// Enum para tipos de OTP
export const otpTypeEnum = pgEnum('otp_type', ['registration', 'password_reset']);

// Tabela de perfis de usuários
export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    fullName: text('full_name'),
    isVerified: boolean('is_verified').notNull().default(false),
    mustChangePassword: boolean('must_change_password').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true })
});

// Tabela de códigos OTP
export const otpCodes = pgTable('otp_codes', {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
    userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    type: otpTypeEnum('type').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Tabela de refresh tokens
export const refreshTokens = pgTable('refresh_tokens', {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
    userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    isRevoked: boolean('is_revoked').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Tabela de log de atividades
export const activityLogs = pgTable('activity_logs', {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    sourceApp: text('source_app').notNull().default('unknown'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
