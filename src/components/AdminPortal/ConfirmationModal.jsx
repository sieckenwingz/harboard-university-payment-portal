//confirmation modal for payment confirmation and rejection

import React from "react";
import { motion } from "framer-motion";

const ConfirmationModal = ({ type, isExiting, onClose }) => {
  const circleAnimation = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1, transition: { delay: 0.2, duration: 0.6 } },
    exit: { pathLength: 0, opacity: 0, transition: { duration: 0.3 } }
  };

  const checkIconAnimation = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1, transition: { delay: 0.5, duration: 0.4 } },
    exit: { pathLength: 0, opacity: 0, transition: { duration: 0.3 } }
  };

  const xIconAnimation = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1, transition: { delay: 0.5, duration: 0.4 } },
    exit: { pathLength: 0, opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-[418px] h-[278px] relative bg-neutral-50 rounded-[10px] shadow-lg z-60"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={isExiting ? { scale: 0.9, opacity: 0 } : { scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="absolute top-[10px] right-[10px] text-black text-xl font-semibold cursor-pointer px-2 py-1 rounded hover:bg-gray-200 transition duration-150"
          onClick={onClose}
        >
          ×
        </div>

        {/* Confirmation Message */}
        {type === 'confirm' ? (
          <>
            <div className="absolute top-[136px] left-0 right-0 text-center text-[#15aa07] text-xl font-semibold">
              Payment Confirmed!
            </div>
            <div className="absolute top-[165px] left-0 right-0 text-center text-[15px] font-normal">
              The payment has been successfully verified.<br />
              Student will be notified of this update.
            </div>
            <motion.div
              className="absolute top-[59px] left-[173px] w-[72px] h-[72px] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg width="72" height="72" viewBox="0 0 72 72">
                <motion.circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="#15aa07"
                  strokeWidth="4"
                  fill="none"
                  variants={circleAnimation}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                />
                <motion.path
                  d="M24 36l8 8L48 28"
                  stroke="#15aa07"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={checkIconAnimation}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                />
              </svg>
            </motion.div>
          </>
        ) : type === 'bulk_confirm' ? (
          <>
            <div className="absolute top-[136px] left-0 right-0 text-center text-[#15aa07] text-xl font-semibold">
              Payments Confirmed!
            </div>
            <div className="absolute top-[165px] left-0 right-0 text-center text-[15px] font-normal">
              Matched payment has been successfully verified.<br />
              Students will be notified of this update.
            </div>
            <motion.div
              className="absolute top-[59px] left-[173px] w-[72px] h-[72px] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg width="72" height="72" viewBox="0 0 72 72">
                <motion.circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="#15aa07"
                  strokeWidth="4"
                  fill="none"
                  variants={circleAnimation}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                />
                <motion.path
                  d="M24 36l8 8L48 28"
                  stroke="#15aa07"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={checkIconAnimation}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                />
              </svg>
            </motion.div>
          </>
        ) : (
          <>
            <div className="absolute top-[136px] left-0 right-0 text-center text-[#e53935] text-xl font-semibold">
              Payment Rejected!
            </div>
            <div className="absolute top-[165px] left-0 right-0 text-center text-[15px] font-normal">
              The payment has been rejected.<br />
              Student will be notified to resubmit.
            </div>
            <motion.div
              className="absolute top-[59px] left-[173px] w-[72px] h-[72px] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg width="72" height="72" viewBox="0 0 72 72">
                <motion.circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="#e53935"
                  strokeWidth="4"
                  fill="none"
                  variants={circleAnimation}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                />
                <motion.path
                  d="M26 26L46 46M46 26L26 46"
                  stroke="#e53935"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={xIconAnimation}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                />
              </svg>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationModal;