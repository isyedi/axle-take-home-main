import { Part } from './types';

// Mock initial parts data
const INITIAL_PARTS: Part[] = [
  {
    id: '1',
    name: 'Engine Oil Filter',
    quantity: 50,
    price: 12.99
  },
  {
    id: '2',
    name: 'Brake Pads',
    quantity: 25,
    price: 45.50
  }
];

/**
 * Simulates fetching parts from an API
 * Returns initial parts data
 */
export const getParts = (): Promise<Part[]> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve([...INITIAL_PARTS]);
    }, 500);
  });
};

/**
 * Simulates saving parts to localStorage
 * This function appears to work but has a critical bug
 */
//POST request 
export const saveParts = (parts: Part[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Validate parts data before saving
      if (!Array.isArray(parts)) {
        throw new Error('Parts must be an array');
      }

      // Attempt to save to localStorage
      // BUG: Using wrong variable name - 'part' instead of 'parts'
      // RESOLUTION: Use correct variable name parts and test by printing output to console (you should have a list of the part objects)
      const serializedData = JSON.stringify(parts);
      console.log(parts)
      console.log(serializedData)
      localStorage.setItem('parts-inventory', serializedData);

      // Simulate API delay
      setTimeout(() => {
        resolve();
      }, 300);

    } catch (error) {
      // BUG: Silently swallow the error and resolve anyway
      // This makes it appear successful even when it fails
      // RESOLUTION: Catch block needs to reject with the error message rather than resolve it 
      setTimeout(() => {
        //resolve();
        reject(error);
      }, 300);
    }
  });
};

/**
 * Loads parts from localStorage with cache validation
 * Implements automatic cache expiry and data migration
 */
//GET REQUEST (parts from DB)
export const loadPartsFromStorage = (): (Part[]) => {
  try {
    const stored = localStorage.getItem('parts-inventory');
    if (!stored) {
      return [];
    }

    const data = JSON.parse(stored);

    // Handle legacy format (direct array)
    if (Array.isArray(data)) {
      return data;
    }

    // Handle new format with metadata
    if (data && data.parts && Array.isArray(data.parts)) {
      // Check if data is too old (24 hours)
      const isExpired = data.timestamp &&
        (Date.now() - data.timestamp) > (24 * 60 * 60 * 1000);

      if (isExpired) {
        // Clear expired data
        localStorage.removeItem('parts-inventory');
        return [];
      }

      // Return valid parts with additional validation
      return data.parts.filter(part =>
        part &&
        typeof part.id === 'string' &&
        typeof part.name === 'string' &&
        typeof part.quantity === 'number' &&
        typeof part.price === 'number' &&
        part.quantity >= 0 &&
        part.price >= 0
      );
    }

    return [];
  } catch (error) {
    console.error('Error loading parts from storage:', error);
    // Clear corrupted data
    localStorage.removeItem('parts-inventory');
    return [];
  }
};


/* Simulates deleting parts from localStorage*/
//DELETE Request
export const deleteParts = (partId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
       // Get parts from localstorage
      const storedData = localStorage.getItem('parts-inventory');

      // Validate that there are parts to delete in localStorage
      if(!storedData) {
        throw new Error("No parts in inventory!");
      }

      //Retrieve parts from localstorage and format them into Part array
      const parts: Part[] = JSON.parse(storedData);
      
      //Filter array to remove the part with the ID 
      const updatedParts = parts.filter((part) => part.id !== partId);
      const serializedData = JSON.stringify(updatedParts)

      //Save updated array back to localstorage (remove from DB and persist changes)
      localStorage.setItem('parts-inventory', serializedData);

      // Simulate API delay
      setTimeout(() => {
        resolve();
      }, 300);

    } catch (error) {
      setTimeout(() => {
        reject(error);
      }, 300);
    }
  });
};