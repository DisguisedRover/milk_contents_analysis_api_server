require('dotenv').config();

const config = {
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    },
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
};

// Validate required configuration
if (!config.jwt.secret) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined');
}

module.exports = config;