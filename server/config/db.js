const mongoose = require('mongoose');
const connectToDatabase = async () => {
  const mongoUri = process.env.NODE_ENV === 'production' ? process.env.MONGO_URI : process.env.MONGO_URI_TEST
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri);
    console.log(`Database Connected`);
  } catch (error) {
    console.log(error);
  }

}

module.exports = connectToDatabase;
