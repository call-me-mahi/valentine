import React, { useState, useEffect, useRef, useCallback } from 'react';
import { validateField, validateForm, isFormValid, areAllFieldsFilled, sanitizeInput } from '../utils/formValidation';
import './LoveJourneyForm.css';

const LoveJourneyForm = ({ onComplete }) => {
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

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isValid, setIsValid] = useState(false);

    const validationTimeoutRef = useRef(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (validationTimeoutRef.current) {
                clearTimeout(validationTimeoutRef.current);
            }
        };
    }, []);

    const debouncedValidation = useCallback((values) => {
        if (validationTimeoutRef.current) {
            clearTimeout(validationTimeoutRef.current);
        }

        validationTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
                const formErrors = validateForm(values);
                const allFieldsFilled = areAllFieldsFilled(values);
                const noErrors = isFormValid(formErrors);
                setIsValid(allFieldsFilled && noErrors);
            }
        }, 300);
    }, []);

    useEffect(() => {
        debouncedValidation(formValues);
    }, [formValues, debouncedValidation]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = sanitizeInput(value);

        setFormValues(prev => ({
            ...prev,
            [name]: sanitizedValue
        }));

        if (touched[name]) {
            const error = validateField(name, sanitizedValue, formValues);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

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

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        const updatedPhotos = [...formValues.photos, ...files];

        setFormValues(prev => ({
            ...prev,
            photos: updatedPhotos
        }));

        const error = validateField('photos', updatedPhotos, formValues);
        setErrors(prev => ({
            ...prev,
            photos: error
        }));

        if (!touched.photos) {
            setTouched(prev => ({
                ...prev,
                photos: true
            }));
        }
    };

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

    const handleBlur = (e) => {
        const { name } = e.target;

        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        const error = validateField(name, formValues[name], formValues);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const resetForm = () => {
        setFormValues({
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
        setErrors({});
        setTouched({});
        setIsValid(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const allTouched = Object.keys(formValues).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        const formErrors = validateForm(formValues);
        setErrors(formErrors);

        if (isFormValid(formErrors)) {
            if (onComplete) {
                onComplete(formValues);
            } else {
                console.log('Form is valid! Proceeding to preview...', formValues);
            }
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
                        aria-required="true"
                        aria-invalid={touched.yourGender && errors.yourGender ? 'true' : 'false'}
                        aria-describedby={touched.yourGender && errors.yourGender ? 'yourGender-error' : undefined}
                    >
                        <option value="">Select your gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    {touched.yourGender && errors.yourGender && (
                        <span className="error-message" id="yourGender-error" role="alert" aria-live="polite">{errors.yourGender}</span>
                    )}
                </div>

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
                        maxLength="100"
                        className={touched.yourName && errors.yourName ? 'error-field' : ''}
                        aria-required="true"
                        aria-invalid={touched.yourName && errors.yourName ? 'true' : 'false'}
                        aria-describedby={touched.yourName && errors.yourName ? 'yourName-error' : undefined}
                    />
                    {touched.yourName && errors.yourName && (
                        <span className="error-message" id="yourName-error" role="alert" aria-live="polite">{errors.yourName}</span>
                    )}
                </div>

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
                        aria-required="true"
                        aria-invalid={touched.partnerGender && errors.partnerGender ? 'true' : 'false'}
                        aria-describedby={touched.partnerGender && errors.partnerGender ? 'partnerGender-error' : undefined}
                    >
                        <option value="">Select partner's gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    {touched.partnerGender && errors.partnerGender && (
                        <span className="error-message" id="partnerGender-error" role="alert" aria-live="polite">{errors.partnerGender}</span>
                    )}
                </div>

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
                        maxLength="100"
                        className={touched.partnerName && errors.partnerName ? 'error-field' : ''}
                        aria-required="true"
                        aria-invalid={touched.partnerName && errors.partnerName ? 'true' : 'false'}
                        aria-describedby={touched.partnerName && errors.partnerName ? 'partnerName-error' : undefined}
                    />
                    {touched.partnerName && errors.partnerName && (
                        <span className="error-message" id="partnerName-error" role="alert" aria-live="polite">{errors.partnerName}</span>
                    )}
                </div>

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
                        maxLength="2000"
                        className={touched.firstMeeting && errors.firstMeeting ? 'error-field' : ''}
                        aria-required="true"
                        aria-invalid={touched.firstMeeting && errors.firstMeeting ? 'true' : 'false'}
                        aria-describedby={touched.firstMeeting && errors.firstMeeting ? 'firstMeeting-error' : undefined}
                    />
                    <div className="char-count">
                        {formValues.firstMeeting.length} / 2000 characters
                    </div>
                    {touched.firstMeeting && errors.firstMeeting && (
                        <span className="error-message" id="firstMeeting-error" role="alert" aria-live="polite">{errors.firstMeeting}</span>
                    )}
                </div>

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
                        maxLength="2000"
                        className={touched.favoriteMemory && errors.favoriteMemory ? 'error-field' : ''}
                        aria-required="true"
                        aria-invalid={touched.favoriteMemory && errors.favoriteMemory ? 'true' : 'false'}
                        aria-describedby={touched.favoriteMemory && errors.favoriteMemory ? 'favoriteMemory-error' : undefined}
                    />
                    <div className="char-count">
                        {formValues.favoriteMemory.length} / 2000 characters
                    </div>
                    {touched.favoriteMemory && errors.favoriteMemory && (
                        <span className="error-message" id="favoriteMemory-error" role="alert" aria-live="polite">{errors.favoriteMemory}</span>
                    )}
                </div>

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
                        maxLength="2000"
                        className={touched.message && errors.message ? 'error-field' : ''}
                        aria-required="true"
                        aria-invalid={touched.message && errors.message ? 'true' : 'false'}
                        aria-describedby={touched.message && errors.message ? 'message-error' : undefined}
                    />
                    <div className="char-count">
                        {formValues.message.length} / 2000 characters
                    </div>
                    {touched.message && errors.message && (
                        <span className="error-message" id="message-error" role="alert" aria-live="polite">{errors.message}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="photos">
                        Upload Photos <span className="required">*</span>
                        <span className="file-hint"> (Max 5 photos, 5MB each)</span>
                    </label>
                    <div className="photo-upload-container">
                        <input
                            type="file"
                            id="photos"
                            name="photos"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            multiple
                            onChange={handlePhotoUpload}
                            onBlur={handleBlur}
                            className="file-input"
                            aria-required="true"
                            aria-invalid={touched.photos && errors.photos ? 'true' : 'false'}
                            aria-describedby={touched.photos && errors.photos ? 'photos-error' : undefined}
                        />
                        <label htmlFor="photos" className="file-input-label">
                            Choose Photos
                        </label>
                        <span className="file-count">
                            {formValues.photos.length} / 5 photo(s) selected
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
                                        aria-label={`Remove ${photo.name}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {touched.photos && errors.photos && (
                        <span className="error-message" id="photos-error" role="alert" aria-live="polite">{errors.photos}</span>
                    )}
                </div>

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
                        aria-required="true"
                        aria-invalid={touched.theme && errors.theme ? 'true' : 'false'}
                        aria-describedby={touched.theme && errors.theme ? 'theme-error' : undefined}
                    >
                        <option value="">Select a theme</option>
                        <option value="romantic">Romantic</option>
                        <option value="playful">Playful</option>
                        <option value="elegant">Elegant</option>
                        <option value="vintage">Vintage</option>
                        <option value="modern">Modern</option>
                    </select>
                    {touched.theme && errors.theme && (
                        <span className="error-message" id="theme-error" role="alert" aria-live="polite">{errors.theme}</span>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={!isValid}
                        aria-label={isValid ? 'Continue to preview' : 'Fill in all required fields to continue'}
                    >
                        Continue / Preview
                    </button>
                    {!isValid && (
                        <p className="form-hint" role="status" aria-live="polite">
                            Please fill in all required fields correctly to continue
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default LoveJourneyForm;
