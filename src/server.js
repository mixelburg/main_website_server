const fs = require('fs');
const { MongoClient } = require("mongodb")
const Express = require("express")
const path = require("path")
const config = require("./secret/config.json")
const cors = require('cors');
const https = require('https');
const bodyParser = require('body-parser')
const handlers = require('./handlers')

const uri = config["db_uri"]
const port = config["listen_port"]
const SECRET_KEY = config["SECRET_KEY"];

const privateKey  = fs.readFileSync('/etc/letsencrypt/live/mixelburg.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/mixelburg.com/fullchain.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

const errorCatcher = (callback) => {
    try {
        callback()
    } catch (e) {
        console.log(`[!!] error in ${callback.name}`)
        console.log(e)
    }

}

async function connectDB() {
    const client = new MongoClient(uri, { useUnifiedTopology: true })
    try{
        // connect the database
        await client.connect()
        const projects = client.db("main").collection("projects")
        const about_exp = client.db("main").collection("about_exp")
        const about_edu = client.db("main").collection("about_edu")

        console.log("[+] DB connected")

        // initialize Express
        const app = Express()

        app.use('/files', Express.static('files'))

        app.use(cors());

        // parse application/json
        app.use(bodyParser.json());
        // parse application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({ extended: true }));

        app.use(Express.static(path.join(__dirname, 'build')));

        app.get('/projects', (req, res) => {
            errorCatcher(() => {
                handlers.projectsHandler(req, res, projects)
            })
        });

        app.get('/projects/:project_id/photos/:photo', (req, res) => {
            errorCatcher(() => {
                handlers.photoHandler(req, res)
            })
        })

        app.get('/about', (req, res) => {
            errorCatcher(() => {
                handlers.aboutHandler(req, res, about_exp, about_edu)
            })
        });

        // verify reCAPTCHA response
        app.post('/verify', (req, res) => {
            errorCatcher(() => {
                handlers.verifyHandler(req, res, SECRET_KEY)
            })
        });

        app.post('/mail', (req, res) => {
            errorCatcher(() => {
                handlers.mailHandler(
                    req, res,
                    config['MAIL_KEY'], config['MAIL_TO'], config['MAIL_FROM']
                )
            })
        });

        const httpsServer = https.createServer(credentials, app);
        httpsServer.listen(port)

    } catch (e) {
        console.log(e)
    }
}

connectDB()






