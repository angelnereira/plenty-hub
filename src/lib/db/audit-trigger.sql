CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  user_id UUID;
  tenant_id UUID;
BEGIN
  -- Try to get user_id and tenant_id from local session variables if set by app
  -- (This requires the app to set these config settings before query)
  -- For now, we will just store the data changes.
  
  IF (TG_OP = 'UPDATE') THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    INSERT INTO audit_logs (
      id, 
      action, 
      entity, 
      entity_id, 
      details, 
      created_at
    )
    VALUES (
      gen_random_uuid(),
      TG_OP,
      TG_TABLE_NAME,
      OLD.id::text,
      jsonb_build_object('old', old_data, 'new', new_data),
      now()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    old_data := to_jsonb(OLD);
    INSERT INTO audit_logs (
      id, 
      action, 
      entity, 
      entity_id, 
      details, 
      created_at
    )
    VALUES (
      gen_random_uuid(),
      TG_OP,
      TG_TABLE_NAME,
      OLD.id::text,
      jsonb_build_object('old', old_data),
      now()
    );
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    new_data := to_jsonb(NEW);
    INSERT INTO audit_logs (
      id, 
      action, 
      entity, 
      entity_id, 
      details, 
      created_at
    )
    VALUES (
      gen_random_uuid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id::text,
      jsonb_build_object('new', new_data),
      now()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
