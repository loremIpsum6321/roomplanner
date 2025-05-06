/**
 * File: js/controllers/UIController.js
 * ------------------------------------
 * Defines the UIController class, responsible for handling interactions
 * with the HTML user interface elements (inputs, buttons).
 * Connects UI events to application logic (e.g., in ObjectManager or main.js).
 *
 * Version History:
 * - v1.0 - Initial creation. Handles room size inputs, object addition buttons. Basic object controls.
 * - v1.1 - Reworked object addition for single custom object with dimensions.
 * - v1.2 - Added label input handling. Updated selected object display.
 */

export class UIController {
    /**
     * Creates a UIController instance.
     * @param {Function} setRoomCallback - Function to call when 'Set Room Size' is clicked. Expects (width, length).
     * @param {Function} addObjectCallback - Function to call when 'Add Custom Object' is clicked. Expects ({ width, length, label }).
     * @param {Function} rotateCallback - Function to call when 'Rotate Object' is clicked.
     * @param {Function} deleteCallback - Function to call when 'Delete Object' is clicked.
     */
    constructor(setRoomCallback, addObjectCallback, rotateCallback, deleteCallback) {
        this.setRoomCallback = setRoomCallback;
        this.addObjectCallback = addObjectCallback;
        this.rotateCallback = rotateCallback;
        this.deleteCallback = deleteCallback;

        // Cache DOM elements
        this.roomWidthInput = document.getElementById('room-width');
        this.roomLengthInput = document.getElementById('room-length');
        this.setRoomButton = document.getElementById('set-room-button');

        // Cache custom object elements
        this.customObjectLabelInput = document.getElementById('custom-object-label'); // Cache label input
        this.customWidthInput = document.getElementById('custom-object-width');
        this.customLengthInput = document.getElementById('custom-object-length');
        this.addCustomObjectButton = document.getElementById('add-custom-object-button');

        this.objectControlsContainer = document.getElementById('object-controls');
        this.selectedObjectLabelSpan = document.getElementById('selected-object-label'); // Changed from selected-object-name
        this.rotateObjectButton = document.getElementById('rotate-object-button');
        this.deleteObjectButton = document.getElementById('delete-object-button');

        // Basic check for essential elements
        if (!this.roomWidthInput || !this.roomLengthInput || !this.setRoomButton || !this.objectControlsContainer || !this.selectedObjectLabelSpan || !this.rotateObjectButton || !this.deleteObjectButton || !this.customWidthInput || !this.customLengthInput || !this.addCustomObjectButton || !this.customObjectLabelInput) {
            console.error("One or more required UI elements not found in the DOM.");
        }

        this._setupEventListeners();
    }

    /**
     * Sets up event listeners for UI elements.
     * @private
     */
    _setupEventListeners() {
        // Set Room Size
        this.setRoomButton?.addEventListener('click', () => {
            const width = parseFloat(this.roomWidthInput?.value);
            const length = parseFloat(this.roomLengthInput?.value);

            if (!isNaN(width) && !isNaN(length) && width > 0 && length > 0) {
                this.setRoomCallback(width, length);
            } else {
                alert("Please enter valid positive numbers for room width and length.");
            }
        });

        // Add Custom Object Button
        this.addCustomObjectButton?.addEventListener('click', () => {
            const customWidth = parseFloat(this.customWidthInput?.value);
            const customLength = parseFloat(this.customLengthInput?.value);
            const customLabel = this.customObjectLabelInput?.value.trim() || 'Item'; // Get label, provide default

            if (!isNaN(customWidth) && !isNaN(customLength) && customWidth > 0 && customLength > 0) {
                // Pass dimensions and label object to the callback
                this.addObjectCallback({
                    width: customWidth,
                    length: customLength,
                    label: customLabel // Include label
                });
            } else {
                alert("Please enter valid positive numbers for custom object width and length.");
            }
        });

        // Rotate Selected Object
        this.rotateObjectButton?.addEventListener('click', () => {
            this.rotateCallback();
        });

        // Delete Selected Object
        this.deleteObjectButton?.addEventListener('click', () => {
            this.deleteCallback();
        });
    }

    /**
     * Updates the visibility and content of the object controls panel.
     * @param {PlacedObject | null} selectedObject - The currently selected object, or null.
     */
    updateObjectControls(selectedObject) {
        if (!this.objectControlsContainer || !this.selectedObjectLabelSpan) return;

        if (selectedObject) {
            // Display the label, fallback to name if label is empty
            this.selectedObjectLabelSpan.textContent = selectedObject.label || selectedObject.name || 'Unnamed Object';
            this.objectControlsContainer.style.display = 'block'; // Show the controls
        } else {
            this.selectedObjectLabelSpan.textContent = 'None';
            this.objectControlsContainer.style.display = 'none'; // Hide the controls
        }
    }

    /**
     * Gets the current room dimensions from the input fields.
     * @returns {{width: number, length: number} | null} Dimensions or null if invalid.
     */
    getInitialRoomDimensions() {
        const width = parseFloat(this.roomWidthInput?.value);
        const length = parseFloat(this.roomLengthInput?.value);

        if (!isNaN(width) && !isNaN(length) && width > 0 && length > 0) {
            return { width, length };
        }
        return null;
    }
}
