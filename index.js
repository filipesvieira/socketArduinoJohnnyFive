// COM ESTE CÓDIGO É POSSÍVEL FAZER LEDS LIGAREM E DESLIGAREM, PISCAR E PARAR DE PISCAR ... DE QUEBRA TAMBÉM TEM UMA VALIDAÇÃO UTILIZANDO 'PHOTORESISTOR'
// COM ESTE CARINHA VOCÊ CAPTA INTENSIDADE DE LUZ DO AMBIENTE, E ASSIM É POSSÍVEL LIGAR OS LEDS QUANDO ESTÃO COM BAIXA INTENSIDADE

// DESDE JÁ VALEU PELO DOWNLOAD DO PROJETO, EM BREVE POSTAREI MAIS COISAS ....
// ME SEGUE LÁ NO INSTAGRAM: ( https://www.instagram.com/c.hakra )

// MUITA PAZ, FIQUE COM DEUS, POIS ELE É AMOR, E COM AMOR VAMOS LONGE !!!!!!

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var five = require('johnny-five'),
 board, photoresistor;
var serialport = require("serialport");
serialport.list(function(err, ports) {
    console.log(ports);
});
var board = new five.Board({
	port: "COM4"
});
board.on('ready', function() {
	leds = new five.Leds([2, 3, 7]);

	photoresistor = new five.Sensor({
		pin: "A2",
		freq: 100
	});

  board.repl.inject({
    pot: photoresistor
  });

  photoresistor.on("data", function() {
  	valorPhotoresistor = this.value;
  	if (valorPhotoresistor > 1000) {
  		leds.on();
  	} else {
  		leds.off();
  	}
  });

});
board.on("error", function(err) {
	console.log('ERROR');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
var isPiscando = false;
var isAceso = false;
  socket.on('onOff', function(valor) {
	if (isPiscando == true) {
		leds.stop();
		isPiscando = false;
	}
	if (valor == 1 && isAceso == false) {
		isAceso = true;
		leds.on();
		io.emit('onOff', valor);
	} else if(valor == 0) {
		isAceso = false;
		leds.off();
		return false;
	}
    io.emit('onOff', valor);
  });

  socket.on('piscaLeds', function(valor) {
	if (isAceso == true) {
		leds.stop();
		leds.off();
		isAceso = false;
	}
	if (valor == 1  && isPiscando == false) {
		isPiscando = true;
		leds.blink(100);
		io.emit('piscaLeds', valor);
	} else if(valor == 0) {
		isPiscando = false;
		leds.stop();
		leds.off();
	}
    io.emit('piscaLeds', valor);
  });
});

http.listen(port, function(){
  console.log('Server on *:' + port);
});
