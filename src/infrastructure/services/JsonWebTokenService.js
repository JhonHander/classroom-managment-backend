import jwt from 'jsonwebtoken';
import IJwtService from '../../application/ports/IJwtService.js';

class JsonWebTokenService extends IJwtService {
    constructor(secret, defaultExpiresIn = '1h') {
        // Call the parent constructor
        super();
        if (!secret) {
            throw new Error('JWT secret must be provided to JsonWebTokenService constructor');
        }
        this.secret = secret;
        this.defaultExpiresIn = defaultExpiresIn;
    }

    async generateToken(payload, expiresIn) {
        const options = { expiresIn: expiresIn || this.defaultExpiresIn };
        return jwt.sign(payload, this.secret, options);
    }

    async verifyToken(token) {
        try {
            return jwt.verify(token, this.secret);
        } catch (error) {
            // Manejar errores específicos de JWT (TokenExpiredError, JsonWebTokenError)
            if (error.name === 'TokenExpiredError') {
                console.error("JWT Token Expired:", error.message);
            } else if (error.name === 'JsonWebTokenError') {
                console.error("JWT Invalid Token:", error.message);
            } else {
                console.error("JWT Error:", error.message);
            }
            console.error("JWT Verification Error:", error.name);
            return null; // O lanzar un error específico de autenticación
        }
    }
}

export default JsonWebTokenService;

// npm install bcrypt jsonwebtoken