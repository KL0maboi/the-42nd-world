-- Custom SQL migration file, put your code below! --
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

CREATE TRIGGER delete_empty_room_trigger
AFTER DELETE ON room_players
FOR EACH ROW
EXECUTE FUNCTION delete_empty_room();   