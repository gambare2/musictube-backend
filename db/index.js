const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log('Connected to MongoDB');
})
.catch((err)=>{
    console.log("[MongoDB] Connection error: ", err);
});

module.exports = mongoose;