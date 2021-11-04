const mail = require("./mail");
const fetch = require("node-fetch")

async function getData(collection) {
    return await (await collection.find()).toArray()
}

async function getSortedData(collection) {
    return await (await collection.find().sort({ date : 1 })).toArray()
}

const projectsHandler = async (req, res, projects) => {
    const data = await getData(projects)
    res.send(JSON.stringify(data))
}

const photoHandler = (req, res) => {
    res.sendFile(`${__dirname}/photos/${req.params["project_id"]}/${req.params["photo"]}`)
}

const aboutHandler = async (req, res, about_exp, about_edu) => {
    res.send(JSON.stringify(
        {
            experience: await getSortedData(about_exp),
            education: await getSortedData(about_edu)
        }
    ))
}

const verifyHandler = async (req, res, SECRET_KEY) => {
    const VERIFY_URL =
        `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${req.body['g-recaptcha-response']}`;
    const api_res = await fetch(VERIFY_URL, { method: 'POST' })
    const json = await api_res.json()
    res.send(json)
}

const mailHandler = async (req, res, key, mail_to, mail_from) => {
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
