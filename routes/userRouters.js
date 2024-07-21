

const express = require("express");
const { 
    registerController, 
    loginController, 
    authController, 
    applyDoctorController, 
    getAllNotificationController, 
    deleteAllNotificationController, 
    getAllDoctorsController, 
    bookAppointmentController, 
    bookingAvailabilityController, 
    userAppointmentsController
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// LOGIN || POST
router.post("/login", loginController);

// Register || POST
router.post("/register", registerController);

// Auth || POST
router.post("/getUserData", authMiddleware, authController);

// Apply doctor || POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);

// Notification Doctor || POST
router.post("/get-all-notification", authMiddleware, getAllNotificationController);

// Notification Doctor || POST
router.post("/delete-all-notification", authMiddleware, deleteAllNotificationController);

// GET ALL DOCTORS
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

// BOOK APPOINTMENT
router.post('/book-appointment', authMiddleware, bookAppointmentController);

// Booking Availability
router.post('/booking-availability', authMiddleware, bookingAvailabilityController);

// Appointments List

router.get('/user-appointments',authMiddleware ,userAppointmentsController)



module.exports = router;
