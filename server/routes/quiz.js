var express = require('express');
var router = express.Router();

const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
var Quiz = require('../models/quiz.js');
var QuizAnswer = require('../models/quiz_answer.js');

//Index
router.get('/', function(req, res) {
  Quiz.find({}, function(err, quizzes) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(quizzes);
    }
  });
});

//public?user_id
router.get('/public', function(req, res) {
  Quiz.find({ is_public: true }, async function(err, quizzes) {
    if (err) {
      res.status(400).send(err);
    } else {
      var result = []
      let date = new Date();

      for (var i = 0; i < quizzes.length; i++) {
        let quiz = quizzes[i];
        let end_time = new Date(quiz.end_time);
        end_time.setHours(23, 59, 0);
        let in_time = end_time.getTime() >= date.getTime();

        if (quiz.single_answer) {
          await wasQuizAnswered(quiz._id, req.query.user_id).then((answered) => {
            if (!answered && in_time) {
              result.push(quiz);
            }
          });
        } else if (!quiz.single_answer && in_time){
          result.push(quiz);
        }
      }
    }

    res.status(200).send(result);
  });
});

//private?user_id&secret_code
router.get('/private', function(req, res) {
  Quiz.findOne({ secret_code: req.query.secret_code }, async function(err, quiz) {
    if (err) {
      res.status(400).send(err);
    } else if (!quiz) {
      res.status(404).send('Quiz não encontrado');
    } else {
      let end_time = new Date(quiz.end_time);
      end_time.setHours(23, 59, 0);
      let date = new Date();
      let answered;

      try {
        answered = await wasQuizAnswered(quiz._id, req.query.user_id);
      } catch (err) {
        res.status(400).send(err);
      }

      if (end_time < date) {
        res.status(401).send('Quiz expirado');
      } else if (quiz.single_answer && answered) {
        res.status(401).send('Quiz já foi respondido');
      } else {
        res.status(200).json(quiz);
      }
    }
  });
});

var wasQuizAnswered = async function(quiz, user) {
  answers = await QuizAnswer.find({ _quiz: quiz, _user: user }).exec();
  return answers.length > 0;
}

//Find by params
router.get('/query/fields', function(req, res) {
  Quiz.find(req.query, function(err,quiz) {
    if (err) {
      res.status(400).send(err);
    } else if (!quiz){
      res.status(404).send("Quiz não encontrado");
    } else {
      res.status(200).json(quiz);
    }
  });
});

//Create
router.post('/', [auth, isAdmin], function(req, res) {
  var quiz             = new Quiz();
  quiz.title           = req.body.title;
  quiz._user           = req.body._user;
  quiz.description     = req.body.description;
  quiz.points          = req.body.points;
  quiz.secret_code     = generateSecretCode();
  quiz.is_public       = req.body.is_public;
  quiz.single_answer   = req.body.single_answer;
  quiz.alternative_a   = req.body.alternative_a;
  quiz.alternative_b   = req.body.alternative_b;
  quiz.correct_answer  = req.body.correct_answer;
  quiz.bookmarks       = req.body.bookmarks;

  let start_time = new Date(req.body.start_time);
  let end_time = new Date(req.body.end_time);
  start_time.setHours(23, 59, 0);
  end_time.setHours(23, 59, 0);
  quiz.start_time      = start_time;
  quiz.end_time        = end_time;

  if(req.body.alternative_c) quiz.alternative_c   = req.body.alternative_c;
  if(req.body.alternative_d) quiz.alternative_d   = req.body.alternative_d;
  if(req.body.alternative_e) quiz.alternative_e   = req.body.alternative_e;

  quiz.save(function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(quiz.secret_code);
    }
  });
});

// Update
router.put('/:quiz_id', [auth, isAdmin], function(req, res) {
  Quiz.findById(req.params.quiz_id, function(err, quiz) {
    if(req.body.title) quiz.title                   = req.body.title;
    if(req.body.description) quiz.description       = req.body.description;
    if(req.body.points) quiz.points                 = req.body.points;
    if(req.body.is_public !== undefined) quiz.is_public           = req.body.is_public;
    if(req.body.single_answer !== undefined) quiz.single_answer   = req.body.single_answer;
    if(req.body.alternative_a) quiz.alternative_a   = req.body.alternative_a;
    if(req.body.alternative_b) quiz.alternative_b   = req.body.alternative_b;
    if(req.body.correct_answer) quiz.correct_answer = req.body.correct_answer;
    if(req.body.start_time) {
      start_time = new Date(req.body.start_time);
      start_time.setHours(23, 59, 0);
      quiz.start_time = start_time;
    }
    if(req.body.end_time) {
      end_time = new Date(req.body.end_time);
      end_time.setHours(23, 59, 0);
      quiz.end_time = end_time;
    }
    if(req.body.alternative_c) quiz.alternative_c   = req.body.alternative_c;
    if(req.body.alternative_d) quiz.alternative_d   = req.body.alternative_d;
    if(req.body.alternative_e) quiz.alternative_e   = req.body.alternative_e;
    
    quiz.save(function(err) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(quiz);
      }
    });
  });
});

// Delete
router.delete('/:quiz_id', [auth, isAdmin], function(req, res) {
  Quiz.remove({ _id: req.params.quiz_id }, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send("Quiz removido.");
    }
  });
});

//Show
router.get('/:quiz_id', function(req, res) {
  Quiz.find({ _id: req.params.quiz_id }, function(err, quiz) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(quiz);
    }
  });
});

generateSecretCode = function() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

module.exports = router;
