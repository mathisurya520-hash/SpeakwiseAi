const mongoose = require('mongoose');
const User = require('./models/User');
(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/speakwise_ai');
    const users = await User.find({ email: { $regex: 'mathisurya520@gmail.com' } }, 'email username');
    console.log(JSON.stringify(users, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
