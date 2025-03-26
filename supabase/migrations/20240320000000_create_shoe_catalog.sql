-- Create shoe_catalog table
CREATE TABLE IF NOT EXISTS shoe_catalog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE shoe_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to read shoe_catalog"
    ON shoe_catalog FOR SELECT
    TO authenticated, anon
    USING (true);

-- Insert shoes into the catalog
INSERT INTO shoe_catalog (brand, model, category) VALUES
-- Nike
('Nike', 'Air Max 270', 'Running'),
('Nike', 'Air Force 1', 'Lifestyle'),
('Nike', 'Dunk Low', 'Lifestyle'),
('Nike', 'Air Jordan 1', 'Basketball'),
('Nike', 'Air Jordan 11', 'Basketball'),
('Nike', 'Air Jordan 4', 'Basketball'),
('Nike', 'Air Max 90', 'Running'),
('Nike', 'Air Max 97', 'Running'),
('Nike', 'Blazer Mid', 'Lifestyle'),
('Nike', 'Cortez', 'Running'),

-- Adidas
('Adidas', 'Stan Smith', 'Lifestyle'),
('Adidas', 'Superstar', 'Lifestyle'),
('Adidas', 'Ultraboost', 'Running'),
('Adidas', 'Samba', 'Lifestyle'),
('Adidas', 'Gazelle', 'Lifestyle'),
('Adidas', 'NMD R1', 'Running'),
('Adidas', 'Yeezy Boost 350', 'Lifestyle'),
('Adidas', 'Yeezy Boost 500', 'Lifestyle'),
('Adidas', 'Yeezy Boost 700', 'Lifestyle'),
('Adidas', 'Forum Low', 'Lifestyle'),

-- New Balance
('New Balance', '574', 'Lifestyle'),
('New Balance', '990', 'Running'),
('New Balance', '327', 'Lifestyle'),
('New Balance', '997', 'Running'),
('New Balance', '530', 'Running'),
('New Balance', '2002R', 'Running'),
('New Balance', '9060', 'Running'),
('New Balance', '550', 'Lifestyle'),
('New Balance', '991', 'Running'),
('New Balance', '998', 'Running'),

-- Puma
('Puma', 'Suede', 'Lifestyle'),
('Puma', 'RS-X', 'Running'),
('Puma', 'Clyde', 'Lifestyle'),
('Puma', 'Basket', 'Lifestyle'),
('Puma', 'Rider', 'Running'),
('Puma', 'RS-X³ Puzzle', 'Running'),
('Puma', 'Softride', 'Running'),
('Puma', 'Mayze', 'Lifestyle'),
('Puma', 'Carina', 'Lifestyle'),
('Puma', 'Deviate', 'Running'),

-- Vans
('Vans', 'Old Skool', 'Lifestyle'),
('Vans', 'Sk8-Hi', 'Lifestyle'),
('Vans', 'Authentic', 'Lifestyle'),
('Vans', 'Era', 'Lifestyle'),
('Vans', 'Slip-On', 'Lifestyle'),
('Vans', 'ComfyCush Era', 'Lifestyle'),
('Vans', 'UltraRange', 'Running'),
('Vans', 'Skate', 'Skateboarding'),
('Vans', 'Half Cab', 'Skateboarding'),
('Vans', 'Style 36', 'Lifestyle'),

-- Converse
('Converse', 'Chuck 70', 'Lifestyle'),
('Converse', 'One Star', 'Lifestyle'),
('Converse', 'Jack Purcell', 'Lifestyle'),
('Converse', 'Pro Leather', 'Basketball'),
('Converse', 'Run Star Motion', 'Lifestyle'),
('Converse', 'Chuck Taylor All Star', 'Lifestyle'),
('Converse', 'Run Star Hike', 'Lifestyle'),
('Converse', 'Fastbreak', 'Basketball'),
('Converse', 'Weapon', 'Basketball'),
('Converse', 'Star Player', 'Lifestyle'),

-- Reebok
('Reebok', 'Classic Leather', 'Lifestyle'),
('Reebok', 'Club C', 'Lifestyle'),
('Reebok', 'Instapump Fury', 'Running'),
('Reebok', 'Question', 'Basketball'),
('Reebok', 'Answer', 'Basketball'),
('Reebok', 'Workout Plus', 'Lifestyle'),
('Reebok', 'Zig Kinetica', 'Running'),
('Reebok', 'Nano', 'Training'),
('Reebok', 'Floatride', 'Running'),
('Reebok', 'Royal', 'Lifestyle'),

-- ASICS
('ASICS', 'Gel-Lyte III', 'Running'),
('ASICS', 'Gel-Nimbus', 'Running'),
('ASICS', 'Gel-Kayano', 'Running'),
('ASICS', 'Gel-Quantum', 'Running'),
('ASICS', 'Gel-Lyte V', 'Running'),
('ASICS', 'Gel-1090', 'Running'),
('ASICS', 'Gel-1130', 'Running'),
('ASICS', 'Gel-Sonoma', 'Running'),
('ASICS', 'Gel-Contend', 'Running'),
('ASICS', 'Gel-Resolution', 'Tennis'),

-- Saucony
('Saucony', 'Ride', 'Running'),
('Saucony', 'Guide', 'Running'),
('Saucony', 'Triumph', 'Running'),
('Saucony', 'Endorphin Speed', 'Running'),
('Saucony', 'Endorphin Pro', 'Running'),
('Saucony', 'Shadow 6000', 'Running'),
('Saucony', 'Grid 9000', 'Running'),
('Saucony', 'Jazz', 'Running'),
('Saucony', 'Freedom', 'Running'),
('Saucony', 'Kinvara', 'Running'),

-- Brooks
('Brooks', 'Ghost', 'Running'),
('Brooks', 'Adrenaline', 'Running'),
('Brooks', 'Glycerin', 'Running'),
('Brooks', 'Launch', 'Running'),
('Brooks', 'Levitate', 'Running'),
('Brooks', 'Beast', 'Running'),
('Brooks', 'Cascadia', 'Trail Running'),
('Brooks', 'Revel', 'Running'),
('Brooks', 'Bedlam', 'Running'),
('Brooks', 'Ravenna', 'Running'); 