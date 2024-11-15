const nodeMail = require('nodemailer')

async function sendMail(userEmail, msg, subject='360followups.com') {
    const transporter = nodeMail.createTransport({
        service: 'gmail',
        auth:{
            user: 'karanghorse91@gmail.com',
            pass: process.env.MAIL_SECRET,
        }
    })

    const mailOption = {
        from: 'karanghorse91@gmail.com',
        to: userEmail,
        subject: subject,
        html: msg,
    }

    try {
        const result = await transporter.sendMail(mailOption)
        console.log("mail send sucessfully");
        return [{res:'okk'},result];
    } catch (err) {
        console.log('mail send failed with error', err);
    }
}

module.exports = {
    sendMail,
}