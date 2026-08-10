import { transporter } from "../config/mailer.js";
import { generateEmailTemplate } from "../templates/toSendHREmail.js";

export const sendEmail = async ({
  email,
  subject,
  body,
  attachments = []
}) => {
  try {
    const html = generateEmailTemplate({
      title: subject,
      message: body,
    });

    const text = body.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');

    await transporter.sendMail({
      from: `"Job Scout" <${process.env.MAIL_USER}>`,
      to: email,
      subject,
      text,
      html,
      attachments
    });

    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: error.message,
    };
  }
};

