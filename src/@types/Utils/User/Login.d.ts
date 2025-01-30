interface getUserDeviceProps {
	user_id: string;
}

interface registerDeviceProps {
	user_id: string;
	device_id: string;
	firebaseToken?: string;
}
