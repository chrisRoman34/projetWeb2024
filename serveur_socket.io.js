const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = new require("socket.io")(server);
server.listen(8888, () => {console.log('Le serveur écoute sur le port 8888');});
const nbjoueurMax = 2;
const listJoueurs=[];
var tour=0;
var num1;
var num2;
var numJoueur;
var position;

app.get('/', (request, response) => {
    response.sendFile('client_socket.io.html', {root: __dirname});
});

function generateRandomNumber() {
    return Math.floor(Math.random() * 1000) + 1;
}

function creerPartie() {
    num1= generateRandomNumber();
    num2= 1000+generateRandomNumber();
    
    console.log('creerpartie',num1,num2);
}

io.on('connection', (socket) => {
    socket.on('entree', data => {
        console.log(data + " veut entrer");
        if (listJoueurs.length >= nbjoueurMax) {
            console.log('trop de joueurs dans la partie!');
        } else {
            if (listJoueurs.length ==0 ){
                creerPartie();
                socket.emit('numJoueur', num1);
                console.log('premier arrivant');
            }
            else{
                socket.emit('numJoueur', num2);
                console.log('deuxieme arrivant');
            }
            listJoueurs.push(data);
            console.log(listJoueurs);
            io.emit('listJoueurs', listJoueurs);
        }
    });

    socket.on('sortie', data => {
        io.emit('reinitialiserTablier');
        console.log('sortie de',data[0],'joueur',data[1]);
        for (let i = 0; i < listJoueurs.length; i++) {
            if (data[0] == listJoueurs[i]) {
                listJoueurs.splice(i, 1);
                if(data[1]==num1){
                    creerPartie();
                    io.emit('numJoueur',num1);
                }
                break;
            }
        }
        io.emit('listJoueurs', listJoueurs);
    });

    socket.on('selectionHexagone', data => {
        console.log('selection hex',data[0],'par',data[1]);
        position = data[0];
        numJoueur = data[1];
        if (numJoueur==num1){
            console.log('pass1',tour % 2 == 1 - 1);
            if (tour % 2 == 1 - 1) {
                io.emit('ajoue', [position, 1]);
                tour += 1;
            }
        }
        else if(numJoueur==num2){
            console.log('pass2',tour % 2 == 1 - 1);
            if (tour % 2 == 2 - 1) {
                io.emit('ajoue', [position, 2]);
                tour += 1;
            }
        }
    });
    socket.on('message', data => {
        io.emit('message', data);
    });

});
