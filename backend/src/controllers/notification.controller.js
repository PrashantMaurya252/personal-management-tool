import NotificationModel from "../model/notification.model.js";

// @desc    Get all notifications for the logged-in user
// @route   GET /api/v1/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const notifications = await NotificationModel.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching notifications",
    });
  }
};

// @desc    Mark a specific notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while updating notification",
    });
  }
};

// @desc    Mark all unread notifications as read for the logged-in user
// @route   PUT /api/v1/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    await NotificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error updating notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while updating notifications",
    });
  }
};
