import { relations } from 'drizzle-orm';
import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const UserSchema = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
});

export const RoomSchema = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  maxPlayerCount: integer('max_player_count'),
});

export const RoomPlayerSchema = pgTable('room_players', {
  roomId: uuid('room_id')
    .references(() => RoomSchema.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => UserSchema.id, { onDelete: 'cascade' })
    .primaryKey(),
});

// RELATIONS

export const RoomPlayerRelations = relations(RoomPlayerSchema, ({ one }) => ({
  room: one(RoomSchema, {
    fields: [RoomPlayerSchema.roomId],
    references: [RoomSchema.id],
  }),
  user: one(UserSchema, {
    fields: [RoomPlayerSchema.userId],
    references: [UserSchema.id],
  }),
}));
