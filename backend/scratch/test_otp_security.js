import crypto from 'crypto';

// 1. Verify 6-digit OTP generation
const generateSecureOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp) => {
  const salt = process.env.JWT_SECRET || 'ailp_otp_secret_hash_key_999';
  return crypto.createHash('sha256').update(String(otp).trim() + salt).digest('hex');
};

console.log('--- TESTING OTP SYSTEM ---');

const otp1 = generateSecureOTP();
console.log(`Generated OTP: ${otp1}`);
console.log(`OTP length: ${otp1.length}`);
if (otp1.length !== 6 || !/^\d{6}$/.test(otp1)) {
  console.error('FAILED: OTP is not 6 digits');
  process.exit(1);
}

const hash1 = hashOTP(otp1);
const hash2 = hashOTP(otp1);
const hashWrong = hashOTP('000000');

console.log(`Hash matches same OTP: ${hash1 === hash2}`);
console.log(`Hash differs for wrong OTP: ${hash1 !== hashWrong}`);

if (hash1 !== hash2 || hash1 === hashWrong) {
  console.error('FAILED: Hash verification failed');
  process.exit(1);
}

console.log('✅ ALL OTP SECURITY CHECKS PASSED SUCCESSFULLY.');
