const fs = require('fs');
const { MongoClient } = require("mongodb")
const Express = require("express")
const path = require("path")
const config = require("./config.json")
const cors = require('cors');
const https = require('https');
const fetch = require('node-fetch');
const bodyParser = require('body-parser')

const uri = config["db_uri"]
const port = config["listen_port"]
const SECRET_KEY = config["SECRET_KEY"];

const privateKey  = fs.readFileSync('/etc/letsencrypt/live/mixelburg.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/mixelburg.com/fullchain.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

async function getData(collection) {
    let result = await collection.find()

    return await result.toArray()
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

        app.use(cors());

        // parse application/json
        app.use(bodyParser.json());
        // parse application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({ extended: true }));

        app.use(Express.static(path.join(__dirname, 'build')));

        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'build', 'index.html'));
        });

        app.get('/projects', (req, res) => {
            getData(projects).then(data => {
                res.send(JSON.stringify(data))
            })
        });

        app.get('/projects/:project_id/photos/:photo', (req, res) => {
            res.sendFile(`${__dirname}/photos/${req.parSams["project_id"]}/${req.params["photo"]}`)
        })

        app.get('/about', (req, res) => {
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
        });

        // verify reCAPTCHA response
        app.post('/verify', (req, res) => {
            const VERIFY_URL = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${req.body['g-recaptcha-response']}`;
            return fetch(VERIFY_URL, { method: 'POST' })
                .then(res => res.json())
                .then(json => res.send(json));
        });

        //app.listen(port)

        const httpsServer = https.createServer(credentials, app);
        httpsServer.listen(port)

    } catch (e) {
        console.log(e)
    }
}

connectDB()






