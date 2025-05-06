// File: js/main.js
/**
 * File: js/main.js
 * ----------------
 * Main entry point for the Room Layout Planner application.
 * Initializes components (Room, ObjectManager, CanvasRenderer, UIController, PersistenceService),
 * sets up event listeners, handles loading/saving the layout, and manages the overall application flow.
 *
 * Version History:
 * - v1.0 - Initial structure. Setup room, add/select/move objects basic implementation.
 * - v1.1 - Integrated UIController, event handling refinements. Reworked object addition.
 * - v1.2 - Added PersistenceService integration for localStorage saving/loading. Auto-saves on changes. Corrected drag offset calculation.
 */

// Core Components
import { Room } from './models/Room.js';
import { PlacedObject } from './models/PlacedObject.js';
import { ObjectManager } from './services/ObjectManager.js';
import { CanvasRenderer } from './services/CanvasRenderer.js';
import { UIController } from './controllers/UIController.js';
import { saveLayout, loadLayout, clearSavedLayout } from './services/PersistenceService.js'; // Import persistence functions

// Configuration
import { CUSTOM_OBJECT_DEFAULTS } from './config.js';

// Utility Functions
import { clamp } from './utils.js'; // Assuming clamp is needed for offsets, etc.

// Application State Variables
let currentRoom = null;
let objectManager = null;
let renderer = null;
let uiController = null;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let selectedObjectOffsetX = 0; // Offset from object center to mouse down point
let selectedObjectOffsetY = 0;
let customObjectCounter = 0; // Simple counter for unique internal IDs

// --- DOM Elements ---
// (Assume UIController caches most control elements)
const canvasElement = document.getElementById('room-canvas');
const roomWidthInput = document.getElementById('room-width');
const roomLengthInput = document.getElementById('room-length');
const clearLayoutButton = document.getElementById('clear-layout-button'); // Added in index.html

// --- Initialization ---
document.addEventListener('DOMContentLoaded', initializeApplication);

/**
 * Initializes the application: loads saved state or sets defaults,
 * creates core components, and sets up event listeners.
 */
function initializeApplication() {
    console.log("Initializing application...");

    if (!canvasElement || !roomWidthInput || !roomLengthInput || !clearLayoutButton) {
        console.error("One or more critical UI elements not found!");
        alert("Application initialization failed. Could not find required HTML elements.");
        return;
    }

    // --- Load or Set Initial State ---
    const savedData = loadLayout();
    let initialRoomWidth = 5; // Default width
    let initialRoomLength = 4; // Default length

    if (savedData) {
        console.log("Applying saved layout.");
        initialRoomWidth = savedData.room.width;
        initialRoomLength = savedData.room.length;
        // Update input fields to reflect loaded dimensions
        roomWidthInput.value = initialRoomWidth;
        roomLengthInput.value = initialRoomLength;
    } else {
        console.log("Using default room dimensions.");
        // Keep default values and ensure inputs match
        roomWidthInput.value = initialRoomWidth;
        roomLengthInput.value = initialRoomLength;
    }

    // --- Create Core Components ---
    // Renderer and UIController are created once
    renderer = new CanvasRenderer(canvasElement);
    uiController = new UIController(
        handleSetRoomSize,
        handleAddObject,
        handleRotateObject,
        handleDeleteObject
    );

    // --- Setup Event Listeners ---
    // Note: ObjectManager's onChange callback is set within handleSetRoomSize
    // because ObjectManager is recreated when the room changes.
    setupCanvasEventListeners();
    setupGeneralEventListeners();

    // --- Initial Room Setup ---
    // This will create the Room, ObjectManager, link them, load objects if needed, and draw
    // Pass loaded object data if it exists from localStorage
    handleSetRoomSize(initialRoomWidth, initialRoomLength, savedData?.objects);

    console.log("Application Initialized.");
}

// --- Event Handlers & Logic ---

/**
 * Handles the request to set or change the room size.
 * Recreates the Room and ObjectManager, updates scales, and redraws.
 * Also loads objects if provided (during initial load).
 * @param {number} width - The desired room width.
 * @param {number} length - The desired room length.
 * @param {Array} [objectsToLoad=null] - Optional array of saved object data to load.
 */
