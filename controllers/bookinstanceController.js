const BookInstance = require('../models/bookinstance')
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
var Book = require('../models/book');

// 增
exports.bookinstance_create_get = function(req, res, next) {       

    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bookinstance_form', {title: '创建书实例', book_list:books});
    });
    
};
exports.bookinstance_create_post = [

    // Validate fields.
    body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: '创建书实例', book_list : books, selected_book : bookinstance.book._id , errors: errors.array(), bookinstance:bookinstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
];
// 删
exports.bookinstance_delete_get = function(req,res,next) {
    async.parallel({
      bookinstance: function(callback){
          BookInstance.findById(req.params.id).exec(callback)
      },
      bookinstance_books: function(callback){
          Book.find({ 'bookinstance': req.params.id }).exec(callback)
      }
    },function(err, results) {
      if (err) { return next(err); }
      if (results.bookinstance==null) { // No results.
          res.redirect('/catalog/bookinstances');
      }
      // Successful, so render.
      res.render('bookinstance_delete', { title: '删除副本', bookinstance: results.bookinstance, bookinstance_books: results.bookinstance_books } );
    });
  }
exports.bookinstance_delete_post = function(req, res, next) {

    async.parallel({
        bookinstance: function(callback) {
          BookInstance.findById(req.body.bookinstanceid).exec(callback)
        },
        bookinstance_books: function(callback) {
          Book.find({ 'bookinstance': req.body.bookinstanceid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.bookinstance_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('bookinstance_delete', { title: '删除副本', bookinstance: results.bookinstance, bookinstance_books: results.bookinstance_books } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookinstance(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/bookinstances')
            })
        }
    });
};
// 改
exports.bookinstance_update_get = (req,res) => {res.send("未实现:藏书副本更新 get");};
exports.bookinstance_update_post = (req,res) => {res.send("未实现:藏书副本更新 post");};
// 查
// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
    BookInstance.find()
        .populate('book')
        .exec(function (err, list_bookinstances) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('bookinstance_list', { title: '所有副本', bookinstance_list: list_bookinstances });
        });
};
exports.bookinstance_detail = function(req,res,next) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, bookinstance) {
            if (err) { return next(err); }
            if (bookinstance==null) { // No results.
                var err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render('bookinstance_detail', { title: '藏书:', bookinstance:  bookinstance});
        })
};
