exports.calculateCancellationCharges = ({
  totalAmount,
  departureTime,
}) => {
  const now = new Date();
  const departure = new Date(departureTime);

  const hoursLeft = (departure - now) / (1000 * 60 * 60);

  let chargePercent = 0;

  if (hoursLeft > 24) chargePercent = 10;
  else if (hoursLeft > 12) chargePercent = 25;
  else if (hoursLeft > 6) chargePercent = 50;
  else if (hoursLeft > 0) chargePercent = 75;
  else chargePercent = 100;

  const chargeAmount = Math.round(
    (totalAmount * chargePercent) / 100
  );

  return {
    chargePercent,
    chargeAmount,
    refundAmount: totalAmount - chargeAmount,
  };
};
