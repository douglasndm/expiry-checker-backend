import { FirebaseError } from 'firebase-admin';

export default function isFirebaseError(
    error: unknown,
): error is FirebaseError {
    return (error as FirebaseError).code !== undefined;
}
