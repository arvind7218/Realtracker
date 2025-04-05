const axios = require('axios');
const captainModel = require('../models/captain.model');

const orsApiKey = process.env.ORS_API_KEY;

// Get coordinates from address using ORS geocoding

module.exports.getAddressCoordinate = async (address) => {
    try {
        const response = await axios.get('https://api.openrouteservice.org/geocode/search', {
            params: {
                api_key: process.env.ORS_API_KEY,
                text: address,
                'boundary.country': 'IN', // ✅ wrap the key in quotes
                size: 1
            }

        });

        const features = response.data.features;

        if (features.length === 0) {
            console.log(`No coordinates found for: ${address}`);
            return null;
        }

        const [lng, ltd] = features[0].geometry.coordinates;
        return { lng, ltd };
    } catch (err) {
        console.error('Error in getAddressCoordinate:', err.message);
        return null;
    }
};




// Get distance and duration between origin and destination using ORS matrix API
module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    try {
        // Get coordinates
        const originCoords = await module.exports.getAddressCoordinate(origin);
        const destinationCoords = await module.exports.getAddressCoordinate(destination);

        console.log('Origin Coordinates:', originCoords);
        console.log('Destination Coordinates:', destinationCoords);

        // Check if coordinates are valid
        if (!originCoords || !destinationCoords) {
            console.log('Missing coords:', { originCoords, destinationCoords });
            return {
                distance: null,
                duration: null,
                debug: {
                    originCoords,
                    destinationCoords
                }
            };
        }


        const url = `https://api.openrouteservice.org/v2/matrix/driving-car`;

        const response = await axios.post(
            url,
            {
                locations: [
                    [originCoords.lng, originCoords.ltd],
                    [destinationCoords.lng, destinationCoords.ltd]
                ],
                metrics: ['distance', 'duration']
            },
            {
                headers: {
                    'Authorization': process.env.ORS_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );


        const data = response.data;

        if (
            !data ||
            !data.distances ||
            !data.durations ||
            !data.distances[0] ||
            !data.durations[0]
        ) {
            throw new Error('Invalid response from ORS Matrix API');
        }

        return {
            distance: data.distances[0][1], // in meters
            duration: data.durations[0][1]  // in seconds
        };
    } catch (err) {
        console.error('Error in getDistanceTime:', err.message);
        return {
            distance: null,
            duration: null
        };
    }
};


// Get address autocomplete suggestions using ORS (limited functionality vs Google)
module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) throw new Error('query is required');

    const apiKey = process.env.ORS_API_KEY;

    const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(input)}`;

    try {
        const response = await axios.get(url);
        // console.log('ORS autocomplete response:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.features?.length > 0) {
            return response.data.features.map(f => f.properties.label).filter(Boolean);
        }

        return [];
    } catch (err) {
        console.error(err);
        throw err;
    }
}



// Get captains within radius using MongoDB geospatial query
module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    // radius in km
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [[ltd, lng], radius / 6371]
            }
        }
    });

    return captains;
};
