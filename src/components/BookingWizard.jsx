import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';


const services = [
  { id: 1, name: 'Classic Fade', price: 35, duration: '45 min' },
  { id: 2, name: 'Beard Trim', price: 20, duration: '25 min' },
  { id: 3, name: 'Hot Towel Shave', price: 40, duration: '50 min' },
  { id: 4, name: 'The Full Works', price: 70, duration: '90 min' },
];

// --- Webhook URL ---
const WEBHOOK_URL = "https://hook.us2.make.com/yz3ayvd82t4n7ibgmlzqi52dv5a24vnc";

const generateTimeSlots = () => {
  const slots = [];
  // Morning slots (08:00 - 12:00)
  for (let i = 8; i < 12; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
    slots.push(`${i.toString().padStart(2, '0')}:30`);
  }
  // Lunch break is 12:00-13:00, so we skip it
  // Afternoon slots (13:00 - 17:00)
  for (let i = 13; i < 17; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
    slots.push(`${i.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

const BookingWizard = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState(''); // Added email state
  const [customerPhone, setCustomerPhone] = useState('');

  // 'idle', 'loading', 'success', 'error'
  const [submissionStatus, setSubmissionStatus] = useState('idle'); 

  const stripe = useStripe();
  const elements = useElements();

  const sendNotification = async (formData) => {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }
      
      console.log("Webhook sent successfully!");

    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmissionStatus('loading');

    if (!stripe || !elements) {
      setSubmissionStatus('error');
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.log('[error]', error);
      setSubmissionStatus('error');
    } else {
      console.log('[PaymentMethod]', paymentMethod);
      
      const formData = {
        type: "solicitud",
        service: selectedService?.name,
        price: selectedService?.price,
        barber: selectedBarber,
        barber_name: selectedBarber, // Ensure barber_name is included
        date: bookingDate,
        time: bookingTime,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        paymentMethodId: paymentMethod.id, // (simulated)
        payment_status: 'paid',
        amount: selectedService?.price
      };
      
      try {
        await sendNotification(formData);
        setSubmissionStatus('success');
      } catch {
        setSubmissionStatus('error');
      }
    }
  };


  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  
  const resetBooking = () => {
      setStep(1);
      setSelectedService(null);
      setSelectedBarber('');
      setBookingDate('');
      setBookingTime('');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setSubmissionStatus('idle');
  }

  const StepIndicator = () => (
    <div className="flex justify-center items-center mb-8">
      {['Service', 'Time', 'Details', 'Confirm', 'Payment'].map((name, index) => {
        const s = index + 1;
        return (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {s}
            </div>
            {s < 5 && <div className={`w-12 h-1 ${step > s ? 'bg-amber-500' : 'bg-slate-700'}`} />}
          </div>
        );
      })}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1: // Choose Service
        return (
          <div>
            <h2 className="text-2xl font-bold text-center mb-2 text-white">Choose Your Service</h2>
            <div className="space-y-4 pt-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedService?.id === service.id
                      ? 'border-amber-500 bg-white/10 shadow-lg'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-white">{service.name}</h3>
                      <p className="text-amber-400 font-semibold">${service.price}</p>
                    </div>
                    <span className="text-xs font-medium bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
                      {service.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 2: // Select Date & Time
        return (
          <div>
            <h2 className="text-2xl font-bold text-center mb-2 text-white">Select Date & Time</h2>
            <div className="space-y-4 pt-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  id="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-lg p-3 text-white focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-slate-300 mb-1">Time</label>
                <select
                  id="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  required
                  className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-lg p-3 text-white focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="" disabled>Select a time</option>
                  {generateTimeSlots().map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      case 3: // Your Details
        return (
          <div>
            <h2 className="text-2xl font-bold text-center mb-2 text-white">Your Details</h2>
            <div className="space-y-4 pt-4">
            <div>
                <label htmlFor="barber" className="block text-sm font-medium text-slate-300 mb-1">Choose your Barber</label>
                <select
                  id="barber"
                  value={selectedBarber}
                  onChange={(e) => setSelectedBarber(e.target.value)}
                  required
                  className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-lg p-3 text-white focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="" disabled>Select a barber</option>
                  <option value="Joe">Joe</option>
                  <option value="Mary">Mary</option>
                </select>
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-lg p-3 text-white focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="john.doe@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-lg p-3 text-white focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="(555) 123-4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-lg p-3 text-white focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        );
      case 4: // Confirm Booking
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Confirm Your Booking</h2>
            <div className="bg-slate-800/50 p-6 rounded-lg space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Service:</span>
                <span className="font-bold text-white">{selectedService?.name}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-slate-400">Barber:</span>
                <span className="font-bold text-white">{selectedBarber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-bold text-white">{bookingDate} @ {bookingTime}</span>
              </div>
              <hr className="border-slate-600"/>
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-bold text-white">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-white">{customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-bold text-white">{customerPhone}</span>
              </div>
            </div>
          </div>
        );
        case 5: // Payment
        return (
            <div>
                <h2 className="text-2xl font-bold text-center mb-2 text-white">Payment Details</h2>
                <div className="space-y-4 pt-4">
                    <p className="text-slate-300 text-center">
                        Total to pay: <span className="font-bold text-amber-400">${selectedService?.price}</span>.
                    </p>
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                        <CardElement options={{
                            style: {
                                base: {
                                    color: '#FFFFFF',
                                    fontFamily: '"DM Sans", sans-serif',
                                    fontSmoothing: 'antialiased',
                                    fontSize: '16px',
                                    '::placeholder': {
                                        color: '#aab7c4'
                                    }
                                },
                                invalid: {
                                    color: '#fa755a',
                                    iconColor: '#fa755a'
                                }
                            }
                        }} />
                    </div>
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !selectedService) return true;
    if (step === 2 && (!bookingDate || !bookingTime)) return true;
    if (step === 3 && (!customerName || !customerEmail || !customerPhone || !selectedBarber)) return true;
    return false;
  }
  
  if (submissionStatus === 'success') {
    const generateICS = () => {
      console.log("Generating calendar file...");
  
      const eventName = selectedService?.name;
      const eventDate = bookingDate && bookingTime ? new Date(`${bookingDate}T${bookingTime}`) : new Date();
  
      if (!bookingDate || !bookingTime) {
          eventDate.setDate(eventDate.getDate() + 1);
          eventDate.setHours(10, 0, 0, 0);
      }
  
      const startTime = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      eventDate.setHours(eventDate.getHours() + 1);
      const endTime = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
      const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${Date.now()}@empirecuts.com
DTSTAMP:${startTime}
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${eventName}
DESCRIPTION:Your appointment for ${eventName}.
LOCATION:Empire Cuts Barbershop
END:VEVENT
END:VCALENDAR
      `.trim();
  
      return icsContent;
    };
  
    const handleAddToCalendar = () => {
      const icsData = generateICS();
      const blob = new Blob([icsData], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'EmpireCuts-Appointment.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("Downloading calendar file...");
    };

    return (
        <div className="text-center p-4">
            <h2 className="text-2xl font-bold text-amber-500 mb-4">Booking Confirmed!</h2>
            <p className="text-slate-300 mb-6">Your appointment is set. You'll receive a confirmation email shortly.</p>
            <div className="space-y-4">
                <button 
                    onClick={handleAddToCalendar}
                    className="w-full font-bold py-3 px-6 rounded-lg text-black bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 transition-all duration-300"
                >
                    Add to Calendar
                </button>
                <button onClick={resetBooking} className="w-full font-bold py-3 px-6 rounded-lg text-white bg-slate-700 hover:bg-slate-600 transition-colors duration-300">
                    Make Another Booking
                </button>
            </div>
        </div>
    )
  }

  return (
    <div className="pb-24">
      <StepIndicator />
      <form onSubmit={handleSubmit}>
        {renderStep()}
        
        <div className="fixed bottom-0 left-0 w-full bg-slate-900/80 backdrop-blur-sm">
          <div className="max-w-md mx-auto flex items-center justify-between p-4 border-t border-white/10">
            {step > 1 ? (
              <button type="button" onClick={handleBack} className="font-bold py-3 px-6 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition-colors duration-300">Back</button>
            ) : <div/>}
            
            {step < 5 && (
              <button
                type="button"
                onClick={handleNext}
                disabled={isNextDisabled()}
                className="font-bold py-3 px-6 rounded-lg text-black bg-[#d4af37] hover:bg-[#e0c156] transition-all duration-300 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {step === 4 ? 'Proceed to Payment' : 'Next Step'}
              </button>
            )}

            {step === 5 && (
              <button
                type="submit"
                disabled={submissionStatus === 'loading' || !stripe}
                className="font-bold py-3 px-6 rounded-lg text-black bg-[#d4af37] hover:bg-[#e0c156] transition-all duration-300 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {submissionStatus === 'loading' ? 'Processing...' : `Confirm & Pay $${selectedService?.price}`}
              </button>
            )}
          </div>
          {submissionStatus === 'error' && (
              <div className="max-w-md mx-auto text-center pb-2 text-red-400">
                  Something went wrong with the payment. Please try again.
              </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default BookingWizard;
