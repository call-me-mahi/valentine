/**
 * Validation helper functions for Love Journey Creator form
 */

/**
 * Validates a single form field based on its name and value
 * @param {string} fieldName - The name of the field to validate
 * @param {any} value - The value to validate
 * @param {object} allValues - All form values (for cross-field validation if needed)
 * @returns {string} Error message or empty string if valid
 */
export const validateField = (fieldName, value, allValues = {}) => {
    switch (fieldName) {
        case 'yourGender':
            if (!value || value.trim() === '') {
                return 'Please select your gender';
            }
            return '';

        case 'yourName':
            if (!value || value.trim() === '') {
                return 'Your name is required';
            }
            if (value.trim().length < 2) {
                return 'Your name must be at least 2 characters';
            }
            return '';

        case 'partnerGender':
            if (!value || value.trim() === '') {
                return 'Please select partner\'s gender';
            }
            return '';

        case 'partnerName':
            if (!value || value.trim() === '') {
                return 'Partner\'s name is required';
            }
            if (value.trim().length < 2) {
                return 'Partner\'s name must be at least 2 characters';
            }
            return '';

        case 'firstMeeting':
            if (!value || value.trim() === '') {
                return 'First meeting story is required';
            }
            if (value.trim().length < 10) {
                return 'Please provide at least 10 characters';
            }
            return '';

        case 'favoriteMemory':
            if (!value || value.trim() === '') {
                return 'Favorite memory is required';
            }
            if (value.trim().length < 10) {
                return 'Please provide at least 10 characters';
            }
            return '';

        case 'message':
            if (!value || value.trim() === '') {
                return 'Message is required';
            }
            if (value.trim().length < 10) {
                return 'Please provide at least 10 characters';
            }
            return '';

        case 'photos':
            if (!Array.isArray(value) || value.length === 0) {
                return 'At least 1 photo is required';
            }
            return '';

        case 'theme':
            if (!value || value.trim() === '') {
                return 'Please select a theme';
            }
            return '';

        default:
            return '';
    }
};

/**
 * Validates all form fields
 * @param {object} formValues - Object containing all form values
 * @returns {object} Object containing error messages for each field
 */
export const validateForm = (formValues) => {
    const errors = {};
    const fields = [
        'yourGender',
        'yourName',
        'partnerGender',
        'partnerName',
        'firstMeeting',
        'favoriteMemory',
        'message',
        'photos',
        'theme'
    ];

    fields.forEach((field) => {
        const error = validateField(field, formValues[field], formValues);
        if (error) {
            errors[field] = error;
        }
    });

    return errors;
};

/**
 * Checks if the form is valid (has no errors)
 * @param {object} errors - Object containing error messages
 * @returns {boolean} True if form is valid, false otherwise
 */
export const isFormValid = (errors) => {
    return Object.keys(errors).length === 0;
};

/**
 * Checks if all required fields have values
 * @param {object} formValues - Object containing all form values
 * @returns {boolean} True if all fields are filled, false otherwise
 */
export const areAllFieldsFilled = (formValues) => {
    return (
        formValues.yourGender &&
        formValues.yourName &&
        formValues.partnerGender &&
        formValues.partnerName &&
        formValues.firstMeeting &&
        formValues.favoriteMemory &&
        formValues.message &&
        Array.isArray(formValues.photos) &&
        formValues.photos.length > 0 &&
        formValues.theme
    );
};
