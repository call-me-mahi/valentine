const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Sanitize text input to prevent script injection
 * @param {string} text - The text to sanitize
 * @returns {string} Sanitized text
 */
export const sanitizeInput = (text) => {
    if (typeof text !== 'string') return '';
    return text
        .trim()
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
};

/**
 * Validates file uploads
 * @param {File[]} files - Array of files to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateFiles = (files) => {
    if (!Array.isArray(files) || files.length === 0) {
        return 'At least 1 photo is required';
    }

    if (files.length > MAX_PHOTOS) {
        return `Maximum ${MAX_PHOTOS} photos allowed`;
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return `${file.name} is not a valid image type. Only JPEG, PNG, GIF, and WebP are allowed`;
        }

        if (file.size > MAX_FILE_SIZE) {
            return `${file.name} is too large. Maximum file size is 5MB`;
        }
    }

    return '';
};

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
            if (value.length > MAX_NAME_LENGTH) {
                return `Name must not exceed ${MAX_NAME_LENGTH} characters`;
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
            if (value.length > MAX_NAME_LENGTH) {
                return `Name must not exceed ${MAX_NAME_LENGTH} characters`;
            }
            return '';

        case 'firstMeeting':
            if (!value || value.trim() === '') {
                return 'First meeting story is required';
            }
            if (value.trim().length < 10) {
                return 'Please provide at least 10 characters';
            }
            if (value.length > MAX_MESSAGE_LENGTH) {
                return `Story must not exceed ${MAX_MESSAGE_LENGTH} characters`;
            }
            return '';

        case 'favoriteMemory':
            if (!value || value.trim() === '') {
                return 'Favorite memory is required';
            }
            if (value.trim().length < 10) {
                return 'Please provide at least 10 characters';
            }
            if (value.length > MAX_MESSAGE_LENGTH) {
                return `Memory must not exceed ${MAX_MESSAGE_LENGTH} characters`;
            }
            return '';

        case 'message':
            if (!value || value.trim() === '') {
                return 'Message is required';
            }
            if (value.trim().length < 10) {
                return 'Please provide at least 10 characters';
            }
            if (value.length > MAX_MESSAGE_LENGTH) {
                return `Message must not exceed ${MAX_MESSAGE_LENGTH} characters`;
            }
            return '';

        case 'photos':
            return validateFiles(value);

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
