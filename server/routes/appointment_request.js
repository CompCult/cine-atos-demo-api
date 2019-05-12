var express = require('express');
var router = express.Router();

var { User } = require('../models/user.js');
var Appointment = require('../models/appointment.js');
var AppointmentRequest = require('../models/appointment_request.js');

//Index
router.get('/', function(req, res) {
  AppointmentRequest.find({}, function(err, requests) {
    if (err) {
      res.status(400).send(err);
    } else {
      let promises;

      try {
        promises = requests.map(inject_appointment);
      } catch (err) {
        res.status(400).send(err); 
      }

      Promise.all(promises).then(function(results) {
          res.status(200).json(results.map(result => {
            const messages = {
              'Aprovado': 'Esse pedido já foi aprovado',
              'Rejeitado': 'Esse pedido já foi rejeitado',
              'Pendente': 'Pedido de participação pendente'
            };

            return { ...result, message: messages[result.status] };
        }));
      });
    }
  });
});

var inject_appointment = async function(request) {
  let string = JSON.stringify(request);
  let request_complete = JSON.parse(string);

  let user_obj = await User.findById(request._user).exec();
  let appointment_obj = await Appointment.findById(request._appointment).exec();

  request_complete._user = user_obj;
  request_complete._appointment = appointment_obj;

  return request_complete;
}

//Show
router.get('/:request_id', function(req, res) {
  AppointmentRequest.findById(req.params.request_id, function(err, request) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(request);
    }
  });
});

//Find by params
router.get('/query/fields', function(req, res) {
  AppointmentRequest.find(req.query, function(err, event) {
    if (err) {
      res.status(400).send(err);
    } else if (!event){
      res.status(404).send("Evento não encontrado");
    } else {
      let promises;

      try {
        promises = event.map(inject_appointment);
      } catch (err) {
        res.status(400).send(err); 
      }

      Promise.all(promises).then(function(results) {
          res.status(200).json(results);
      });
    }
  });
});

//Create
router.post('/', function(req, res) {
  var request           = new AppointmentRequest();
  request._user         = req.body._user;
  request._appointment  = req.body._appointment;
  request.status        = req.body.status;
  request.message       = req.body.message;
  request.updated_at    = new Date();

  request.save(function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(request);
    }
  });
});

// Update
router.put('/:request_id', function(req, res) {
  AppointmentRequest.findById(req.params.request_id, function(err, request) {
    if (req.body._appointment) request._appointment = req.body._appointment;
    if (req.body.status) {
      request.status     = req.body.status;
      console.log(request);
      request.updated_at = new Date();
    }
    if (req.body.message) request.message = req.body.message;

    request.save(function(err) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(request);
      }
    });
  });
});

// Delete
router.delete('/:request_id', function(req, res) {
  AppointmentRequest.remove({ _id: req.params.request_id }, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send("Compromisso removido.");
    }
  });
});

module.exports = router;
