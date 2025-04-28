# YourRoom Web Application

YourRoom is a platform that connects students and working professionals with PG/hostel owners, making the room hunting process simpler and more efficient.

## Features

- **Dual Registration System**: Separate forms for accommodation seekers and providers
- **Property Listing**: PG/hostel owners can list their properties with detailed information
- **Search Functionality**: Users can search for accommodations based on location, budget, and facilities
- **Responsive Design**: Works on both desktop and mobile devices

## Usage Instructions

### For Room Seekers

1. **Registration**:
   - Click on "I'm Looking for a Room" on the homepage
   - Fill out the registration form with your personal details and room preferences
   - Submit the form to register as a seeker

2. **Searching for Rooms**:
   - Use the search functionality to find rooms based on your criteria
   - Filter results by city, budget range, room type, and required facilities
   - Click on property listings to view detailed information

3. **Viewing Property Details**:
   - Browse through property images (when available)
   - Check room types, rent amounts, and available facilities
   - View owner contact information to reach out directly

### For PG/Hostel Owners

1. **Registration**:
   - Click on "I Have a PG/Hostel to List" on the homepage
   - Fill out the registration form with your personal details and property information
   - Add details about room types, rent, and available facilities
   - Submit the form to register as an owner and list your property

2. **Managing Listings**:
   - Your property will be visible to potential tenants immediately after registration
   - (Future feature) Update property details and room availability

## Technical Details

- **Frontend**: HTML, CSS, JavaScript, Bootstrap, EJS templates
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: Password hashing with bcrypt

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up PostgreSQL database and run the schema file: `psql -d yourroom -f setup.sql`
4. Configure environment variables in `.env` file
5. Start the server: `node server.js`

## Future Enhancements

- User authentication with login/logout functionality
- Dashboard for owners to manage multiple properties
- Image upload functionality for property photos
- Ratings and reviews system
- Map view for property locations
- Online booking and payment system

## Contact

For any questions or support, please contact the YourRoom team.
