import { Expo } from 'expo-server-sdk';
import { logger } from '../config/logger.js';

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
let expo = new Expo();

/**
 * Sends a push notification via Expo
 * @param {string} pushToken - The target expo push token
 * @param {string} title - The notification title
 * @param {string} body - The notification body
 * @param {object} data - Extra JSON payload
 */
export const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    logger.error(`Push token ${pushToken} is not a valid Expo push token`);
    return false;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const receipts = await expo.sendPushNotificationsAsync([message]);
    const receiptId = receipts[0].id;
    if (receipts[0].status === 'error') {
      logger.error(`Error sending push notification: ${receipts[0].message}`);
      if (receipts[0].details && receipts[0].details.error) {
        logger.error(`The error code is ${receipts[0].details.error}`);
      }
      return false;
    }
    logger.info(`Successfully sent push notification to ${pushToken}`);
    return true;
  } catch (error) {
    logger.error(`Expo SDK Error: ${error.message}`);
    return false;
  }
};
