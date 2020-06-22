var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var wikiRouter = require('./routes/wiki')
const catalogRouter = require('./routes/catalog');  // 导入 catalog 路由
var compression = require('compression');
var helmet = require('helmet');

var app = express();

const bodyParser = require("body-parser")
app.use(compression()); //Compress all routes
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));

// 设置 Mongoose 连接
// 1.导入mongoose库
const mongoose = require('mongoose');
// 2.连接数据库
const mongoDB = process.env.MONGODB_URI || 'mongodb+srv://yufang:yufang93@yf@cluster0-ioygd.mongodb.net/locallibrary?retryWrites=true&w=majority';
mongoose.connect(mongoDB,{ useNewUrlParser: true,useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
// 3.监听数据库链接
db.on('error', console.error.bind(console, 'MongoDB 连接错误：'));

// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://yufang:yufang93@yf@cluster0-ioygd.mongodb.net/locallibrary?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true });
// client.connect(err => {
//   // const books = client.db("locallibrary").collection('books')
//   // books.countDocuments({},function (err,result) {
//   //   console.log('9999999');
//   //   console.log(result);
//   // })
//   // books.find({}).toArray(function (err,result) {
//   //   if (err) return console.log(err);
//   //   console.log('6666')
//   //   console.log(result);
//   // })
//   console.log("数据库已连接!");
//   client.close();
// });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wiki',wikiRouter)
app.use('/catalog', catalogRouter);  // 将 catalog 路由添加进中间件链

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
