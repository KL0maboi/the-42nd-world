import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';

export const UserSchema = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
});

export const RoomSchema = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  maxPlayerCount: integer('max_player_count'),
  playerCount: integer('player_count').default(1),
});

export const RoomPlayerSchema = pgTable(
  'room_players',
  {
    roomId: uuid('room_id')
      .references(() => RoomSchema.id)
      .notNull(),
    userId: uuid('user_id')
      .references(() => UserSchema.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.roomId, table.userId] })],
);

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
