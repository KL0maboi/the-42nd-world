import { sql } from 'drizzle-orm';
import { db } from '#/db';

export async function setupRoomCleanupTrigger() {
  // Function can safely be replaced on every startup.
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION delete_empty_room()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM room_players
        WHERE room_id = OLD.room_id
      ) THEN
        DELETE FROM rooms
        WHERE id = OLD.room_id;
      END IF;

      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // PostgreSQL doesn't need us to recreate the trigger every startup.
  // Create it only if it doesn't already exist.
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'delete_empty_room_trigger'
      ) THEN
        CREATE TRIGGER delete_empty_room_trigger
        AFTER DELETE ON room_players
        FOR EACH ROW
        EXECUTE FUNCTION delete_empty_room();
      END IF;
    END
    $$;
  `);
}

setupRoomCleanupTrigger();
