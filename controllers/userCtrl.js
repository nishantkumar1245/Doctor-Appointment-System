
// import ApplyDoctor from  './../client/src/pages/ApplyDoctor';

const userModel=require("../models/userModel");
const bcrypt=require('bcryptjs');
const jwt =require('jsonwebtoken');
const doctorModel=require("../models/doctorModel.js");
const appointmentModel = require('../models/appointmentModel.js'); 
const moment =require('moment')
const registerController = async(req,res)=>{

    try{

        const existingUser= await userModel.findOne({email:req.body.email});
        if(existingUser){
            return res.status(200).send({message:'User Already Exist' ,success:false});
        }
        const password=req.body.password;
         
        const salt= await bcrypt.genSalt(10);

        const hashedpassword= await bcrypt.hash(password,salt);

        req.body.password=hashedpassword;
        
        const newUser= new userModel(req.body);

        await newUser.save();

        res.status(201).send({message:'Register Successfully',success:true});

    }
    catch(error){
        console.log(error);
        res.status(500).send({success:false ,message:`register Controller ${error.message}`})

    }
}


const loginController= async( req,res)=>{
  
    try{
        const user=await userModel.findOne({email:req.body.email});
    
      
        if(!user){
            return res.status(200).send({message:"user not found" ,success:false});
        }
       
        const isMatch=await bcrypt.compare(req.body.password,user.password);
        if(!isMatch){
            return res.status(200).send({message:"Invalid email or password",success:false});
        }

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET ,{expiresIn:"1d" });
       
        res.status(200).send({message:"login Successfully",success:true ,token});

    }
    catch(error){
        console.log(error);
        res.status(500).send({message:`Error in login CTRL ${error.message} `})
    }
}

const authController= async(req,res)=>{
    try{

        const user= await  userModel.findById({_id: req.body.userId});
        user.password=undefined;
        if(!user){
            return res.status(200).send({
                message:"user not find",
                success:false,
            });
        }
        else{
            res.status(200).send({
                success:true,
                data:user
            })
        }

    }
    catch(error){
        console.log(error);
        res.status(500).send({
            message:"auth error",
            success:false,
            error
        });
    }

}



const applyDoctorController= async(req,res)=>{
    try{
        const newDoctor= await doctorModel({...req.body,status:'pending'})
        await newDoctor.save()
        const adminUser=await userModel.findOne({isAdmin:true})
        const  notification=adminUser.notification
        notification.push({
            type:'apply-doctor-request',
            message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
            data:{
                doctorId:newDoctor._id,
                name:newDoctor.firstName + " " + newDoctor.lastName,
                onClickPath:'/admin/doctors'
            }
        })
        await userModel.findByIdAndUpdate(
            adminUser._id, { notification: notification } );
            res.status(201).send({
                success:true,
                message:'Doctor Account Applied Successful'
            })


    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success:false,error,
            message:'Error while Applying For Doctor'
        })
    }

}

const getAllNotificationController = async (req, res) => {
    try {
       const user=await userModel.findById({_id:req.body.userId});
       const seennotification=user.seennotification;
       const notification=user.notification;
       seennotification.push(...notification);
       user.notification=[];
       user.seennotification=notification;
       const updatedUser=await user.save();
       res.status(200).send({
        success:true,
        message:'all notification marked as read',
        data:updatedUser,

       });


    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in notification',
            error
        });
    }
};

// delete notification

const deleteAllNotificationController= async(req,res)=>{
    try{
        const user=await userModel.findOne({_id:req.body.userId});
        user.notification=[];
        user.seennotification=[];
        const updatedUser=await user.save();
        updatedUser.password=undefined;
        res.status(200).send({
            success:true,
            message:"Notification Deleted successfully",
            data:updatedUser,
        });

    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:'unble to delete all notification',
            error
        })
    }

};

const getAllDoctorsController=async(req,res)=>{
    try{
        const doctors= await doctorModel.find({status:"approved"});
        res.status(200).send({
            success:true,
            message:"Doctors list fetched Successfully",
            data:doctors,
        });

    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"error while Fetching Doctors ",
        })
    }

};

// BOOK APPOINTMENT

 // Adjust the path as necessary

 const bookAppointmentController = async (req, res) => {
      
    try{
        req.body.date = moment (req.body.date,'DD-MM-YYYY').toISOString();
        req.body.time= moment (req.body.time, 'HH:mm').toISOString();
        req.body.status='pending'
        const newAppointment= new appointmentModel(req.body)
        await newAppointment.save()

        const user=await userModel.findOne({_id: req.body.doctorInfo.userId})
        user.notification.push({
            type:'New-appointment-request',
            message:`A new Appointment Request from ${req.body.userInfo.name}`,
            onClickPath:'/user/appointments'
        })
        await user.save();
        res.status(200).send({
            success:true,
            message:"Appointment Book successfully"
        })

    }
    catch(error){
        conlog.log(error);
        res.send(500).send({
            success:false,
            error,
            message:'Error while Booking Appointment'
        })
    }
 };

 const bookingAvailabilityController= async(req,res)=>{
    try{
        const date= moment(req.body.date, "DD-MM-YY").toISOString();
        const fromTime = moment (req.body.time,"HH:mm")
        .subtract(1, "hours")
        .toISOString();

        const toTime =moment (req.body.time,"HH:mm")
        .add(1,"hours")
        .toISOString();
        const doctorId = req.body.doctorId;
        const appointments =await appointmentModel.find({
            doctorId,
            date,
            time:{
                $gte: fromTime,
                $lte : toTime
            },

        });

        if(appointments.length>0){
            return res.status(200).send({
                message:"Appointment not Available at this time",
                success:true,
            });
        }
        else{
            return res.status(200).send({
                success:true,
                message:"Appointments available",
            });
        }

    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success:true,
            error,
            message:'Error in Booking'
        })
    }

 };

 const userAppointmentsController=async(req,res)=>{
    try{

        const appointments= await appointmentModel.find({userId :req.body.userId})
        res.status(200).send({
            success:true,
            message:'Users Appointments fetch Succesfully',
            data:appointments,
        })

    }
    catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error in use Appointments',
            error
        })
    }
 };
 
 
  




module.exports={loginController,registerController ,authController,applyDoctorController,getAllNotificationController,deleteAllNotificationController,getAllDoctorsController,bookAppointmentController,bookingAvailabilityController,userAppointmentsController}