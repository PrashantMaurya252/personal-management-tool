import mongoose from "mongoose";




const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['Job Application', 'AI Analysis', 'Job Enquiry', 'Other'],
        required: true
    },

}, { timestamps: true })

const NotificationModel = mongoose.model('Notification', notificationSchema);
export default NotificationModel