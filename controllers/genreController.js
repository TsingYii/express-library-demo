const Genre = require('../models/genre')
var Book = require('../models/book');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
const genre = require('../models/genre');

// 增
exports.genre_create_get = function(req, res, next) {       
    res.render('genre_form', { title: '创建种类' });
};
exports.genre_create_post = [
   
    // Validate that the name field is not empty.
    body('name', '种类不能为空').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        var genre = new Genre(
          { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Genre.findOne({ 'name': req.body.name })
                .exec( function(err, found_genre) {
                     if (err) { return next(err); }

                     if (found_genre) {
                         // Genre exists, redirect to its detail page.
                         res.redirect(found_genre.url);
                     }
                     else {

                         genre.save(function (err) {
                           if (err) { return next(err); }
                           // Genre saved. Redirect to genre detail page.
                           res.redirect(genre.url);
                         });

                     }

                 });
        }
    }
];
// 删
exports.genre_delete_get = function(req,res,next) {
  async.parallel({
    genre: function(callback){
        Genre.findById(req.params.id).exec(callback)
    },
    genre_books: function(callback){
        Book.find({ 'genre': req.params.id }).exec(callback)
    }
  },function(err, results) {
    if (err) { return next(err); }
    if (results.genre==null) { // No results.
        res.redirect('/catalog/genres');
    }
    // Successful, so render.
    res.render('genre_delete', { title: '删除种类', genre: results.genre, genre_books: results.genre_books } );
  });
}
exports.genre_delete_post = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
          Genre.findById(req.body.genreid).exec(callback)
        },
        genres_books: function(callback) {
          Book.find({ 'genre': req.body.genreid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.genres_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('genre_delete', { title: '删除种类', genre: results.genre, genre_books: results.genres_books } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/genres')
            })
        }
    });
};
// 改
exports.genre_update_get = (req,res) => {res.send("未实现:种类更新 get");};
exports.genre_update_post = (req,res) => {res.send("未实现:种类更新 post");};
// 查
exports.genre_list = (req,res,next) => {
      Genre.find()
          .sort([['name','ascending']]).exec(function (err,list) {
          res.render('genre_list',{title:'所有种类',genre_list: list})
      })
};
exports.genre_detail = function(req,res,next){
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        },

        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
                .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            var err = new Error('没有该种类');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('genre_detail', { title: '种类详情', genre: results.genre, genre_books: results.genre_books } );
    });
};
