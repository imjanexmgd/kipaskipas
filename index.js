import { randomBytes, randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import random from 'random';
import {
  checkEmail,
  followUser,
  registeringUser,
  requestOtp,
  verifyEmail,
} from './func.js';
import logger from './logger.js';
import secmail from './secmail.js';
import delay from './delay.js';
import { readFile } from 'node:fs/promises';

const randomDeviceID = () => randomBytes(8).toString('hex');

const clear = () => {
  process.stdout.write('\x1Bc');
};
const randomCaseString = (input) =>
  input
    .split('')
    .map((char) =>
      Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
    )
    .join('');

const randomEmailName = (email) =>
  `${randomCaseString(email)}${randomBytes(2).toString('hex')}${random.integer(
    1,
    999
  )}`;
const config = JSON.parse(
  await readFile(new URL('./config.json', import.meta.url))
);
(async () => {
  try {
    clear();
    let i = 1;
    let created = 0;
    while (true) {
      const emails = config.prefixEmail;
      const formattedEmail = randomEmailName(emails);

      const reffCode = config.reffCode;
      const deviceId = randomDeviceID();
      logger.info(`Using device ID: ${deviceId}`);

      const listDomain = await secmail.getDomain();
      const email = `${formattedEmail}@${listDomain[0]}`;
      logger.info(`Using email: ${email}`);
      const checkEmailResult = await checkEmail(deviceId, email);
      if (!checkEmailResult.success) {
        logger.failed('Email is already registered');
        console.log();

        continue;
      }
      logger.info(`${formattedEmail} is not registered`);

      const reqOtp = await requestOtp(deviceId, email);
      if (!reqOtp.success) {
        logger.failed('Cannot send OTP');
        return;
      }
      logger.success(`Successfully sent OTP to ${formattedEmail}`);

      let otp = null;
      const maxRetries = 3;
      let retries = 0;

      while (retries < maxRetries) {
        const mailbox = await secmail.getMailBox(email);
        if (mailbox.length > 0) {
          const newestMailBox = mailbox[0];
          logger.info(`Received email: ${newestMailBox.subject}`);
          const otpMatch = newestMailBox.subject.match(/\b\d{4,6}\b/);
          if (otpMatch) {
            otp = otpMatch[0];
            break;
          } else {
            logger.failed('OTP not found in email subject');
          }
        }

        retries++;
        logger.info(`Retrying... (${retries}/${maxRetries})`);
        await delay(5000);
      }

      if (!otp) {
        logger.failed('Failed to retrieve OTP within the timeout period');
        console.log();

        continue;
      }

      await verifyEmail(deviceId, email, otp);
      logger.success(`Successfully verified email: ${formattedEmail}`);
      const password = 'Yupi#123';
      const dataToRegist = {
        birthDate: `${random.integer(1990, 2003)}-${random.integer(
          10,
          12
        )}-${random.integer(10, 25)}`,
        deviceId,
        email,
        otpCode: otp,
        password: config.password,
        referralCode: reffCode,
        userNotifId: randomUUID(),
      };
      console.log(dataToRegist);

      const doRegist = await registeringUser(deviceId, dataToRegist);
      const { userName, userNo, access_token } = doRegist;

      logger.success(`${formattedEmail} successfully registered`);
      logger.success(`Username: ${userName}`);
      logger.info(`User Number: ${userNo}`);
      const targetid = config.targetProfile;
      await followUser(deviceId, access_token, targetid);
      created++;
      logger.success(`success created ${created} account`);
      console.log();

      const filePath = path.join(process.cwd(), 'account.txt');
      if (!fs.existsSync(filePath)) {
        logger.info(`Creating file: ${filePath}`);
        fs.writeFileSync(filePath, '', 'utf8');
        logger.success(`File created: ${filePath}`);
      }

      const result = `${reffCode} ${email} ${password}\n`;
      fs.appendFileSync(filePath, result);
      // await delay(5000);
      i++;
    }
  } catch (error) {
    logger.failed(error.message || 'Unknown error occurred');
    if (error.response?.data?.data) {
      console.error(error.response.data.data);
    } else {
      console.error(error);
    }
  }
})();
