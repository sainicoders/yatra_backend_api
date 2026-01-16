const axios = require("axios");
const FlightProvider = require("./flight.provider");

class RealFlightProvider extends FlightProvider {
  async searchFlights(payload) {
    const res = await axios.post(
      "https://real-flight-api/search",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLIGHT_API_KEY}`,
        },
      }
    );

    return res.data.flights;
  }

  async bookFlight(payload) {
    const res = await axios.post(
      "https://real-flight-api/book",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLIGHT_API_KEY}`,
        },
      }
    );

    return res.data;
  }
}

module.exports = new RealFlightProvider();
