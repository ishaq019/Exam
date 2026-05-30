const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quizdb";
  
  const isAtlas = uri.includes("mongodb+srv");
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // Atlas-optimized settings
        serverSelectionTimeoutMS: isAtlas ? 30000 : 5000,
        socketTimeoutMS: isAtlas ? 60000 : 45000,
        maxPoolSize: isAtlas ? 20 : 10,
        minPoolSize: isAtlas ? 4 : 2,
        retryWrites: true,
        w: "majority",
        bufferCommands: false,
        connectTimeoutMS: isAtlas ? 30000 : 10000,
      });
      console.log("MongoDB connected successfully");
      return;
    } catch (err) {
      retries++;
      console.error(
        `MongoDB connection attempt ${retries}/${maxRetries} failed:`,
        err.message
      );

      if (retries < maxRetries) {
        const delay = Math.pow(2, retries) * 1000; 
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(
          "MongoDB connection failed after all retries. Please check:"
        );
        console.error(
          "1. IP Whitelist in MongoDB Atlas (allow current IP or 0.0.0.0/0)"
        );
        console.error("2. MongoDB URI and credentials in .env");
        console.error("3. Database name and appName in connection string");
        console.error("4. Network connectivity to MongoDB Atlas");
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
