export class IHashingService {
    async hashPassword(password) {
        throw new Error('Method not implemented');
    }

    async comparePassword(password, hashedPassword) {
        throw new Error('Method not implemented');
    }
}
// This interface defines the contract for a hashing service.
// It includes methods for hashing and comparing passwords.