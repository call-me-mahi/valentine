import React, { useState, useEffect } from 'react';
import { validateField, validateForm, isFormValid, areAllFieldsFilled } from '../utils/formValidation';
import './LoveJourneyForm.css';

const LoveJourneyForm = () => {
    // Form state
    const [formValues, setFormValues] = useState({
        yourGender: '',
        yourName: '',
        partnerGender: '',
        partnerName: '',
        firstMeeting: '',
        favoriteMemory: '',
        message: '',
        photos: [],
        theme: ''
    });

    // Error state
    const [errors, setErrors] = useState({});

    // Touched fields (to show errors only after user interaction)
    const [touched, setTouched] = useState({});

    // Form validity state
    const [isValid, setIsValid] = useState(false);

    // Update form validity whenever form values or errors change
    useEffect(() => {
        const formErrors = validateForm(formValues);
        const allFieldsFilled = areAllFieldsFilled(formValues);
        const noErrors = isFormValid(formErrors);
        setIsValid(allFieldsFilled && noErrors);
    }, [formValues]);

    /**
     * Handles input change for text fields
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Update form values
        setFormValues(prev => ({
            ...prev,
            [name]: value
        }));

        // Validate field on change (only if already touched)
        if (touched[name]) {
            const error = validateField(name, value, formValues);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

    /**
     * Handles select/dropdown change
     */
    const handleSelectChange = (e) => {
        const { name, value } = e.target;

        setFormValues(prev => ({
            ...prev,
            [name]: value
        }));

        if (touched[name]) {
            const error = validateField(name, value, formValues);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

    /**
     * Handles file input for photos
     */
    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);

        setFormValues(prev => ({
            ...prev,
            photos: [...prev.photos, ...files]
        }));

        if (touched.photos) {
            const error = validateField('photos', [...formValues.photos, ...files], formValues);
            setErrors(prev => ({
                ...prev,
                photos: error
            }));
        }
    };

    /**
     * Removes a photo from the list
     */
    const handleRemovePhoto = (index) => {
        const updatedPhotos = formValues.photos.filter((_, i) => i !== index);

        setFormValues(prev => ({
            ...prev,
            photos: updatedPhotos
        }));

        if (touched.photos) {
            const error = validateField('photos', updatedPhotos, formValues);
            setErrors(prev => ({
                ...prev,
                photos: error
            }));
        }
    };

    /**
     * Handles field blur (marks field as touched and validates)
     */
    const handleBlur = (e) => {
        const { name } = e.target;

        // Mark field as touched
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate field
        const error = validateField(name, formValues[name], formValues);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    /**
     * Handles form submission
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(formValues).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        // Validate all fields
        const formErrors = validateForm(formValues);
        setErrors(formErrors);

        // If form is valid, proceed
        if (isFormValid(formErrors)) {
            console.log('Form is valid! Proceeding to preview...', formValues);
            // TODO: Navigate to preview page or next step
        } else {
            console.log('Form has errors:', formErrors);
        }
    };

    return (
        <div className="love-journey-form-container">
            <div className="form-header">
                <h1>Create Your Love Journey</h1>
                <p>Share your beautiful story with the world</p>
            </div>

            <form onSubmit={handleSubmit} className="love-journey-form" noValidate>

                {/* Your Gender */}
                <div className="form-group">
                    <label htmlFor="yourGender">
                        Your Gender <span className="required">*</span>
                    </label>
                    <select
                        id="yourGender"
                        name="yourGender"
                        value={formValues.yourGender}
                        onChange={handleSelectChange}
                        onBlur={handleBlur}
                        className={touched.yourGender && errors.yourGender ? 'error-field' : ''}
                    >
                        <option value="">Select your gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    {touched.yourGender && errors.yourGender && (
                        <span className="error-message">{errors.yourGender}</span>
                    )}
                </div>

                {/* Your Name */}
                <div className="form-group">
                    <label htmlFor="yourName">
                        Your Name <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="yourName"
                        name="yourName"
                        value={formValues.yourName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Enter your name"
                        className={touched.yourName && errors.yourName ? 'error-field' : ''}
                    />
                    {touched.yourName && errors.yourName && (
                        <span className="error-message">{errors.yourName}</span>
                    )}
                </div>

                {/* Partner's Gender */}
                <div className="form-group">
                    <label htmlFor="partnerGender">
                        Partner's Gender <span className="required">*</span>
                    </label>
                    <select
                        id="partnerGender"
                        name="partnerGender"
                        value={formValues.partnerGender}
                        onChange={handleSelectChange}
                        onBlur={handleBlur}
                        className={touched.partnerGender && errors.partnerGender ? 'error-field' : ''}
                    >
                        <option value="">Select partner's gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    {touched.partnerGender && errors.partnerGender && (
                        <span className="error-message">{errors.partnerGender}</span>
                    )}
                </div>

                {/* Partner's Name */}
                <div className="form-group">
                    <label htmlFor="partnerName">
                        Partner's Name <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="partnerName"
                        name="partnerName"
                        value={formValues.partnerName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Enter partner's name"
                        className={touched.partnerName && errors.partnerName ? 'error-field' : ''}
                    />
                    {touched.partnerName && errors.partnerName && (
                        <span className="error-message">{errors.partnerName}</span>
                    )}
                </div>

                {/* First Meeting */}
                <div className="form-group">
                    <label htmlFor="firstMeeting">
                        How Did You First Meet? <span className="required">*</span>
                    </label>
                    <textarea
                        id="firstMeeting"
                        name="firstMeeting"
                        value={formValues.firstMeeting}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Tell us about your first meeting..."
                        rows="4"
                        className={touched.firstMeeting && errors.firstMeeting ? 'error-field' : ''}
                    />
                    <div className="char-count">
                        {formValues.firstMeeting.length} characters
                    </div>
                    {touched.firstMeeting && errors.firstMeeting && (
                        <span className="error-message">{errors.firstMeeting}</span>
                    )}
                </div>

                {/* Favorite Memory */}
                <div className="form-group">
                    <label htmlFor="favoriteMemory">
                        Your Favorite Memory Together <span className="required">*</span>
                    </label>
                    <textarea
                        id="favoriteMemory"
                        name="favoriteMemory"
                        value={formValues.favoriteMemory}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Share your favorite memory..."
                        rows="4"
                        className={touched.favoriteMemory && errors.favoriteMemory ? 'error-field' : ''}
                    />
                    <div className="char-count">
                        {formValues.favoriteMemory.length} characters
                    </div>
                    {touched.favoriteMemory && errors.favoriteMemory && (
                        <span className="error-message">{errors.favoriteMemory}</span>
                    )}
                </div>

                {/* Message */}
                <div className="form-group">
                    <label htmlFor="message">
                        Special Message <span className="required">*</span>
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formValues.message}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Write a special message..."
                        rows="4"
                        className={touched.message && errors.message ? 'error-field' : ''}
                    />
                    <div className="char-count">
                        {formValues.message.length} characters
                    </div>
                    {touched.message && errors.message && (
                        <span className="error-message">{errors.message}</span>
                    )}
                </div>

                {/* Photos */}
                <div className="form-group">
                    <label htmlFor="photos">
                        Upload Photos <span className="required">*</span>
                    </label>
                    <div className="photo-upload-container">
                        <input
                            type="file"
                            id="photos"
                            name="photos"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            onBlur={handleBlur}
                            className="file-input"
                        />
                        <label htmlFor="photos" className="file-input-label">
                            Choose Photos
                        </label>
                        <span className="file-count">
                            {formValues.photos.length} photo(s) selected
                        </span>
                    </div>

                    {formValues.photos.length > 0 && (
                        <div className="photo-preview-list">
                            {formValues.photos.map((photo, index) => (
                                <div key={index} className="photo-preview-item">
                                    <span className="photo-name">{photo.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePhoto(index)}
                                        className="remove-photo-btn"
                                        aria-label="Remove photo"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {touched.photos && errors.photos && (
                        <span className="error-message">{errors.photos}</span>
                    )}
                </div>

                {/* Theme */}
                <div className="form-group">
                    <label htmlFor="theme">
                        Choose a Theme <span className="required">*</span>
                    </label>
                    <select
                        id="theme"
                        name="theme"
                        value={formValues.theme}
                        onChange={handleSelectChange}
                        onBlur={handleBlur}
                        className={touched.theme && errors.theme ? 'error-field' : ''}
                    >
                        <option value="">Select a theme</option>
                        <option value="romantic">Romantic</option>
                        <option value="playful">Playful</option>
                        <option value="elegant">Elegant</option>
                        <option value="vintage">Vintage</option>
                        <option value="modern">Modern</option>
                    </select>
                    {touched.theme && errors.theme && (
                        <span className="error-message">{errors.theme}</span>
                    )}
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={!isValid}
                    >
                        Continue / Preview
                    </button>
                    {!isValid && (
                        <p className="form-hint">
                            Please fill in all required fields correctly to continue
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default LoveJourneyForm;
