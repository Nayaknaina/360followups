const mongoose = require("mongoose");
// const mongoUri = `mongodb+srv://nainanayak288:01QKzxY3dSOcP1nN@wsvconnect.bpxfx.mongodb.net/Herokudeploy`
// const mongoUri = `mongodb+srv://nainanayak288:01QKzxY3dSOcP1nN@wsvconnect.bpxfx.mongodb.net/`
const mongoUri = "mongodb://localhost:27017/360Followups";

mongoose
  .connect(mongoUri, {
    connectTimeoutMS: 30000,
  })
  .then(() => {
    console.log(`Database Connection Successful:)`);
  })
  .catch((e) => {
    console.log(`Database connection Failed`);
  });
