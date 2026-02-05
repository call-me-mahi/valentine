import React, { useState } from 'react';
import LoveJourneyForm from './components/LoveJourneyForm';
import PreviewPage from './components/PreviewPage';

/**
 * Example App showing navigation between Form and Preview
 * This demonstrates how to integrate the form with the preview page
 */
function App() {
    const [currentView, setCurrentView] = useState('form'); // 'form' or 'preview'
    const [formData, setFormData] = useState(null);

    /**
     * Handle form completion - navigate to preview
     */
    const handleFormComplete = (data) => {
        console.log('Form completed with data:', data);
        setFormData(data);
        setCurrentView('preview');
    };

    /**
     * Handle edit - go back to form
     */
    const handleEdit = () => {
        setCurrentView('form');
    };

    /**
     * Handle payment - proceed to payment flow
     */
    const handleProceedToPayment = (data) => {
        console.log('Proceeding to payment with data:', data);
        // TODO: Integrate with payment gateway
        // Example: navigate to payment page or open payment modal
        // router.push('/payment');
    };

    return (
        <div className="App">
            {currentView === 'form' && (
                <LoveJourneyForm
                    onComplete={handleFormComplete}
                    initialData={formData} // Pass back data if editing
                />
            )}

            {currentView === 'preview' && formData && (
                <PreviewPage
                    formData={formData}
                    onEdit={handleEdit}
                    onProceedToPayment={handleProceedToPayment}
                />
            )}
        </div>
    );
}

export default App;
