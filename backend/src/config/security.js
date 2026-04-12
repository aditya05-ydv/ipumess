import crypto from 'crypto';

const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || 'change-this-in-env';
const PASSWORD_SECRET = process.env.PASSWORD_SECRET || 'change-this-password-secret';
const TOKEN_TTL_MS = Number(process.env.AUTH_TOKEN_TTL_MS || 1000 * 60 * 60 * 24);

export const hashSecret = (rawValue) => {
  return crypto.createHmac('sha256', PASSWORD_SECRET).update(String(rawValue)).digest('hex');
};

export const verifySecret = (rawValue, hashedValue) => {
  return hashSecret(rawValue) === hashedValue;
};

export const createAuthToken = (payload) => {
  const tokenPayload = {
    ...payload,
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
};

export const verifyAuthToken = (token) => {
  if (!token || !token.includes('.')) {
    throw new Error('Invalid token');
  }

  const [encodedPayload, providedSignature] = token.split('.');
  const expectedSignature = crypto.createHmac('sha256', TOKEN_SECRET).update(encodedPayload).digest('base64url');

  if (providedSignature !== expectedSignature) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Date.now()) {
    throw new Error('Token expired');
  }

  return payload;
};
