-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    area DECIMAL(8,2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    rooms INTEGER NOT NULL,
    floor INTEGER,
    total_floors INTEGER,
    year_built INTEGER,
    price_eur DECIMAL(10,2) NOT NULL,
    price_bgn DECIMAL(10,2) NOT NULL,
    rent_price_eur DECIMAL(8,2) DEFAULT 0,
    rent_price_bgn DECIMAL(8,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'rented', 'sold', 'inactive')),
    viewings INTEGER DEFAULT 0,
    last_viewing DATE,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create property images table
CREATE TABLE IF NOT EXISTS property_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    image_url VARCHAR(512) NOT NULL,
    image_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_eur);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