function handleSetRoomSize(width, length, objectsToLoad = null) {
    console.log(`Setting room size to: ${width} x ${length}`);
    try {
        // Validate dimensions before proceeding
        if (isNaN(width) || isNaN(length) || width <= 0 || length <= 0) {
            throw new Error("Invalid room dimensions provided.");
        }

        currentRoom = new Room(width, length);
        objectManager = new ObjectManager(currentRoom); // Create a new manager for the room

        // Link components that depend on Room/ObjectManager
        renderer.setRoom(currentRoom); // Renderer needs the room for dimensions/drawing
        renderer.setObjectManager(objectManager); // Renderer needs objects to draw
        objectManager.setOnChangeCallback(handleObjectChange); // Setup the callback for this manager instance

        // Load objects if provided (only during initial load from storage)
        if (objectsToLoad && Array.isArray(objectsToLoad)) {
            loadObjectsIntoManager(objectsToLoad);
        }

        // Trigger initial draw and UI update via the callback mechanism
        objectManager._notifyChange();

        // Save the new room state (even if no objects were loaded initially)
        // This ensures the current dimensions are saved if the user changes them.
        saveLayout(currentRoom, objectManager);

    } catch (error) {
        console.error("Error setting room size:", error);
        alert(`Failed to set room size: ${error.message}. Please check dimensions.`);
        // Optionally reset to previous valid state or defaults
    }
}

/**
 * Loads saved object data into the ObjectManager.
 * Should be called *after* Room and ObjectManager are created.
 * @param {Array} objectsData - Array of saved object data objects.
 */
function loadObjectsIntoManager(objectsData) {
    if (!objectManager || !currentRoom) {
        console.error("Cannot load objects: ObjectManager or Room not initialized.");
        return;
    }
    console.log(`Loading ${objectsData.length} objects...`);
    try {
        objectsData.forEach((objData, index) => {
            // Basic validation of individual object data
            if (objData.widthUnits <= 0 || objData.lengthUnits <= 0 || isNaN(objData.x) || isNaN(objData.y)) {
                 console.warn(`Skipping invalid object data at index ${index}:`, objData);
                 return; // Skip this invalid object
            }

            // Reconstruct the definition part needed by PlacedObject constructor
            const definitionPart = {
                id: objData.typeId || `custom-${Date.now()}-${index}`, // More robust fallback ID
                name: objData.name || 'Loaded Object',
                label: objData.label || '',
                width: objData.widthUnits,
                length: objData.lengthUnits,
                color: objData.color || CUSTOM_OBJECT_DEFAULTS.color,
            };
            // Create the object instance using saved coordinates and CURRENT scale
            const loadedObj = new PlacedObject(definitionPart, objData.x, objData.y, currentRoom.scale);

            // Set the saved rotation (default to 0 if missing/invalid)
            loadedObj.rotation = Number(objData.rotation) || 0;

            // Manually add to the manager's array (avoids selection logic in addObject)
            objectManager.placedObjects.push(loadedObj);
             // Ensure counter is high enough to avoid ID collision if user adds more items
            customObjectCounter = Math.max(customObjectCounter, index + 1);
        });
        console.log("Finished loading objects into manager.");
        // Note: No _notifyChange here, as it will be called after handleSetRoomSize finishes
    } catch (error) {
        console.error("Error loading objects into manager:", error);
        // Consider clearing corrupted save data here
        // clearSavedLayout();
        // alert("Error loading saved objects. Saved layout might be corrupted and has been cleared.");
        // window.location.reload(); // Force reload after clearing
    }
}


/**
 * Handles the request to add a new custom object to the center of the room.
 * @param {{width: number, length: number, label: string}} details - The details for the custom object.
 */
function handleAddObject(details) {
    if (!objectManager || !currentRoom) {
        alert("Please set the room size before adding objects.");
        return;
    }
     // Validate details
    if (isNaN(details.width) || isNaN(details.length) || details.width <= 0 || details.length <= 0) {
        alert("Invalid object dimensions provided. Please enter positive numbers.");
        return;
    }

    // Construct the object definition using defaults and provided details.
    // Use the label as the primary name if provided, otherwise use an internal name.
    const internalName = `Custom-${customObjectCounter++}`; // Increment counter
    const displayName = details.label?.trim() ? details.label.trim() : internalName;

    const customObjectDefinition = {
        id: internalName, // Use internal name as ID
        name: displayName, // Use user label if available, else internal name
        label: details.label, // User-provided display label
        width: details.width, // Already validated by UIController/above
        length: details.length,
        color: CUSTOM_OBJECT_DEFAULTS.color
    };

    // Add object to the center of the canvas/room view
    const { width: canvasWidth, height: canvasHeight } = currentRoom.getPixelDimensions();
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    objectManager.addObject(customObjectDefinition, centerX, centerY); // Will trigger _notifyChange -> saveLayout
}

/**
 * Handles the request to rotate the selected object.
 */
function handleRotateObject() {
    if (!objectManager) return;
    objectManager.rotateSelectedObject(); // Will trigger _notifyChange -> saveLayout
}


/**
 * Callback function triggered by ObjectManager when its state changes.
 * Handles redrawing, UI updates, and auto-saving.
 */
