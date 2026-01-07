
export type FieldType = 'name' | 'email' | 'phone' | 'city' | 'country' | 'date' | 'number' | 'boolean' | 'uuid' | 'status';

export interface SchemaField {
    id: string;
    name: string;
    type: FieldType;
}

const FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const CITIES = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "San Francisco"];
const COUNTRIES = ["USA", "Canada", "UK", "Germany", "France", "Japan", "Australia", "Brazil", "India", "China"];
const DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "example.com", "test.org"];
const STATUSES = ["Active", "Inactive", "Pending", "Archived", "Deleted"];

export const FIELD_TYPES: { value: FieldType, label: string }[] = [
    { value: 'name', label: 'Full Name' },
    { value: 'email', label: 'Email Address' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'city', label: 'City' },
    { value: 'country', label: 'Country' },
    { value: 'date', label: 'Date (Past Year)' },
    { value: 'number', label: 'Random Number (1-100)' },
    { value: 'boolean', label: 'Boolean (True/False)' },
    { value: 'uuid', label: 'UUID' },
    { value: 'status', label: 'Status (Active/Inactive)' },
];

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMockRow(schema: SchemaField[]): Record<string, any> {
    const row: Record<string, any> = {};

    schema.forEach(field => {
        switch (field.type) {
            case 'name':
                row[field.name] = `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
                break;
            case 'email':
                const fname = getRandomElement(FIRST_NAMES).toLowerCase();
                const lname = getRandomElement(LAST_NAMES).toLowerCase();
                row[field.name] = `${fname}.${lname}@${getRandomElement(DOMAINS)}`;
                break;
            case 'phone':
                row[field.name] = `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
                break;
            case 'city':
                row[field.name] = getRandomElement(CITIES);
                break;
            case 'country':
                row[field.name] = getRandomElement(COUNTRIES);
                break;
            case 'date':
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 365));
                row[field.name] = date.toISOString().split('T')[0];
                break;
            case 'number':
                row[field.name] = Math.floor(Math.random() * 100) + 1;
                break;
            case 'boolean':
                row[field.name] = Math.random() > 0.5;
                break;
            case 'uuid':
                row[field.name] = crypto.randomUUID();
                break;
            case 'status':
                row[field.name] = getRandomElement(STATUSES);
                break;
            default:
                row[field.name] = '';
        }
    });

    return row;
}

export function generateMockData(schema: SchemaField[], count: number): Record<string, any>[] {
    return Array.from({ length: count }, () => generateMockRow(schema));
}
