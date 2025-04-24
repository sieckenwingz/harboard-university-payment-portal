// Help.jsx - Updated to remove Header and Sidebar (now in Layout)
import React from 'react';

const Help = () => {
  const faqItems = [
    {
      question: "How do I pay my tuition fees?",
      answer: "You can pay your tuition fees through bank transfer, online payment, or at the university cashier's office. Log in to your account, go to Liabilities, select the fee you want to pay, and follow the payment instructions."
    },
    {
      question: "I made a payment but it's not showing up in my account. What should I do?",
      answer: "Payments typically reflect within 24-48 hours. If your payment hasn't appeared after 48 hours, please contact the Finance Office with your payment receipt details."
    },
    {
      question: "How do I request for a payment extension?",
      answer: "Payment extension requests must be submitted through the Student Affairs Office. Please submit your request at least one week before the payment deadline."
    },
    {
      question: "Who do I contact for payment-related issues?",
      answer: "For payment-related issues, please contact the Finance Office at finance@harboard.edu or visit them during office hours (Monday-Friday, 8:00 AM - 5:00 PM)."
    }
  ];

  return (
    <>
      <h1 className="text-gray-700 text-[28px] font-medium">Help & Support</h1>
      
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-medium text-[#a63f42] mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Support</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-[#a63f42] mb-1">Finance Office</h3>
              <p className="text-gray-600">Email: finance@harboard.edu</p>
              <p className="text-gray-600">Phone: (123) 456-7890</p>
              <p className="text-gray-600">Office Hours: Monday-Friday, 8:00 AM - 5:00 PM</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#a63f42] mb-1">Student Affairs Office</h3>
              <p className="text-gray-600">Email: sao@harboard.edu</p>
              <p className="text-gray-600">Phone: (123) 456-7891</p>
              <p className="text-gray-600">Office Hours: Monday-Friday, 8:00 AM - 5:00 PM</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#a63f42] mb-1">Technical Support</h3>
              <p className="text-gray-600">Email: techsupport@harboard.edu</p>
              <p className="text-gray-600">Phone: (123) 456-7892</p>
              <p className="text-gray-600">Office Hours: Monday-Friday, 8:00 AM - 8:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Help;