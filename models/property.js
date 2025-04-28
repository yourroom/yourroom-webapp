const db = require('../config/db');

const Property = {
  // Get all properties
  async getAll() {
    try {
      const result = await db.query(`
        SELECT p.*, po.user_id, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
        FROM properties p
        JOIN property_owners po ON p.owner_id = po.owner_id
        JOIN users u ON po.user_id = u.user_id
        WHERE p.is_active = true
        ORDER BY p.created_at DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting all properties:', error);
      return [];
    }
  },
  
  // Get property by ID
  async getById(propertyId) {
    try {
      // Get property details
      const propertyResult = await db.query(`
        SELECT p.*, po.user_id, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
        FROM properties p
        JOIN property_owners po ON p.owner_id = po.owner_id
        JOIN users u ON po.user_id = u.user_id
        WHERE p.property_id = $1
      `, [propertyId]);
      
      if (propertyResult.rows.length === 0) {
        return null;
      }
      
      const property = propertyResult.rows[0];
      
      // Get rooms for this property
      const roomsResult = await db.query(`
        SELECT * FROM rooms WHERE property_id = $1
      `, [propertyId]);
      
      property.rooms = roomsResult.rows;
      
      // Get images for this property
      const imagesResult = await db.query(`
        SELECT * FROM property_images 
        WHERE property_id = $1
        ORDER BY display_order
      `, [propertyId]);
      
      property.images = imagesResult.rows;
      
      return property;
    } catch (error) {
      console.error('Error getting property by ID:', error);
      return null;
    }
  },
  
  // Search properties with filters
  async search(filters) {
    try {
      let query = `
        SELECT p.*, po.user_id, u.name as owner_name
        FROM properties p
        JOIN property_owners po ON p.owner_id = po.owner_id
        JOIN users u ON po.user_id = u.user_id
        JOIN rooms r ON p.property_id = r.property_id
        WHERE p.is_active = true
      `;
      
      const queryParams = [];
      let paramCounter = 1;
      
      // Add city filter
      if (filters.city) {
        query += ` AND LOWER(p.city) = LOWER($${paramCounter})`;
        queryParams.push(filters.city);
        paramCounter++;
      }
      
      // Add budget range filter
      if (filters.minBudget) {
        query += ` AND r.rent_amount >= $${paramCounter}`;
        queryParams.push(filters.minBudget);
        paramCounter++;
      }
      
      if (filters.maxBudget) {
        query += ` AND r.rent_amount <= $${paramCounter}`;
        queryParams.push(filters.maxBudget);
        paramCounter++;
      }
      
      // Add room type filter
      if (filters.roomType) {
        query += ` AND r.room_type = $${paramCounter}`;
        queryParams.push(filters.roomType);
        paramCounter++;
      }
      
      // Add facilities filter (if any facility matches)
      if (filters.facilities && filters.facilities.length > 0) {
        query += ` AND r.facilities && $${paramCounter}::text[]`;
        queryParams.push(filters.facilities);
        paramCounter++;
      }
      
      // Group by property to avoid duplicates
      query += ` GROUP BY p.property_id, po.user_id, u.name`;
      
      // Order by creation date (newest first)
      query += ` ORDER BY p.created_at DESC`;
      
      const result = await db.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error('Error searching properties:', error);
      return [];
    }
  }
};

module.exports = Property;