function handleObjectChange() {
    // Ensure all necessary components are available
    if (!renderer || !uiController || !objectManager || !currentRoom) {
         console.warn("handleObjectChange called but components are not ready.");
         return;
    }
    // Redraw the canvas
    renderer.redraw();
    // Update the UI controls panel (e.g., show/hide, update selected object name)
    uiController.updateObjectControls(objectManager.getSelectedObject());

    // --- Auto-save the layout ---
    try {
        // Pass the current state of room and objects to the save function
        saveLayout(currentRoom, objectManager);
    } catch (e) {
        console.error("Auto-save failed during object change:", e);
        // Optional: Notify user? Disable auto-save? Add a manual save button?
        // alert("Warning: Could not automatically save the latest changes.");
    }
}


/**
 * Handles the request to delete the selected object.
 */
function handleDeleteObject() {
    if (!objectManager) return;

    const selected = objectManager.getSelectedObject();
    if (selected) {
        // Use label in confirmation message if available
        const objectLabel = selected.label || selected.name || 'the object';
        if (confirm(`Are you sure you want to delete "${objectLabel}"?`)) {
            objectManager.deleteSelectedObject(); // Will trigger _notifyChange -> saveLayout
        }
    } else {
        console.warn("Delete requested but no object selected.");
        // Optionally provide user feedback e.g., brief message or disable button
    }
}

/**
 * Handles clearing the saved layout and reloading the page.
 */
function handleClearLayout() {
    if (confirm("Are you sure you want to clear the saved layout and reset the planner? This cannot be undone.")) {
        if (clearSavedLayout()) {
             window.location.reload(); // Reload to apply the default state
        } else {
            alert("Failed to clear saved layout. Please check browser permissions for localStorage.");
        }
    }
}

// --- Canvas Event Listeners Setup ---
function setupCanvasEventListeners() {
    if (!canvasElement) return;

    canvasElement.addEventListener('mousedown', handleMouseDown);
    // Add mousemove and mouseup listeners to the window to capture drags
    // that might leave the canvas temporarily.
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    // Prevent context menu on right-click over canvas (optional)
    canvasElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

// --- General Event Listeners ---
function setupGeneralEventListeners() {
    if (clearLayoutButton) {
        clearLayoutButton.addEventListener('click', handleClearLayout);
    }
    // Add other general listeners if needed (e.g., window resize)
}


// --- Canvas Interaction Handlers ---

/**
 * Handles the mouse down event on the canvas.
 * Selects an object or prepares for panning (if implemented).
 * @param {MouseEvent} event - The mouse event object.
 */
function handleMouseDown(event) {
    if (!objectManager || !canvasElement) return;

    const rect = canvasElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const selected = objectManager.selectObjectAt(mouseX, mouseY); // Selects object and triggers notifyChange

    if (selected) {
        isDragging = true;
        // Calculate offset from object's center to the mouse click point
        // This ensures the object doesn't "jump" to the mouse cursor center on drag start.
        selectedObjectOffsetX = mouseX - selected.x;
        selectedObjectOffsetY = mouseY - selected.y;

        dragStartX = mouseX; // Store initial mouse position for potential future use
        dragStartY = mouseY;
        canvasElement.style.cursor = 'grabbing'; // Change cursor
    } else {
        isDragging = false; // Ensure dragging stops if nothing is selected
        canvasElement.style.cursor = 'grab'; // Reset cursor
    }
}

/**
 * Handles the mouse move event on the window.
 * Moves the selected object if dragging is active.
 * @param {MouseEvent} event - The mouse event object.
 */
function handleMouseMove(event) {
    if (!isDragging || !objectManager || !canvasElement) return;

    const selected = objectManager.getSelectedObject();
    if (!selected) {
        isDragging = false; // Should not happen if isDragging is true, but safety check
        return;
    }

    const rect = canvasElement.getBoundingClientRect();
    // Calculate current mouse position relative to the canvas
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate the desired new center position of the object
    // by applying the initial offset to the current mouse position.
    const newCenterX = mouseX - selectedObjectOffsetX;
    const newCenterY = mouseY - selectedObjectOffsetY;

    // Move the object using the calculated center position
    // The moveSelectedObject function handles boundary checks.
    objectManager.moveSelectedObject(newCenterX, newCenterY); // Triggers notifyChange -> saveLayout
}

/**
 * Handles the mouse up event on the window.
 * Stops the dragging operation.
 * @param {MouseEvent} event - The mouse event object.
 */
function handleMouseUp(event) {
    if (isDragging) {
        isDragging = false;
        canvasElement.style.cursor = 'grab'; // Reset cursor
        // Optional: Final save call here if saving on every move is too much,
        // but the current setup saves via _notifyChange triggered by moveSelectedObject.
        // if (currentRoom && objectManager) { saveLayout(currentRoom, objectManager); }
    }
}