import React, { useState } from 'react';
import './PreviewPage.css';

const PreviewPage = ({ formData, onEdit, onProceedToPayment }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showMessage, setShowMessage] = useState(false);

    const {
        yourName,
        partnerName,
        firstMeeting,
        favoriteMemory,
        message,
        photos = [],
        theme = 'romantic'
    } = formData || {};

    /**
     * Navigate to next photo in carousel
     */
    const handleNextPhoto = () => {
        if (photos.length > 0) {
            setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
        }
    };

    /**
     * Navigate to previous photo in carousel
     */
    const handlePrevPhoto = () => {
        if (photos.length > 0) {
            setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
        }
    };

    /**
     * Reveal the love message
     */
    const handleRevealMessage = () => {
        setShowMessage(true);
    };

    /**
     * Handle edit action
     */
    const handleEdit = () => {
        if (onEdit) {
            onEdit();
        } else {
            console.log('Edit clicked - navigate back to form');
            // Default: window.history.back() or navigation logic
        }
    };

    /**
     * Handle payment action
     */
    const handleProceedToPaymentClick = () => {
        if (onProceedToPayment) {
            onProceedToPayment(formData);
        } else {
            console.log('Proceed to payment clicked with data:', formData);
        }
    };

    /**
     * Get photo URL for preview
     */
    const getPhotoUrl = (photo) => {
        if (typeof photo === 'string') {
            return photo; // Already a URL
        }
        if (photo instanceof File) {
            return URL.createObjectURL(photo); // Create preview URL
        }
        return null;
    };

    return (
        <div className={`preview-page theme-${theme}`}>
            {/* Payment Banner */}
            <div className="payment-banner">
                🔒 This is only a preview. Complete payment to generate a shareable link.
            </div>

            <div className="preview-container">

                {/* Header Section */}
                <div className="preview-header">
                    <h1 className="preview-title">Someone special created this for you…</h1>
                    <h2 className="partner-name">{partnerName}</h2>
                    <p className="from-text">From: {yourName}</p>
                </div>

                {/* First Meeting Section */}
                <section className="story-section first-meeting-section">
                    <div className="section-icon">💫</div>
                    <h3 className="section-title">How It All Began</h3>
                    <div className="section-content">
                        <p>{firstMeeting}</p>
                    </div>
                </section>

                {/* Favorite Memory Section */}
                <section className="story-section favorite-memory-section">
                    <div className="section-icon">💝</div>
                    <h3 className="section-title">Our Favorite Memory</h3>
                    <div className="section-content">
                        <p>{favoriteMemory}</p>
                    </div>
                </section>

                {/* Love Message Reveal Section */}
                <section className="story-section message-section">
                    <div className="section-icon">💌</div>
                    <h3 className="section-title">A Special Message</h3>
                    <div className="section-content">
                        {!showMessage ? (
                            <button
                                className="reveal-button"
                                onClick={handleRevealMessage}
                            >
                                Click to Reveal Message ❤️
                            </button>
                        ) : (
                            <div className="message-reveal">
                                <p className="love-message">{message}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Photo Slideshow Section */}
                {photos.length > 0 && (
                    <section className="story-section photo-section">
                        <div className="section-icon">📸</div>
                        <h3 className="section-title">Our Memories Together</h3>
                        <div className="photo-carousel">
                            <div className="carousel-container">
                                {photos.length > 1 && (
                                    <button
                                        className="carousel-btn prev-btn"
                                        onClick={handlePrevPhoto}
                                        aria-label="Previous photo"
                                    >
                                        ‹
                                    </button>
                                )}

                                <div className="photo-display">
                                    <img
                                        src={getPhotoUrl(photos[currentPhotoIndex])}
                                        alt={`Memory ${currentPhotoIndex + 1}`}
                                        className="carousel-image"
                                    />
                                </div>

                                {photos.length > 1 && (
                                    <button
                                        className="carousel-btn next-btn"
                                        onClick={handleNextPhoto}
                                        aria-label="Next photo"
                                    >
                                        ›
                                    </button>
                                )}
                            </div>

                            {photos.length > 1 && (
                                <div className="carousel-indicators">
                                    {photos.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentPhotoIndex(index)}
                                            aria-label={`Go to photo ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="photo-counter">
                                {currentPhotoIndex + 1} / {photos.length}
                            </div>
                        </div>
                    </section>
                )}

                {/* Action Buttons */}
                <div className="preview-actions">
                    <button className="action-btn edit-btn" onClick={handleEdit}>
                        ← Edit
                    </button>
                    <button
                        className="action-btn payment-btn"
                        onClick={handleProceedToPaymentClick}
                    >
                        Proceed to Payment →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewPage;
