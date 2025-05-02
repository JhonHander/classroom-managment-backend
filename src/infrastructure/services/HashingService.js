import bcrypt from 'bcrypt';
// import { IHashingService } from '../../application/ports/IHashingService';

export class HashingService extends IHashingService {
    constructor(saltRounds = 10) {
        // Call the parent constructor
        super();
        this.saltRounds = saltRounds; // Default to 10 if not provided
    }

    async hashPassword(password) {
        return await bcrypt.hash(password, this.saltRounds);
    }

    async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}