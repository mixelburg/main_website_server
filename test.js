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

console.log("sending mail")
transporter.sendMail(mailOptions, (error, info) => {
    console.log("got response")
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});
