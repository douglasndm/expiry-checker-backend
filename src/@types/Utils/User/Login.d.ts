interface getUserDeviceProps {
    user_id: string;
}

interface registerDeviceProps {
    user_id: string;
    device_id: string;
    ip_address?: string;
    firebaseToken?: string;
}
