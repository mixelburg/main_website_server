const fs = require('fs');
const { MongoClient } = require("mongodb")
const Express = require("express")
const path = require("path")
const config = require("./config.json")
const cors = require('cors');
const https = require('https');

const privateKey  = fs.readFileSync('/etc/letsencrypt/live/mixelburg.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/mixelburg.com/fullchain.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

const uri = config["db_uri"]
const port = config["listen_port"]


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

        console.log("[+] DB connected")

        // initialize Express
        const app = Express()

        app.use(cors());

        app.use(Express.static(path.join(__dirname, 'build')));

        app.get('/', function (req, res) {
            res.sendFile(path.join(__dirname, 'build', 'index.html'));
        });


        app.get('/projects', function(req, res){
            getData(projects).then(data => {
                res.send(JSON.stringify(data))
            })
        });

        app.get('/projects/:project_id/photos/:photo', function (req, res) {
            res.sendFile(`${__dirname}/photos/${req.params["project_id"]}/${req.params["photo"]}`)
        })


        const httpsServer = https.createServer(credentials, app);
        httpsServer.listen(port)

    } catch (e) {
        console.log(e)
    }
}

connectDB()






