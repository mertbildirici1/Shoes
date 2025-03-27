-- Drop existing shoes table if it exists
DROP TABLE IF EXISTS shoes;

-- Create shoes table (for storing shoe information)
CREATE TABLE shoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    size TEXT NOT NULL,
    fit TEXT NOT NULL CHECK (fit IN ('too small', 'perfect', 'too large')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_shoes junction table
CREATE TABLE user_shoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shoe_id UUID NOT NULL REFERENCES shoes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, shoe_id)
);

-- Enable RLS
ALTER TABLE shoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shoes ENABLE ROW LEVEL SECURITY;

-- Create policies for shoes table
CREATE POLICY "Allow anyone to read shoes"
    ON shoes FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Allow authenticated users to insert shoes"
    ON shoes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow users to update their own shoes"
    ON shoes FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM user_shoes
        WHERE user_shoes.shoe_id = shoes.id
        AND user_shoes.user_id = auth.uid()
    ));

CREATE POLICY "Allow users to delete their own shoes"
    ON shoes FOR DELETE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM user_shoes
        WHERE user_shoes.shoe_id = shoes.id
        AND user_shoes.user_id = auth.uid()
    ));

-- Create policies for user_shoes table
CREATE POLICY "Allow users to read their own user_shoes"
    ON user_shoes FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Allow users to insert their own user_shoes"
    ON user_shoes FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to delete their own user_shoes"
    ON user_shoes FOR DELETE
    TO authenticated
    USING (user_id = auth.uid()); 