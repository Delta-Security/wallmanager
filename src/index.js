const chalk = require("chalk");
const openssh = require("ssh2-promise");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

const configpath = path.join(__dirname + "/../config.json");

if (!fs.existsSync(configpath)) {
    console.log(chalk.red("[CRITICAL] A configuration file wasn't found."));
    process.exit(69);
};

if (!fs.existsSync(__dirname + "/../compiled")) {
    fs.mkdirSync(path.join(__dirname + "/../compiled"));
};

const config = require(configpath);
const directives = path.join(__dirname + `/../${config.directives}`);

if (!fs.existsSync(directives)) {
    fs.mkdirSync(directives);
};

fs.readdirSync(directives).forEach(async firaw => {
    const directive = JSON.parse(fs.readFileSync(path.join(`${directives}/${firaw}`)));

    let queryRaw = {};
    let query;
    queryRaw = await fetch(`https://api.mcsrvstat.us/2/${directive.proxyTo}`).catch(f => {
        queryRaw.status = 500;
        queryRaw.erroredOut = true;
    });
    if (queryRaw.status == 200) {
        query = await queryRaw.json();
        console.log(query)
        if (query.description == null || query.description.trim() == "") directive.onlineStatus.motd = "A minecraft server";
        directive.onlineStatus.motd = query.motd.raw.join("\n");
    };

    console.log(directive);


/*
    config.hosts.forEach(async host => {
        const session = new openssh({
            host: host,
            username: "root",
            identity: path.join(__dirname + "/../sshkey")
        });

        const transfer = session.sftp();
        
        await session.connect().then(c => {
            console.log(chalk.blue(`[INFO] WallManager connected to node ${host} (${new Date().toUTCString()})`));
        }).catch(e => {
            console.log(chalk.red(`[ERR] WallManager failed to connect to node ${host} (${new Date().toUTCString()})`));
        });

        transfer.createWriteStream(`/infrared/configs/${firaw}`).write(JSON.stringify(directive));
        
    });
    */

});