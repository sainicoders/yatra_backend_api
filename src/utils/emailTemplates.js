exports.emailOTPTemplate = (otp) => `
  <div style="font-family: Arial">
    <h2>Login Verification</h2>
    <p>Your OTP is:</p>
    <h1>${otp}</h1>
    <p>Valid for 15 minutes.</p>
    <br/>
    <small>If you did not request this, ignore this email.</small>
  </div>
`;
