const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const getBangkokDatePart = (value: Date | string) => {
	if (typeof value === "string" && DATE_ONLY_PATTERN.test(value)) {
		return value;
	}

	const date = value instanceof Date ? value : new Date(value);
	const bangkokDate = new Date(date.getTime() + BANGKOK_OFFSET_MS);
	return bangkokDate.toISOString().slice(0, 10);
};

export const getBangkokDayRange = (value: Date | string) => {
	const [year, month, day] = getBangkokDatePart(value).split("-").map(Number);
	const start = new Date(Date.UTC(year, month - 1, day) - BANGKOK_OFFSET_MS);
	const end = new Date(Date.UTC(year, month - 1, day + 1) - BANGKOK_OFFSET_MS - 1);

	return { start, end };
};

export const toStoredCheckInDate = (value: Date | string) => {
	const [year, month, day] = getBangkokDatePart(value).split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
};
