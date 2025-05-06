/**
 * File: js/services/ObjectManager.js
 * ---------------------------------
 * Defines the ObjectManager class, responsible for managing the collection
 * of PlacedObject instances within the room. Handles adding, selecting,
 * moving, rotating, and deleting objects.
 *
 * Version History:
 * - v1.0 - Initial creation. Basic add, select, move, rotate, delete, boundary checks.
 * - v1.1 - Modified addObject to accept a full objectDefinition.
 */
import { degreesToRadians, isPointInRotatedRectangle } from '../utils.js'; // Correct path
import { PlacedObject } from '../models/PlacedObject.js';
// --- CHANGE: OBJECT_LIBRARY no longer needed for lookup ---
// import { OBJECT_LIBRARY, SELECTION_THRESHOLD } from '../config.js';
import { SELECTION_THRESHOLD } from '../config.js'; // Keep threshold


export class ObjectManager {
    /**
     * Creates an ObjectManager instance.
     * @param {Room} room - The Room object representing the current room.
     */
    constructor(room) {
        if (!room) {
            throw new Error("ObjectManager requires a Room instance.");
        }
        this.room = room;
        this.placedObjects = []; // Array to hold PlacedObject instances
        this.selectedObject = null;
        this.onChangeCallback = null; // Callback function to notify changes (e.g., for redraw)
    }

    /**
     * Sets a callback function to be invoked whenever the objects change.
     * @param {Function} callback - The function to call on changes.
     */
    setOnChangeCallback(callback) {
        this.onChangeCallback = callback;
    }

    /**
     * Notifies listeners that the object state has changed.
     * @private
     */
    _notifyChange() {
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }

     /**
     * Updates the scale for all managed objects. Usually called when room changes.
     * @param {number} newScale - The new scale from the Room object.
     */
     updateObjectScales(newScale) {
        this.placedObjects.forEach(obj => obj.updateScale(newScale));
        this._notifyChange(); // Redraw needed as sizes changed
    }

    /**
     * --- START CHANGES ---
     * Adds a new object to the room based on a provided definition.
     * @param {object} objectDefinition - An object containing properties like id, name, width, length, color.
     * @param {number} initialX - Initial center x-coordinate in pixels.
     * @param {number} initialY - Initial center y-coordinate in pixels.
     * @returns {PlacedObject|null} The newly created PlacedObject or null if definition is invalid.
     */
    addObject(objectDefinition, initialX, initialY) {
        // Basic validation of the definition
        if (!objectDefinition || !objectDefinition.id || !objectDefinition.name || !(objectDefinition.width > 0) || !(objectDefinition.length > 0)) {
             console.error('Invalid objectDefinition passed to addObject:', objectDefinition);
             return null;
        }

        // Removed lookup logic: const definition = OBJECT_LIBRARY.find(...)

        const newObject = new PlacedObject(objectDefinition, initialX, initialY, this.room.scale);
        this.placedObjects.push(newObject);
        this.selectObject(newObject); // Select the newly added object
        this._notifyChange();
        return newObject;
    }
    // --- END CHANGES ---


    /**
     * Selects a specific object instance.
     * @param {PlacedObject | null} objectToSelect - The object instance to select, or null to deselect all.
     */
    selectObject(objectToSelect) {
        if (this.selectedObject) {
            this.selectedObject.isSelected = false;
        }
        this.selectedObject = objectToSelect;
        if (this.selectedObject) {
            this.selectedObject.isSelected = true;
        }
        this._notifyChange(); // Notify UI/Renderer about selection change
    }

