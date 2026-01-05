CREATE OR REPLACE FUNCTION trg_history_insert_func()
RETURNS trigger AS $$
BEGIN
    INSERT INTO steps_to_types (step_id, entity_type)
    VALUES (NEW.step_id, NEW.entity_type)
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_history_delete_func()
RETURNS trigger AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM single_history
        WHERE step_id = OLD.step_id
          AND entity_type = OLD.entity_type
    ) THEN
        DELETE FROM steps_to_types
        WHERE step_id = OLD.step_id
          AND entity_type = OLD.entity_type;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_history_update_func()
RETURNS trigger AS $$
BEGIN
    IF (OLD.step_id <> NEW.step_id OR OLD.entity_type <> NEW.entity_type) THEN

        IF NOT EXISTS (
            SELECT 1
            FROM single_history
            WHERE step_id = OLD.step_id
              AND entity_type = OLD.entity_type
        ) THEN
            DELETE FROM steps_to_types
            WHERE step_id = OLD.step_id
              AND entity_type = OLD.entity_type;
        END IF;

        INSERT INTO steps_to_types (step_id, entity_type)
        VALUES (NEW.step_id, NEW.entity_type)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_history_insert
AFTER INSERT ON single_history
FOR EACH ROW
EXECUTE FUNCTION trg_history_insert_func();

CREATE TRIGGER trg_history_delete
AFTER DELETE ON single_history
FOR EACH ROW
EXECUTE FUNCTION trg_history_delete_func();

CREATE TRIGGER trg_history_update
AFTER UPDATE ON single_history
FOR EACH ROW
EXECUTE FUNCTION trg_history_update_func();
