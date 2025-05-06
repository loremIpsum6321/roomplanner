// File: js/services/PersistenceService.js
/**
 * File: js/services/PersistenceService.js
 * --------------------------------------
 * Handles saving and loading the application state (room dimensions, objects)
 * to and from the browser's localStorage.
 *
 * Version History:
 * - v1.0 - Initial creation. Implements saveLayout and loadLayout.
 */

const STORAGE_KEY = 'roomPlannerLayout_v1'; // Use a versioned key

/**
 * Saves the current room layout to localStorage.
 * @param {Room} room - The current Room instance.
 * @param {ObjectManager} objectManager - The ObjectManager instance containing placed objects.
 * @returns {boolean} True if saving was successful, false otherwise.
 * @throws {Error} If localStorage is not available or saving fails.
 */
export function saveLayout(room, objectManager) {
    if (!window.localStorage) {
        console.warn("LocalStorage is not available. Cannot save layout.");
        return false;
    }
    if (!room || !objectManager) {
        console.error("Cannot save layout: Room or ObjectManager instance is missing.");
        return false;
    }

    try {
        const objectsToSave = objectManager.getAllObjects().map(obj => ({
            // Include all necessary properties to reconstruct the object
            typeId: obj.typeId,
            name: obj.name,
            label: obj.label,
            widthUnits: obj.widthUnits,
            lengthUnits: obj.lengthUnits,
            color: obj.color,
            x: obj.x, // Save center coordinates in pixels (relative to the saved room size)
            y: obj.y,
            rotation: obj.rotation,
            // Note: We don't save uniqueId, isSelected, scale, or pixel dimensions directly
            // These will be regenerated or recalculated on load.
        }));

        const layoutData = {
            room: {
                width: room.width, // Save actual room dimensions
                length: room.length,
            },
            objects: objectsToSave,
        };

        const jsonString = JSON.stringify(layoutData);
        localStorage.setItem(STORAGE_KEY, jsonString);
        console.log("Layout saved successfully.");
        return true;
    } catch (error) {
        console.error("Error saving layout to localStorage:", error);
        // Consider more robust error handling, e.g., clearing corrupted data
        throw new Error("Failed to save layout.");
    }
}

/**
 * Loads the room layout from localStorage.
 * @returns {object|null} The parsed layout data object (containing room and objects arrays) or null if no data found or error occurs.
 */
export function loadLayout() {
    if (!window.localStorage) {
        console.warn("LocalStorage is not available. Cannot load layout.");
        return null;
    }

    try {
        const jsonString = localStorage.getItem(STORAGE_KEY);
        if (!jsonString) {
            console.log("No saved layout found.");
            return null;
        }

        const layoutData = JSON.parse(jsonString);

        // Basic validation of loaded data structure
        if (!layoutData || !layoutData.room || !layoutData.objects || typeof layoutData.room.width !== 'number' || typeof layoutData.room.length !== 'number' || !Array.isArray(layoutData.objects)) {
            console.error("Invalid layout data found in localStorage. Clearing invalid data.");
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        console.log("Layout loaded successfully.");
        return layoutData;

    } catch (error) {
        console.error("Error loading layout from localStorage:", error);
        // Clear potentially corrupted data
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

/**
 * Clears the saved room layout from localStorage.
 * @returns {boolean} True if clearing was successful or not needed, false otherwise.
 */
export function clearSavedLayout() {
     if (!window.localStorage) {
        console.warn("LocalStorage is not available. Cannot clear layout.");
        return false;
    }
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log("Saved layout cleared.");
        return true;
    } catch (error) {
        console.error("Error clearing saved layout:", error);
        return false;
    }
}


/*
// --- Usage Example ---
// import { saveLayout, loadLayout, clearSavedLayout } from './services/PersistenceService.js';
// import { Room } from '../models/Room.js';
// import { ObjectManager } from './ObjectManager.js'; // Assuming correct path
//
// // --- Saving ---
// // Assume 'currentRoom' is a Room instance and 'objectManager' is an ObjectManager instance
// // try {
// //   saveLayout(currentRoom, objectManager);
// // } catch (e) {  Handle error 
//
// // --- Loading ---
// // const loadedData = loadLayout();
// // if (loadedData) {
// //   console.log("Loaded Room Width:", loadedData.room.width);
// //   console.log("Loaded Objects:", loadedData.objects);
// //   // Proceed to recreate Room and Objects using loadedData
// // }
//
// // --- Clearing ---
// // clearSavedLayout();
*/