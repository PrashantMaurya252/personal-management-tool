import cron from 'node-cron';
import EmailModel from './model/job-email.model.js';
import { sendEmail } from './service/service.js';
import HiringManagerModel from './model/hiring-managers.js';
import UserModel from './model/user.model.js';
import ResumeModel from './model/resume.model.js';
import NotificationModel from './model/notification.model.js';
import JobOpeningModel from './model/job-opening.model.js';
import dotenv from 'dotenv';
dotenv.config();

export const initializeScheduler = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Checking for scheduled emails...');
    try {
      const pendingEmails = await EmailModel.find({
        status: 'scheduled',
        scheduledAt: { $lte: new Date() }
      }).populate('recipientEmail');

      if (pendingEmails.length === 0) {
        console.log('[Scheduler] No scheduled emails to send at this time.');
      } else {
        console.log(`[Scheduler] Found ${pendingEmails.length} emails to send.`);

        for (const email of pendingEmails) {
          if (!email.recipientEmail || !email.recipientEmail.email) {
            email.status = 'failed';
            await email.save();
            continue;
          }

          let finalBody = email.generatedBody;
          
          let selectedResume = null;
          if (email.resumeId) {
            selectedResume = await ResumeModel.findById(email.resumeId);
          }
          if (!selectedResume && email.userId) {
            selectedResume = await ResumeModel.findOne({ userId: email.userId, isDefault: true });
          }
          if (!selectedResume && email.userId) {
            selectedResume = await ResumeModel.findOne({ userId: email.userId });
          }

          const extractedData = selectedResume?.extractedData || {};

          if (extractedData.github) {
            finalBody = finalBody.replace(/\{\{GITHUB_LINK\}\}/g, `<a href="${extractedData.github}" target="_blank">GitHub Profile</a>`);
          } else {
            finalBody = finalBody.replace(/^.*\{\{GITHUB_LINK\}\}.*$\n?/gm, '');
          }
  
          if (extractedData.linkedin) {
            finalBody = finalBody.replace(/\{\{LINKEDIN_LINK\}\}/g, `<a href="${extractedData.linkedin}" target="_blank">LinkedIn Profile</a>`);
          } else {
            finalBody = finalBody.replace(/^.*\{\{LINKEDIN_LINK\}\}.*$\n?/gm, '');
          }
  
          if (extractedData.portfolio) {
            finalBody = finalBody.replace(/\{\{PORTFOLIO_LINK\}\}/g, `<a href="${extractedData.portfolio}" target="_blank">Portfolio</a>`);
          } else {
            finalBody = finalBody.replace(/^.*\{\{PORTFOLIO_LINK\}\}.*$\n?/gm, '');
          }
  
          if (extractedData.resumeLink || selectedResume?.url) {
            const resumeUrl = extractedData.resumeLink || selectedResume?.url;
            finalBody = finalBody.replace(/\{\{RESUME_LINK\}\}/g, `<a href="${resumeUrl}" target="_blank">Download Resume</a>`);
          } else {
            finalBody = finalBody.replace(/^.*\{\{RESUME_LINK\}\}.*$\n?/gm, '');
          }

          finalBody = finalBody.replace(/\n/g, '<br>');

          let attachments = [];
          if (email.attachments && email.attachments.length > 0) {
            for (const att of email.attachments) {
              if (att.fileData) {
                attachments.push({
                  filename: att.fileName,
                  content: att.fileData
                });
              } else if (att.fileUrl) {
                attachments.push({
                  filename: att.fileName,
                  href: att.fileUrl
                });
              }
            }
          }

          const result = await sendEmail({
            email: email.recipientEmail.email,
            subject: email.generatedSubject,
            body: finalBody,
            attachments
          });

          if (result.success) {
            email.status = 'sent';
            email.sentAt = new Date();
            if (email.attachments && email.attachments.length > 0) {
              for (let i = 0; i < email.attachments.length; i++) {
                email.attachments[i].fileData = undefined;
              }
            }
          } else {
            email.status = 'failed';
          }
          await email.save();
        }
        console.log('[Scheduler] Finished processing scheduled emails.');
      }
    } catch (error) {
      console.error('[Scheduler] Error processing scheduled emails:', error);
    }
  });

  // Run every hour to generate activity notifications
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Generating hourly activity notifications...');
    try {
      const users = await UserModel.find({});
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dateString = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const title = `Activity Summary for ${dateString}`;

      for (const user of users) {
        // Count applications sent today
        const appsSent = await EmailModel.countDocuments({
          userId: user._id,
          purpose: 'Application',
          createdAt: { $gte: today }
        });

        // Count enquiries sent today
        const enqsSent = await EmailModel.countDocuments({
          userId: user._id,
          purpose: 'Enquiry',
          createdAt: { $gte: today }
        });

        // Count job openings found today
        const jobsFound = await JobOpeningModel.countDocuments({
          userId: user._id,
          dateFound: { $gte: today }
        });

        // Only create or update if there's any activity
        if (appsSent > 0 || enqsSent > 0 || jobsFound > 0) {
          const description = `Today you have sent ${appsSent} job application(s) and ${enqsSent} job enquiry(s). Your Job Scout found ${jobsFound} new job opening(s) today.`;

          const existingNotification = await NotificationModel.findOne({ userId: user._id, title: title });

          if (existingNotification) {
            existingNotification.description = description;
            // Optionally set isRead to false if we want to alert the user again, 
            // but might be annoying. We leave it as is or reset if we want.
            await existingNotification.save();
          } else {
            await NotificationModel.create({
              userId: user._id,
              title: title,
              description: description,
              type: 'Other',
              isRead: false
            });
          }
        }
      }
      console.log('[Scheduler] Finished generating activity notifications.');
    } catch (error) {
      console.error('[Scheduler] Error generating activity notifications:', error);
    }
  });

  console.log('Email Scheduler initialized (runs every hour at minute 0)');
};
