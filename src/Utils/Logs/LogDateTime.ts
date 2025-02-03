import { formatInTimeZone } from 'date-fns-tz';

function logDateTime(): string {
	const formatedDate = formatInTimeZone(
		new Date(),
		'America/Sao_Paulo',
		'dd-MM-yyyy HH:mm:ss zzzz'
	);

	console.log(formatedDate);

	return formatedDate;
}

export { logDateTime };
