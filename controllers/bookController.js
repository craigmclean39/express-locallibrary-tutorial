const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.index = (req, res) => {
  async.parallel(
    {
      book_count: (cb) => {
        Book.countDocuments({}, cb);
      },
      book_instance_count: (cb) => {
        BookInstance.countDocuments({}, cb);
      },
      book_instance_available_count: (cb) => {
        BookInstance.countDocuments({ status: 'Available' }, cb);
      },
      author_count: (cb) => {
        Author.countDocuments({}, cb);
      },
      genre_count: (cb) => {
        Genre.countDocuments({}, cb);
      },
    },
    (err, results) => {
      console.log(results);
      res.render('index', {
        title: 'Local Library Home',
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all books.
exports.book_list = function (req, res) {
  Book.find({}, 'title author')
    .sort({ title: 1 })
    .populate('author')
    .exec((err, list_books) => {
      if (err) {
        return next(err);
      }

      console.log(list_books);

      res.render('book_list', { title: 'Book List', book_list: list_books });
    });
};

// Display detail page for a specific book.
exports.book_detail = function (req, res, next) {
  async.parallel(
    {
      book: (cb) => {
        Book.findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(cb);
      },
      book_instance: (cb) => {
        BookInstance.find({ book: req.params.id }).exec(cb);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.book == null) {
        let error = new Error('Book not found');
        error.status = 404;
        return next(error);
      }

      res.render('book_detail', {
        title: results.book.title,
        book: results.book,
        book_instances: results.book_instance,
      });
    }
  );
};

// Display book create form on GET.
exports.book_create_get = function (req, res) {
  //Get all the authors and all the genres
  async.parallel(
    {
      authors: (callback) => {
        Author.find(callback);
      },
      genres: (callback) => {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      res.render('book_form', {
        title: 'Create Book',
        authors: results.authors,
        genres: results.genres,
      });
    }
  );
};

// Handle book create on POST.
exports.book_create_post = [
  //convert the genre into an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }

    next();
  },

  //Validate
  body('title', 'Title must not be empty').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('summary', 'Summary must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),

  //Process and add to DB
  (req, res, next) => {
    const errors = validationResult(req);

    let book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          authors: (callback) => {
            Author.find(callback);
          },
          genres: (callback) => {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = 'true';
            }
          }

          console.log('---');
          console.log(book);
          console.log('---');

          res.render('book_form', {
            title: 'Create Book',
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      book.save((err) => {
        if (err) {
          return next(err);
        }

        res.redirect(book.url);
      });
    }
  },
];

// Display book delete form on GET.
exports.book_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update POST');
};
