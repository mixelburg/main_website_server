const mail = require("./mail");
const fetch = require("node-fetch")

async function getData(collection) {
    let result = await collection.find()

    return await result.toArray()
}

const projectsHandler = (req, res, projects) => {
    getData(projects).then(data => {
        res.send(JSON.stringify(data))
    })
}

const photoHandler = (req, res) => {
    res.sendFile(`${__dirname}/photos/${req.params["project_id"]}/${req.params["photo"]}`)
}

const aboutHandler = (req, res, about_exp, about_edu) => {
    getData(about_exp).then(exp_data => {
        getData(about_edu).then(edu_data => {
            res.send(JSON.stringify(
                {
                    experience: exp_data,
                    education: edu_data
                }
            ))
        })
    })
}

const verifyHandler = (req, res, SECRET_KEY) => {
    const VERIFY_URL =
        `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${req.body['g-recaptcha-response']}`;
    return fetch(VERIFY_URL, { method: 'POST' })
        .then(res => res.json())
        .then(json => res.send(json));
}

const mailHandler = (req, res, key, mail_to, mail_from) => {
    console.log(req.body)

    if (req.body['key'] === key) {
        const mailBody = {
            to: mail_to,
            from: mail_from,
            subject: "[contact]",
            message: `
                from: ${req.body['from_name']}
                email: ${req.body['email']}
                message:
                ${req.body['message']}
                `
        }
        mail.sendMail(mailBody)

        res.send(JSON.stringify({status: "1", msg: "[+] email sent successfully"}))
    }
    else {
        res.send(JSON.stringify({status: "1", msg: "[!] error sending email"}))
    }

}

module.exports = {
    projectsHandler,
    photoHandler,
    aboutHandler,
    verifyHandler,
    mailHandler
}
