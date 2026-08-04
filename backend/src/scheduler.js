import cron from 'node-cron';
import EmailModel from './model/job-email.model.js';
import { sendEmail } from './service/service.js';
import HiringManagerModel from './model/hiring-managers.js';
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
        return;
      }

      console.log(`[Scheduler] Found ${pendingEmails.length} emails to send.`);

      for (const email of pendingEmails) {
        if (!email.recipientEmail || !email.recipientEmail.email) {
          email.status = 'failed';
          await email.save();
          continue;
        }

        const emailIdStr = email._id.toString();
        const trackingLinks = {
          github: `${process.env.BACKEND_URL}/api/v1/emails/track/click/${emailIdStr}/github`,
          linkedin: `${process.env.BACKEND_URL}/api/v1/emails/track/click/${emailIdStr}/linkedin`,
          portfolio: `${process.env.BACKEND_URL}/api/v1/emails/track/click/${emailIdStr}/portfolio`,
          resume: `${process.env.BACKEND_URL}/api/v1/emails/track/click/${emailIdStr}/resume`,
        };

        let finalBody = email.generatedBody
          .replace(/\{\{GITHUB_LINK\}\}/g, `<a href="${trackingLinks.github}" target="_blank">GitHub Profile</a>`)
          .replace(/\{\{LINKEDIN_LINK\}\}/g, `<a href="${trackingLinks.linkedin}" target="_blank">LinkedIn Profile</a>`)
          .replace(/\{\{PORTFOLIO_LINK\}\}/g, `<a href="${trackingLinks.portfolio}" target="_blank">Portfolio</a>`)
          .replace(/\{\{RESUME_LINK\}\}/g, `<a href="${trackingLinks.resume}" target="_blank">Download Resume</a>`);

        finalBody = finalBody.replace(/\n/g, '<br>');
        const pixelUrl = `${process.env.BACKEND_URL}/api/v1/emails/track/open/${emailIdStr}`;
        finalBody += `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />`;

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
             for (let i=0; i<email.attachments.length; i++) {
                email.attachments[i].fileData = undefined;
             }
          }
        } else {
          email.status = 'failed';
        }
        await email.save();
      }
      console.log('[Scheduler] Finished processing scheduled emails.');
    } catch (error) {
      console.error('[Scheduler] Error processing scheduled emails:', error);
    }
  });
  console.log('Email Scheduler initialized (runs every hour at minute 0)');
};
