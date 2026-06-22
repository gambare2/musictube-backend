const mongoose = require('mongoose');
const dns = require("dns");

console.log("DNS Servers:", dns.getServers());

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("DNS Servers After:", dns.getServers());

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Mongo URI:", process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.log("[MongoDB] Connection error: ", err);
    });

module.exports = mongoose;