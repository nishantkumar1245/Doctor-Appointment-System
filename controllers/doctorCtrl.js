 const doctorModel=require("../models/doctorModel");
 const appointmentModel=require("../models/appointmentModel");
 const userModel=require('../models/userModel')


const getDoctorInfoController= async(req,res)=>{
    try{
        const doctor= await doctorModel.findOne({userId: req.body.userId});
        res.status(200).send({
            success:true,
            message:"doctor data fetch success",
            data:doctor,
        });


    }
    catch(error){
        console.log(error);
        resizeBy.status(500).send({
            success:false,
            message:"Error in Fetching Doctor Details",
            error
        });
    }

};

// update doc profile

const updateProfileController= async(req,res)=>{
    try{
        const doctor =await doctorModel.findOneAndUpdate({userId:req.body.userId},req.body)
        res.status(200).send({
            success:true,
            message:'Doctor profile updated',
            data:doctor,
        });

    }
    catch(error){
        console.log(error);
      
        res.status(500).send({
            success:false,
            message:"Doctor Profile Update issue",
            error
        })
    }

};

const getDoctorByIdController= async(req,res)=>{
    try{
        const doctor=await doctorModel.findOne({ _id:req.body.doctorId});
        res.status(200).send({
            success:true,
            message:"Single Doc Info Fetched",
            data:doctor,
        })

    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in Single doctor info"
    })
    }


};

const doctorAppointmentsController= async(req,res)=>{
    try{
        const doctor=await doctorModel.findOne({userId:req.body.userId});
        const appointments= await appointmentModel.find({doctorId:doctor._id,});
        res.status(200).send({
            success:true,
            message:'Doctor Appointment fetch successfully',
            data:appointments,
        });

    }
    catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error in Doc Appointments'
        })
    }


};



const updateStatusController = async (req, res) => {
    try {
        const { appointmentsId, status } = req.body;

        // Find the appointment by ID and update the status
        const appointment = await appointmentModel.findByIdAndUpdate(appointmentsId, { status }, { new: true });

        // Ensure the appointment exists and has a userId
        if (!appointment || !appointment.userId) {
            return res.status(404).send({
                success: false,
                message: 'Appointment or user not found'
            });
        }

        // Find the user based on the userId from the appointment
        const user = await userModel.findOne({ _id: appointment.userId });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'User not found'
            });
        }

        // Update user's notifications
        const notification = user.notification 
        notification.push({
            type: 'status-updated',
            message: `Your appointment has been updated to ${status}`,
            onClickPath: '/doctor-appointments',
        });
        // user.notification = notification;

        // Save the updated user document
        await user.save();

        res.status(200).send({
            success: true,
            message: "Appointment Status Updated"
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error In Update Status'
        });
    }
}


module.exports={getDoctorInfoController,updateProfileController,getDoctorByIdController,doctorAppointmentsController,updateStatusController};