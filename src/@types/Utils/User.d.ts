interface createUserProps {
    firebaseUid: string;
    name?: string;
    lastName?: string;
    email: string;
    password?: string;
}

interface updateUserProps {
    id: string;
    name?: string;
    lastName?: string;
    email?: string;
    password?: string;
}
