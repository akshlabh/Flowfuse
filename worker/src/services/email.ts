import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_ENDPOINT,
  port: 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(to: string, body: string) {
  try {
    await transport.sendMail({
      from: "sankalpjain2006@gmail.com",
      sender: "sankalpjain2006@gmail.com",
      to,
      subject: "Hello from FlowFuse",
      text: body,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
  
}
