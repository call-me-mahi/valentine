import React, { useState } from 'react';
import './PreviewPage.css';

const PreviewPage = ({ formData, onEdit, onProceedToPayment }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showMessage, setShowMessage] = useState(false);
    const [lovePageId, setLovePageId] = useState(null);

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
     * Handle payment action - Create Razorpay order and open checkout
     */
    const handleProceedToPayment = async () => {
        try {
            // Step 1: Create order on backend
            const response = await fetch('http://localhost:5000/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 199 // ₹199
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const orderData = await response.json();
            console.log('Order created:', orderData);

            // Step 2: Configure Razorpay options
            const razorpayOptions = {
                key: import.meta.env.VITE_RAZORPAY_KEY,
                amount: orderData.amount, // Amount in paise
                currency: orderData.currency,
                order_id: orderData.id,
                name: "Love Journey 💖",
                description: "Unlock your love story",
                theme: {
                    color: "#FF1744" // Romantic pink-red
                },
                handler: async function (response) {
                    // Success callback - Payment captured by Razorpay
                    console.log('Payment successful:', response);

                    try {
                        // Step 1: Verify payment signature on backend
                        const verifyResponse = await fetch('http://localhost:5000/api/payment/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        if (!verifyResponse.ok) {
                            throw new Error('Payment verification failed');
                        }

                        const verifyData = await verifyResponse.json();
                        console.log('Payment verified:', verifyData);

                        // Step 2: Create love page after successful verification
                        const createLovePageResponse = await fetch('http://localhost:5000/api/love/create', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(formData)
                        });

                        if (!createLovePageResponse.ok) {
                            throw new Error('Failed to create love page');
                        }

                        const lovePageData = await createLovePageResponse.json();
                        console.log('Love page created:', lovePageData);

                        // Step 3: Store love page ID
                        setLovePageId(lovePageData.id);

                        alert(`Success! Your Love Journey has been created! ID: ${lovePageData.id}`);

                    } catch (error) {
                        console.error('Error in payment verification or love page creation:', error);
                        alert('Payment was successful but we encountered an error. Please contact support with your payment ID: ' + response.razorpay_payment_id);
                    }
                },
                modal: {
                    ondismiss: function () {
                        console.log('Payment cancelled by user');
                    }
                }
            };

            // Step 3: Open Razorpay Checkout
            const razorpay = new window.Razorpay(razorpayOptions);

            razorpay.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                console.error('Error code:', response.error.code);
                console.error('Error description:', response.error.description);
                alert('Payment failed. Please try again.');
            });

            razorpay.open();

        } catch (error) {
            console.error('Error during payment process:', error);
            alert('Failed to initiate payment. Please try again.');
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
                        onClick={handleProceedToPayment}
                    >
                        Proceed to Payment →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewPage;
