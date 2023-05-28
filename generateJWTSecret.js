const crypto = require('crypto');

const generateJWTSecret = () => {
    // Generate a 32-byte (256-bit) random string
    const secret = crypto.randomBytes(32).toString('hex');
    return secret;
  };

  const secretKey = generateJWTSecret();
console.log('Generated JWT Secret:', secretKey);
