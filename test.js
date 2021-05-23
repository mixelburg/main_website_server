const config = require("./config.json")
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config["mail_user"],
        pass: config["mail_pass"]
    }
});


const mailOptions = {
    from: config["mail_from"],
    to: config["mail_from"],
    subject: `[contact] from test`,
    text: `reply to: test`
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});
