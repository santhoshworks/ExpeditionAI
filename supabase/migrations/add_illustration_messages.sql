-- Add metadata column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update the role enum to include 'illustration'
-- First, add the new value to the enum
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'illustration' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'message_role'
        )
    ) THEN
        ALTER TYPE message_role ADD VALUE 'illustration';
    END IF;
END $$;

-- Create index on metadata for better query performance
CREATE INDEX IF NOT EXISTS messages_metadata_idx ON messages USING GIN (metadata);

-- Create index on role for filtering illustration messages
CREATE INDEX IF NOT EXISTS messages_role_idx ON messages (role);

-- Update RLS policies to handle illustration messages
-- The existing policies should already cover illustration messages since they're tied to trails