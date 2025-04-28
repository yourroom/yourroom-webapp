const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  // Create a new user
  async create(userData, userType) {
    try {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // Start a transaction
      const client = await db.query('BEGIN');
      
      try {
        // Insert into users table
        const userResult = await db.query(
          'INSERT INTO users (name, email, phone, password_hash, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
          [userData.name, userData.email, userData.phone, hashedPassword, userType]
        );
        
        const userId = userResult.rows[0].user_id;
        
        // If user is a seeker, insert into seeker_profiles
        if (userType === 'seeker') {
          // Convert comma-separated strings to arrays
          const preferredLocations = userData.preferred_locations ? userData.preferred_locations.split(',').map(loc => loc.trim()) : [];
          const requiredFacilities = userData.required_facilities ? userData.required_facilities.split(',').map(fac => fac.trim()) : [];
          
          await db.query(
            'INSERT INTO seeker_profiles (user_id, budget_min, budget_max, preferred_locations, room_type_preference, required_facilities, move_in_date, additional_notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [
              userId, 
              userData.budget_min || null, 
              userData.budget_max || null, 
              preferredLocations, 
              userData.room_type_preference || null,
              requiredFacilities,
              userData.move_in_date || null,
              userData.additional_notes || null
            ]
          );
        } 
        // If user is an owner, insert into property_owners
        else if (userType === 'owner') {
          // Insert into property_owners
          const ownerResult = await db.query(
            'INSERT INTO property_owners (user_id, verification_status) VALUES ($1, $2) RETURNING owner_id',
            [userId, 'pending']
          );
          
          const ownerId = ownerResult.rows[0].owner_id;
          
          // Insert into properties
          const propertyResult = await db.query(
            'INSERT INTO properties (owner_id, property_name, property_type, address_line1, address_line2, city, state, pincode, landmark, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING property_id',
            [
              ownerId,
              userData.property_name,
              userData.property_type,
              userData.address_line1,
              userData.address_line2 || null,
              userData.city,
              userData.state,
              userData.pincode,
              userData.landmark || null,
              userData.description || null
            ]
          );
          
          const propertyId = propertyResult.rows[0].property_id;
          
          // Convert comma-separated facilities to array
          const facilities = userData.facilities ? userData.facilities.split(',').map(fac => fac.trim()) : [];
          
          // Insert into rooms
          await db.query(
            'INSERT INTO rooms (property_id, room_type, rent_amount, security_deposit, available_from, facilities) VALUES ($1, $2, $3, $4, $5, $6)',
            [
              propertyId,
              userData.room_type,
              userData.rent_amount,
              userData.security_deposit || null,
              userData.available_from || null,
              facilities
            ]
          );
        }
        
        // Commit the transaction
        await db.query('COMMIT');
        
        return { success: true, userId };
      } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Find user by email
  async findByEmail(email) {
    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  },
  
  // Authenticate user
  async authenticate(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) return { success: false, message: 'User not found' };
      
      const match = await bcrypt.compare(password, user.password_hash);
      if (match) {
        return { success: true, user };
      } else {
        return { success: false, message: 'Invalid password' };
      }
    } catch (error) {
      console.error('Error authenticating user:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = User;
