const { v4: uuidv4 } = require("uuid");
const FlightProvider = require("./flight.provider");

class MockFlightProvider extends FlightProvider {
  async searchFlights({ from, to, date, passengers }) {
    return [
      {
        flightId: uuidv4(),
        airline: "IndiGo",
        flightNumber: "6E-203",
        from,
        to,
        departureTime: `${date}T08:30:00`,
        arrivalTime: `${date}T10:45:00`,
        duration: "2h 15m",
        price: 4500,
        seatsAvailable: 10,
      },
    ];
  }

  async bookFlight({ flightId, passengers }) {
    return {
      status: "CONFIRMED",
      pnr: "MOCKPNR" + Math.floor(100000 + Math.random() * 900000),
    };
  }
}

module.exports = new MockFlightProvider();
