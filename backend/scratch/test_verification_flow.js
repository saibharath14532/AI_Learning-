import dotenv from 'dotenv';
dotenv.config();

import { register, verifyEmail, resendVerificationCode } from '../controllers/authController.js';

async function runTests() {
  console.log('--- STARTING VERIFICATION FLOW UNIT TESTS ---');

  // Test 1: Register User and dispatch OTP
  const reqRegister = {
    body: {
      name: 'Test Learner',
      email: 'testlearner@example.com',
      password: 'securepassword123',
    },
  };
  let resRegisterData = {};
  const resRegister = {
    status: (code) => ({
      json: (data) => {
        resRegisterData = { statusCode: code, ...data };
        return resRegisterData;
      },
    }),
  };

  await register(reqRegister, resRegister);
  console.log('1. Register Result:', resRegisterData);

  // Test 2: Resend Verification Code
  const reqResend = {
    body: { email: 'testlearner@example.com' },
  };
  let resResendData = {};
  const resResend = {
    status: (code) => ({
      json: (data) => {
        resResendData = { statusCode: code, ...data };
        return resResendData;
      },
    }),
  };

  await resendVerificationCode(reqResend, resResend);
  console.log('2. Resend Code Result:', resResendData);

  // Test 3: Invalid Code Verification
  const reqInvalid = {
    body: { email: 'testlearner@example.com', code: '000000' },
  };
  let resInvalidData = {};
  const resInvalid = {
    status: (code) => ({
      json: (data) => {
        resInvalidData = { statusCode: code, ...data };
        return resInvalidData;
      },
    }),
  };

  await verifyEmail(reqInvalid, resInvalid);
  console.log('3. Invalid Verification Result (Expect Failure):', resInvalidData);

  console.log('--- VERIFICATION FLOW TESTS COMPLETED ---');
}

runTests().catch(console.error);
