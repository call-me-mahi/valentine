import React, { useState, useEffect, useRef } from 'react';
import './PreviewPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;

const PreviewPage = ({ formData, onEdit, onProceedToPayment }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showMessage, setShowMessage] = useState(false);
    const [lovePageId, setLovePageId] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    const copyTimeoutRef = useRef(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
        };
    }, []);

    const {
        yourName,
        partnerName,
        firstMeeting,
        favoriteMemory,
        message,
        photos = [],
        theme = 'romantic'
    } = formData || {};

    const handleNextPhoto = () => {
        if (photos.length > 0) {
            setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
        }
    };

    const handlePrevPhoto = () => {
        if (photos.length > 0) {
            setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
        }
    };

    const handleRevealMessage = () => {
        setShowMessage(true);
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit();
        } else {
            console.log('Edit clicked - navigate back to form');
        }
    };

    const handleCopyLink = async () => {
        if (!lovePageId) return;

        const lovePageLink = `${window.location.origin}/love/${lovePageId}`;

        try {
            await navigator.clipboard.writeText(lovePageLink);
            setCopySuccess(true);

            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }

            copyTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                    setCopySuccess(false);
                }
            }, 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
            alert('Failed to copy link. Please copy it manually.');
        }
    };

    const handleOpenLovePage = () => {
        if (!lovePageId) return;

        const lovePageLink = `${window.location.origin}/love/${lovePageId}`;
        window.location.href = lovePageLink;
    };

    const handleProceedToPayment = async () => {
        if (isCreatingOrder || isProcessingPayment) {
            console.log('Payment already in progress');
            return;
        }

        if (!window.Razorpay) {
            setPaymentError('Razorpay SDK not loaded. Please refresh the page and try again.');
            return;
        }

        if (!RAZORPAY_KEY) {
            setPaymentError('Payment gateway is not configured. Please contact support.');
            return;
        }

        setPaymentError(null);
        setIsCreatingOrder(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 199
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create order. Please try again.');
            }

            const orderData = await response.json();
            console.log('Order created:', orderData);

            setIsCreatingOrder(false);
            setIsProcessingPayment(true);

            const razorpayOptions = {
                key: RAZORPAY_KEY,
                amount: orderData.amount,
                currency: orderData.currency,
                order_id: orderData.orderId,
                name: "Love Journey 💖",
                description: "Unlock your love story",
                theme: {
                    color: "#FF1744"
                },
                handler: async function (response) {
                    console.log('Payment successful:', response);

                    try {
                        const verifyResponse = await fetch(`${API_BASE_URL}/api/payment/verify`, {
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

                        const formDataToSend = new FormData();
                        formDataToSend.append('yourGender', formData.yourGender);
                        formDataToSend.append('yourName', formData.yourName);
                        formDataToSend.append('partnerGender', formData.partnerGender);
                        formDataToSend.append('partnerName', formData.partnerName);
                        formDataToSend.append('firstMeeting', formData.firstMeeting);
                        formDataToSend.append('favoriteMemory', formData.favoriteMemory);
                        formDataToSend.append('message', formData.message);
                        formDataToSend.append('theme', formData.theme);

                        if (formData.photos && formData.photos.length > 0) {
                            formData.photos.forEach((photo) => {
                                formDataToSend.append('photos', photo);
                            });
                        }

                        const createLovePageResponse = await fetch(`${API_BASE_URL}/api/love/create`, {
                            method: 'POST',
                            body: formDataToSend
                        });

                        if (!createLovePageResponse.ok) {
                            throw new Error('Failed to create love page. Please contact support with payment ID: ' + response.razorpay_payment_id);
                        }

                        const lovePageData = await createLovePageResponse.json();
                        console.log('Love page created:', lovePageData);

                        if (isMountedRef.current) {
                            setLovePageId(lovePageData.id);
                            setIsProcessingPayment(false);
                        }
                        console.log('Love page link:', `${window.location.origin}/love/${lovePageData.id}`);

                    } catch (error) {
                        console.error('Error in payment verification or love page creation:', error);
                        if (isMountedRef.current) {
                            setIsProcessingPayment(false);
                            setPaymentError(error.message || 'Payment was successful but we encountered an error. Please contact support.');
                        }
                    }
                },
                modal: {
                    ondismiss: function () {
                        console.log('Payment cancelled by user');
                        if (isMountedRef.current) {
                            setIsProcessingPayment(false);
                            setPaymentError('Payment was cancelled. Click "Proceed to Payment" to try again.');
                        }
                    }
                }
            };

            const razorpay = new window.Razorpay(razorpayOptions);

            razorpay.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                console.error('Error code:', response.error.code);
                console.error('Error description:', response.error.description);

                if (isMountedRef.current) {
                    setIsProcessingPayment(false);
                    setPaymentError(`Payment failed: ${response.error.description}. Please try again.`);
                }
            });

            razorpay.open();

        } catch (error) {
            console.error('Error during payment process:', error);
            if (isMountedRef.current) {
                setIsCreatingOrder(false);
                setIsProcessingPayment(false);
                setPaymentError(error.message || 'Failed to initiate payment. Please check your connection and try again.');
            }
        }
    };

    const getPhotoUrl = (photo) => {
        if (typeof photo === 'string') {
            return photo;
        }
        if (photo instanceof File) {
            return URL.createObjectURL(photo);
        }
        return null;
    };

    return (
        <div className={`preview-page theme-${theme}`}>
            <div className="payment-banner">
                🔒 This is only a preview. Complete payment to generate a shareable link.
            </div>

            <div className="preview-container">

                <div className="preview-header">
                    <h1 className="preview-title">Someone special created this for you…</h1>
                    <h2 className="partner-name">{partnerName}</h2>
                    <p className="from-text">From: {yourName}</p>
                </div>

                <section className="story-section first-meeting-section">
                    <div className="section-icon">💫</div>
                    <h3 className="section-title">How It All Began</h3>
                    <div className="section-content">
                        <p>{firstMeeting}</p>
                    </div>
                </section>

                <section className="story-section favorite-memory-section">
                    <div className="section-icon">💝</div>
                    <h3 className="section-title">Our Favorite Memory</h3>
                    <div className="section-content">
                        <p>{favoriteMemory}</p>
                    </div>
                </section>

                <section className="story-section message-section">
                    <div className="section-icon">💌</div>
                    <h3 className="section-title">A Special Message</h3>
                    <div className="section-content">
                        {!showMessage ? (
                            <button
                                className="reveal-button"
                                onClick={handleRevealMessage}
                                aria-label="Click to reveal special message"
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
                                    aria-label="Your love page link"
                                />
                            </div>

                            <div className="link-actions">
                                <button
                                    className="link-btn copy-btn"
                                    onClick={handleCopyLink}
                                    aria-label={copySuccess ? 'Link copied to clipboard' : 'Copy link to clipboard'}
                                >
                                    {copySuccess ? '✓ Link Copied!' : '📋 Copy Link'}
                                </button>
                                <button
                                    className="link-btn open-btn"
                                    onClick={handleOpenLovePage}
                                    aria-label="Open your love page in a new window"
                                >
                                    💖 Open Love Page
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {paymentError && !lovePageId && (
                    <div className="error-message-container" role="alert" aria-live="assertive">
                        <div className="error-icon">⚠️</div>
                        <p className="error-message">{paymentError}</p>
                        <button
                            className="retry-btn"
                            onClick={() => setPaymentError(null)}
                            aria-label="Dismiss error message"
                        >
                            ✕ Dismiss
                        </button>
                    </div>
                )}

                {(isCreatingOrder || isProcessingPayment) && !lovePageId && (
                    <div className="loading-container" role="status" aria-live="polite">
                        <div className="loading-spinner"></div>
                        <p className="loading-message">
                            {isCreatingOrder && 'Creating order...'}
                            {isProcessingPayment && 'Processing payment... Please wait'}
                        </p>
                    </div>
                )}

                {!lovePageId && (
                    <div className="preview-actions">
                        <button
                            className="action-btn edit-btn"
                            onClick={handleEdit}
                            disabled={isCreatingOrder || isProcessingPayment}
                            aria-label="Edit your love journey details"
                        >
                            ← Edit
                        </button>
                        <button
                            className="action-btn payment-btn"
                            onClick={handleProceedToPayment}
                            disabled={isCreatingOrder || isProcessingPayment}
                            aria-label={isCreatingOrder || isProcessingPayment ? 'Payment in progress' : 'Proceed to payment'}
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
