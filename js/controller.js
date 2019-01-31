'use strict';

class Controller {
    constructor(timeDisplay, intervalForm, intervalContainer){
        // timer setup
        this.timeDisplay = document.getElementById(timeDisplay);
        this.timer = new Timer();
        this.startStopBtn = document.getElementById('startStopBtn');
        this.startStopBtn.addEventListener('click', () => this.startTimer())
        window.addEventListener('tick', (evt) => this.timerTick(evt));
        this.resetBtn = document.getElementById('resetBtn');
        this.resetBtn.addEventListener('click', () => this.reset());
        this.audio = null; // sound when timer ends

        // interval list (doubly linked list)
        this.intervals = new DoublyLinkedList();
        this.currentInterval = null;

        // info display
        this.infoElement = document.getElementById('info');

        // form setup for adding intervals
        this.form = document.getElementById(intervalForm);
        this.intervalContainer = document.getElementById(intervalContainer);
        this.form.addEventListener('submit', (evt) => this.newIntervalSubmit(evt));
        document.getElementById('clearBtn').addEventListener('click', () => this.clear());
        document.getElementById('repeatBtn').addEventListener('click', () => this.repeatClick());
        this.repeat = false;

        // cards setup
        document.getElementById('cardsBtn').addEventListener('click', () => this.cards());
    }

    // capture submit event
    newIntervalSubmit(evt){
        evt.preventDefault();
        var obj = {};

        // create object with key/value pairs from form elements
        for(let key of Object.keys(this.form.elements)){
            let elem = this.form[key];
            if(elem.name !== ''){
                obj[elem.name] = isNaN(elem.valueAsNumber) ? elem.value : elem.valueAsNumber;
            }
        }

        this.addInterval(obj);
        this.form.reset();
    }

    // reset click event, reset timer and intervals
    reset(){
        this.currentInterval = this.intervals.head;
        this.timer.remaining = this.currentInterval.secs;
        this.displayTime(this.currentInterval.secs);
        this.displayInfo();
        if(this.timer.paused === false){
            this.startStopBtn.click();
        }
    }

    // add new element to intervals
    addInterval(obj){
        // add to interval linked list
        let node = new TimerNode(obj);
        this.intervals.push(node);

        // add text to container
        let elem = document.createElement('div');
        elem.innerHTML = obj['exercise'];
        this.intervalContainer.appendChild(elem);

        if(this.currentInterval === null){
            this.currentInterval = node;
            this.displayTime(this.currentInterval.secs);
            this.displayInfo();
        }
    }

    startTimer(evt){
        if(this.timer.remaining <= 0){
            this.timer.remaining = this.currentInterval.secs;
            this.displayInfo();
        }

        if(this.timer.paused === true){
            this.startStopBtn.innerHTML = 'STOP';
        } else {
            this.startStopBtn.innerHTML = 'START';
        }

        this.timer.startStop();
    }

    // callback from timer on each tick (second)
    timerTick(evt){
        let remaining = evt.detail;
        this.displayTime(remaining);

        if(remaining <= 0){
            // end of timer, no repeat
            if(this.repeat == false && this.currentInterval == this.intervals.tail){
                return;
            }

            this.playSound();
            setTimeout(() => { // delay for 2 seconds before moving on
                this.currentInterval = this.currentInterval.next;
                this.displayTime(this.currentInterval.secs);
                this.startTimer();
            }, 2000);
        }
    }

    displayTime(remaining = 0){
        let mins = Math.floor(remaining / 60);
        let secs = remaining % 60;

        mins = mins < 10 ? '0' + mins.toString() : mins.toString();
        secs = secs < 10 ? '0' + secs.toString() : secs.toString();

        let time = `${mins}:${secs}`;
        this.timeDisplay.innerHTML = time;
    }

    displayInfo(){
        if(this.currentInterval !== null){
            let msg = `${this.currentInterval['reps']} ${this.currentInterval['exercise']}`;
            this.infoElement.innerHTML = msg;
        }
    }

    // set audio track for when timer elapses
    setAudio(element){
        this.audio = element;
    }

    playSound(){
        this.audio.play()
        setTimeout(() => {
            this.audio.pause();
            this.audio.currentTime = 0;
        }, 1000);
    }

    clear(){
        this.intervals = new DoublyLinkedList();
        this.currentInterval = null;
        this.displayTime();
        this.displayInfo();
        this.intervalContainer.innerHTML = '';
        this.infoElement.innerHTML = '';
    }

    repeatClick(){
        this.repeat = !this.repeat;
        let repeatIcon = document.getElementById('repeatBtn');
        repeatIcon.classList.toggle('fa-redo-alt');
        repeatIcon.classList.toggle('fa-minus-circle');
    }

    cards(){
        let deck = new Deck();
        for(let card of deck.drawAll()){
            this.addInterval({'secs': 3, 'mins': 0, 'reps': `${card[0]} of`, 'exercise': card[1]});
        }
    }
}