    /**
     * Finds and selects the topmost object at a given canvas coordinate.
     * @param {number} canvasX - The x-coordinate on the canvas.
     * @param {number} canvasY - The y-coordinate on the canvas.
     * @returns {PlacedObject | null} The selected object, or null if no object found.
     */
    selectObjectAt(canvasX, canvasY) {
        let foundObject = null;
        // Iterate backwards to select the topmost object
        for (let i = this.placedObjects.length - 1; i >= 0; i--) {
            const obj = this.placedObjects[i];
            const dims = obj.getPixelDimensions();
            // --- CORRECTION: Use object's center (x,y) not draw coords for rotation center ---
            // const coords = obj.getDrawingCoords(); // Incorrect for rotation check logic in utils
            const halfWidth = dims.width / 2;
            const halfHeight = dims.height / 2;
            // Check using the actual center and dimensions
            if (isPointInRotatedRectangle(canvasX, canvasY, obj.x - halfWidth, obj.y - halfHeight, dims.width, dims.height, obj.rotation)) {
                foundObject = obj;
                break;
            }
        }
        this.selectObject(foundObject);
        return foundObject;
    }


    /**
     * Moves the currently selected object to a new position, enforcing boundaries.
     * @param {number} newX - The new center x-coordinate in pixels.
     * @param {number} newY - The new center y-coordinate in pixels.
     */
    moveSelectedObject(newX, newY) {
        if (!this.selectedObject || !this.room) return;

        const { width: roomPixelWidth, height: roomPixelHeight } = this.room.getPixelDimensions();

        // --- IMPROVED BOUNDARY CHECK (still Axis-Aligned, but considers rotation better) ---
        // Get the Axis-Aligned Bounding Box (AABB) of the rotated object
        const objDims = this.selectedObject.getPixelDimensions();
        const angleRad = degreesToRadians(this.selectedObject.rotation);
        const cosA = Math.cos(angleRad);
        const sinA = Math.sin(angleRad);
        const w = objDims.width;
        const h = objDims.height;

        // Calculate the projected width and height onto the axes
        const projectedWidth = Math.abs(w * cosA) + Math.abs(h * sinA);
        const projectedHeight = Math.abs(w * sinA) + Math.abs(h * cosA);

        const halfProjectedWidth = projectedWidth / 2;
        const halfProjectedHeight = projectedHeight / 2;

        // Clamp based on the AABB
        const clampedX = Math.max(halfProjectedWidth, Math.min(newX, roomPixelWidth - halfProjectedWidth));
        const clampedY = Math.max(halfProjectedHeight, Math.min(newY, roomPixelHeight - halfProjectedHeight));

        this.selectedObject.setPosition(clampedX, clampedY);
        this._notifyChange();
    }

    /**
     * Rotates the currently selected object.
     */
    rotateSelectedObject() {
        if (!this.selectedObject) return;
        this.selectedObject.rotate();
        // Re-check boundaries after rotation (optional, but good practice)
        // For simplicity, we won't force it back in bounds here, but moveSelectedObject will clamp on next move.
        this._notifyChange();
    }

    /**
     * Deletes the currently selected object.
     */
    deleteSelectedObject() {
        if (!this.selectedObject) return;

        const index = this.placedObjects.findIndex(obj => obj.uniqueId === this.selectedObject.uniqueId);
        if (index > -1) {
            this.placedObjects.splice(index, 1);
            this.selectedObject = null; // Deselect
            this._notifyChange();
        }
    }

    /**
     * Gets the currently selected object.
     * @returns {PlacedObject | null} The selected object or null.
     */
    getSelectedObject() {
        return this.selectedObject;
    }

    /**
     * Gets all placed objects.
     * @returns {PlacedObject[]} An array of all PlacedObject instances.
     */
    getAllObjects() {
        return [...this.placedObjects]; // Return a copy
    }
}

/*
// --- Updated Usage Example ---
// import { ObjectManager } from './services/ObjectManager.js';
// import { Room } from '../models/Room.js';
// import { CUSTOM_OBJECT_DEFAULTS } from '../config.js';
//
// const room = new Room(5, 4);
// const manager = new ObjectManager(room);
//
// manager.setOnChangeCallback(() => { ... });
//
// // Construct a definition before adding
// const customDef = {
//     id: `custom-${Date.now()}`, // Simple unique ID
//     name: CUSTOM_OBJECT_DEFAULTS.name,
//     width: 1.5, // From user input
//     length: 0.8, // From user input
//     color: CUSTOM_OBJECT_DEFAULTS.color
// };
// manager.addObject(customDef, 100, 100);
// ...
*/