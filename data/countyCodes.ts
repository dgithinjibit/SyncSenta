import { kenyanCounties } from './counties';

// Create a sorted list to ensure consistent codes
const sortedCounties = [...kenyanCounties].sort();

/**
 * A mapping of Kenyan county names to their corresponding two-digit code.
 * The code is generated based on the alphabetical order of the county name.
 * e.g., 'Baringo' -> '01', 'Bomet' -> '02', etc.
 */
export const countyCodes: { [key: string]: string } = {};

sortedCounties.forEach((county, index) => {
    // Pad with leading zero to ensure two digits
    const code = (index + 1).toString().padStart(2, '0');
    countyCodes[county] = code;
});
