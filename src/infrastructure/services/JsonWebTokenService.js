import jwt from 'jsonwebtoken';
import IJwtService from '../../application/ports/IJwtService.js';

class JsonWebTokenService extends IJwtService {
    constructor(secret, defaultExpiresIn = '1h', refreshSecret = null, refreshExpiresIn = '7d') {
        // Call the parent constructor
        super();
        if (!secret) {
            throw new Error('JWT secret must be provided to JsonWebTokenService constructor');
        }
        this.secret = secret;
        this.defaultExpiresIn = defaultExpiresIn;
        this.refreshSecret = refreshSecret;
        this.refreshExpiresIn = refreshExpiresIn;
    }

    async generateToken(payload, expiresIn) {
        const options = { expiresIn: expiresIn || this.defaultExpiresIn };
        return jwt.sign(payload, this.secret, options);
    }

    async generateRefreshToken(payload) {
        // El refresh token solo debe contener el ID del usuario y quizás el rol
        // Evita poner demasiada información en el refresh token
        // const refreshPayload = {
        //     id: payload.id,
        //     role: payload.role?.name || 'user'
        // };
        const options = { expiresIn: this.refreshExpiresIn || this.defaultExpiresIn };
        return jwt.sign(payload, this.refreshSecret, options);
    }    async verifyToken(token) {
        try {
            return jwt.verify(token, this.secret);
        } catch (error) {
            // Manejar errores específicos de JWT (TokenExpiredError, JsonWebTokenError)
            if (error.name === 'TokenExpiredError') {
                console.error("JWT Token Expired:", error.message);
                throw new Error('Token expired');
            } else if (error.name === 'JsonWebTokenError') {
                console.error("JWT Invalid Token:", error.message);
                throw new Error('Invalid token');
            } else {
                console.error("JWT Error:", error.message);
                throw error;
            }
        }
    }

    async verifyRefreshToken(token) {
        try {
            return jwt.verify(token, this.refreshSecret);
        } catch (error) {
            console.error("Refresh Token Verification Error:", error.name, error.message);
            if (error.name === 'TokenExpiredError') {
                throw new Error('Refresh token expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid refresh token');
            } else {
                throw error;
            }
        }
    }
}

export default JsonWebTokenService;

// npm install bcrypt jsonwebtoken