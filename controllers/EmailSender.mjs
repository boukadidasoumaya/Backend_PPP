import nodemailer from "nodemailer";

const sendEmail = async (mail, subject, message) => {
    // Create a Nodemailer transporter using SMTP
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_EMAIL, // Your Outlook email address
            pass: process.env.EMAIL_PASSWORD, // Your Outlook password
        }
    });
console.log(message);
console.log(subject)   // Create email options
    const mailOptions = {
        from: process.env.EMAIL_EMAIL, // Sender address (your Outlook email address)
        to: "mabahej.benhassine@insat.ucar.tn", // List of recipients
        subject: subject, // Subject line
        text: message.link // Plain text body
    };

    try {
        // Send mail with defined transport object
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: 'Internal server error' };
    }
};

export default sendEmail;
