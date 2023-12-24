/** @format */

const express = require('express');

const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

require('dotenv/config');
app.use(
	cors({
		origin: '*',
	})
);
app.use(morgan('dev'));
app.use(express.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '200mb' }));
app.use(bodyParser.json({ limit: '200mb' }));

//Routes
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);

//env var
const URL = process.env.MONGODB_URI;
const PORT = process.env.PORT || '1111';

const connectDb = () => {
	mongoose
		.connect(URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => {
			// we need .then because
			//it returns a promise
			console.log('Database is connected...');
		})
		.catch((error) => {
			console.log('Error:', error.message);
		});
};

connectDb();

// async function checkPlan() {
// 	try {
// 		const allusers = await User.find({
// 			isExpired: false,
// 			'plan.category': { $in: ['Monthly', 'Yearly'] },
// 		});

// 		for (const rev of allusers) {
// 			if (new Date(rev.plan.lastDate) < new Date()) {
// 				rev.isExpired = true;
// 				await rev.save();
// 			}
// 		}
// 	} catch (err) {
// 		console.log(err);
// 	}
// }

// setInterval(checkPlan, 300000);

app.get('/', async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	res.send({ msg: 'This has enabled CORS' });
});

app.listen(PORT, () => {
	console.log(`Server is running on PORT: ${PORT}`);
});
