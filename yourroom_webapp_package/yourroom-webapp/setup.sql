-- Create Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('seeker', 'owner')),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Seekers Profile Table
CREATE TABLE seeker_profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    budget_min INT,
    budget_max INT,
    preferred_locations TEXT[], -- Array of strings for locations
    room_type_preference VARCHAR(50),
    required_facilities TEXT[], -- Array of strings for facilities
    move_in_date DATE,
    additional_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Property Owners Table
CREATE TABLE property_owners (
    owner_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    verification_status VARCHAR(20) DEFAULT 'pending',
    verification_documents TEXT[], -- Array of document URLs/paths
    rating NUMERIC(2, 1), -- e.g., 4.5
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Properties Table
CREATE TABLE properties (
    property_id SERIAL PRIMARY KEY,
    owner_id INT NOT NULL REFERENCES property_owners(owner_id) ON DELETE CASCADE,
    property_name VARCHAR(150) NOT NULL,
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('PG', 'Hostel', 'Apartment')),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    landmark VARCHAR(255),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Rooms Table
CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    property_id INT NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    room_type VARCHAR(50) NOT NULL, -- e.g., 'Single Sharing', 'Double Sharing'
    rent_amount INT NOT NULL,
    security_deposit INT,
    is_available BOOLEAN DEFAULT TRUE,
    available_from DATE,
    facilities TEXT[], -- Array of strings for facilities
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Property Images Table
CREATE TABLE property_images (
    image_id SERIAL PRIMARY KEY,
    property_id INT NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    room_id INT REFERENCES rooms(room_id) ON DELETE SET NULL, -- Optional link to a specific room
    image_url TEXT NOT NULL,
    image_type VARCHAR(20) CHECK (image_type IN ('exterior', 'interior', 'room', 'common_area')),
    display_order INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language "plpgsql";

-- Apply the trigger function to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seeker_profiles_updated_at BEFORE UPDATE ON seeker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_owners_updated_at BEFORE UPDATE ON property_owners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


