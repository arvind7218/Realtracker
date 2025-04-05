const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
// const bcrypt = require('bcrypt');
// const crypto = require('crypto');

async function getFare(pickup, destination) {

    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const distanceTime = await mapService.getDistanceTime(pickup, destination);
    console.log({
        distance: `${(distanceTime.distance / 1000).toFixed(2)} km`,
        duration: `${distanceTime.duration.toFixed(0)} seconds`
      });
      
      

    if (!distanceTime || !distanceTime.distance || !distanceTime.duration) {
        throw new Error('Could not get distance or duration from map service');
    }
    const baseFare = {
        auto: 30,
        car: 50,
        moto: 20
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        moto: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        moto: 1.5
    };

console.log(distanceTime)

const fare = {
    auto: Math.round(baseFare.auto + ((distanceTime.distance / 1000) * perKmRate.auto) + ((distanceTime.duration / 60) * perMinuteRate.auto)),
    car: Math.round(baseFare.car + ((distanceTime.distance / 1000) * perKmRate.car) + ((distanceTime.duration / 60) * perMinuteRate.car)),
    moto: Math.round(baseFare.moto + ((distanceTime.distance / 1000) * perKmRate.moto) + ((distanceTime.duration / 60) * perMinuteRate.moto))
};

    return fare;


}

module.exports.getFare = getFare;


function getOtp() {
    return Math.floor(100000 + Math.random() * 900000); // Generates 6-digit OTP
  }
  


module.exports.createRide = async ({
    user, pickup, destination, vehicleType
}) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await getFare(pickup, destination);
   console.log(fare)


    const ride = rideModel.create({
        user,
        pickup,
        destination,
        otp: getOtp(6),
        fare: fare[ vehicleType ]
    })

    return ride;
}

// module.exports.confirmRide = async ({
//     rideId, captain
// }) => {
//     if (!rideId) {
//         throw new Error('Ride id is required');
//     }

//     await rideModel.findOneAndUpdate({
//         _id: rideId
//     }, {
//         status: 'accepted',
//         captain: captain._id
//     })

//     const ride = await rideModel.findOne({
//         _id: rideId
//     }).populate('user').populate('captain').select('+otp');

//     if (!ride) {
//         throw new Error('Ride not found');
//     }

//     return ride;

// }

// module.exports.startRide = async ({ rideId, otp, captain }) => {
//     if (!rideId || !otp) {
//         throw new Error('Ride id and OTP are required');
//     }

//     const ride = await rideModel.findOne({
//         _id: rideId
//     }).populate('user').populate('captain').select('+otp');

//     if (!ride) {
//         throw new Error('Ride not found');
//     }

//     if (ride.status !== 'accepted') {
//         throw new Error('Ride not accepted');
//     }

//     if (ride.otp !== otp) {
//         throw new Error('Invalid OTP');
//     }

//     await rideModel.findOneAndUpdate({
//         _id: rideId
//     }, {
//         status: 'ongoing'
//     })

//     return ride;
// }

// module.exports.endRide = async ({ rideId, captain }) => {
//     if (!rideId) {
//         throw new Error('Ride id is required');
//     }

//     const ride = await rideModel.findOne({
//         _id: rideId,
//         captain: captain._id
//     }).populate('user').populate('captain').select('+otp');

//     if (!ride) {
//         throw new Error('Ride not found');
//     }

//     if (ride.status !== 'ongoing') {
//         throw new Error('Ride not ongoing');
//     }

//     await rideModel.findOneAndUpdate({
//         _id: rideId
//     }, {
//         status: 'completed'
//     })

//     return ride;
// }

