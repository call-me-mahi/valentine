import React, { useState } from 'react';
import './PreviewPage.css';

const PreviewPage = ({ formData, onEdit, onProceedToPayment }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showMessage, setShowMessage] = useState(false);
    const [lovePageId, setLovePageId] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Loading and error states
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

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
     * Copy love page link to clipboard
     */
    const handleCopyLink = async () => {
        if (!lovePageId) return;

        const lovePageLink = `${window.location.origin}/love/${lovePageId}`;

        try {
            await navigator.clipboard.writeText(lovePageLink);
            setCopySuccess(true);

            // Reset copy feedback after 2 seconds
            setTimeout(() => {
                setCopySuccess(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
            alert('Failed to copy link. Please copy it manually.');
        }
    };

    /**
     * Redirect to love page
     */
    const handleOpenLovePage = () => {
        if (!lovePageId) return;

        const lovePageLink = `${window.location.origin}/love/${lovePageId}`;
        window.location.href = lovePageLink;
    };

    /**
     * Handle payment action - Create Razorpay order and open checkout
     */
    const handleProceedToPayment = async () => {
        // Prevent duplicate calls
        if (isCreatingOrder || isProcessingPayment) {
            console.log('Payment already in progress');
            return;
        }

        // Clear any previous errors
        setPaymentError(null);
        setIsCreatingOrder(true);

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
                throw new Error('Failed to create order. Please try again.');
            }

            const orderData = await response.json();
            console.log('Order created:', orderData);

            setIsCreatingOrder(false);
            setIsProcessingPayment(true);

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
                            throw new Error('Payment verification failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
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
                            throw new Error('Failed to create love page. Please contact support with payment ID: ' + response.razorpay_payment_id);
                        }

                        const lovePageData = await createLovePageResponse.json();
                        console.log('Love page created:', lovePageData);

                        // Step 3: Store love page ID and show link UI
                        setLovePageId(lovePageData.id);
                        setIsProcessingPayment(false);
                        console.log('Love page link:', `${window.location.origin}/love/${lovePageData.id}`);

                    } catch (error) {
                        console.error('Error in payment verification or love page creation:', error);
                        setIsProcessingPayment(false);
                        setPaymentError(error.message || 'Payment was successful but we encountered an error. Please contact support.');
                    }
                },
                modal: {
                    ondismiss: function () {
                        console.log('Payment cancelled by user');
                        setIsProcessingPayment(false);
                        setPaymentError('Payment was cancelled. Click "Proceed to Payment" to try again.');
                    }
                }
            };

            // Step 3: Open Razorpay Checkout
            const razorpay = new window.Razorpay(razorpayOptions);

            razorpay.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                console.error('Error code:', response.error.code);
                console.error('Error description:', response.error.description);

                setIsProcessingPayment(false);
                setPaymentError(`Payment failed: ${response.error.description}. Please try again.`);
            });

            razorpay.open();

        } catch (error) {
            console.error('Error during payment process:', error);
            setIsCreatingOrder(false);
            setIsProcessingPayment(false);
            setPaymentError(error.message || 'Failed to initiate payment. Please check your connection and try again.');
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

                {/* Link Generation Section - Shows after successful payment */}
                {lovePageId && (
                    <section className="story-section link-section">
                        <div className="section-icon">🔗</div>
                        <h3 className="section-title">Your Love Journey is Ready!</h3>
                        <div className="section-content">
                            <p className="success-message">
                                🎉 Payment successful! Share this link with your loved one:
                            </p>

                            <div className="link-container">
                                <input
                                    type="text"
                                    className="link-input"
                                    value={`${window.location.origin}/love/${lovePageId}`}
                                    readOnly
                                />
                            </div>

                            <div className="link-actions">
                                <button
                                    className="link-btn copy-btn"
                                    onClick={handleCopyLink}
                                >
                                    {copySuccess ? '✓ Link Copied!' : '📋 Copy Link'}
                                </button>
                                <button
                                    className="link-btn open-btn"
                                    onClick={handleOpenLovePage}
                                >
                                    💖 Open Love Page
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Error Message Display */}
                {paymentError && !lovePageId && (
                    <div className="error-message-container">
                        <div className="error-icon">⚠️</div>
                        <p className="error-message">{paymentError}</p>
                        <button
                            className="retry-btn"
                            onClick={() => setPaymentError(null)}
                        >
                            ✕ Dismiss
                        </button>
                    </div>
                )}

                {/* Loading State Display */}
                {(isCreatingOrder || isProcessingPayment) && !lovePageId && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-message">
                            {isCreatingOrder && 'Creating order...'}
                            {isProcessingPayment && 'Processing payment... Please wait'}
                        </p>
                    </div>
                )}

                {/* Action Buttons - Hide after payment successful */}
                {!lovePageId && (
                    <div className="preview-actions">
                        <button
                            className="action-btn edit-btn"
                            onClick={handleEdit}
                            disabled={isCreatingOrder || isProcessingPayment}
                        >
                            ← Edit
                        </button>
                        <button
                            className="action-btn payment-btn"
                            onClick={handleProceedToPayment}
                            disabled={isCreatingOrder || isProcessingPayment}
                        >
                            {isCreatingOrder && '⏳ Creating Order...'}
                            {isProcessingPayment && '⏳ Processing Payment...'}
                            {!isCreatingOrder && !isProcessingPayment && 'Proceed to Payment →'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviewPage;
