class FlightProvider {
  async searchFlights(payload) {
    throw new Error("searchFlights not implemented");
  }

  async bookFlight(payload) {
    throw new Error("bookFlight not implemented");
  }
}

module.exports = FlightProvider;
