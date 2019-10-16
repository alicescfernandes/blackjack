(function(){ //Don't pollute the global scope!

    let game = null;
    let gameState = 0;
    const AWAITING_BET = 1, NEW_GAME = 0, GAME_END = 2,GAME_START = 4;

    const noobMode = true;

    const naipeMapping = {
        1:"club",
        2:"heart",
        3:"diamond",
        4:"spades"
    }

    const cardMapping = {
        1:"ace",
        2:"2",
        3:"3",
        4:"4",
        5:"5",
        6:"6",
        7:"7",
        8:"8",
        9:"9",
        10:"10",
        11:"j",
        12:"q",
        13:"k"
    }

    //Mutadores para ficar mais fácil manipular a dom
    var data = {
        get player_bet() {
            return game.playerBet;
        },
        set player_bet(value) {
            game.playerBet = value;
            document.querySelector("#bet-value").innerText = "Bet Value: " + game.playerBet;
        },

        get start_money() {
            return game.startMoney;
        },
        set start_money(value) {
            game.startMoney = value;
            document.querySelector("#start-value").innerText = "Start Money:" + game.startMoney;
        },

        set game_state(value){
            gameState = value;
            update_buttons();
        },

        get game_state(){
            return gameState;
        }
    }

    var dom = {
        chipNpdes:document.getElementById("bet-chips"),
        modal:document.querySelector(".game-modal"),
        buttons:{
            card:document.getElementById("card"),
            stand: document.getElementById("stand"),
            new_game:document.getElementById("new_game"),
            bet:document.getElementById("bet"),

        }
    };
    
    function removeChip(e){  
        let data = JSON.parse(e.dataTransfer.getData("text"));
        if(data.action == "remove"){
            let element = document.getElementById(data.id);
            element.remove();
            check_available_chips();
        }
    }

    function toggleModal(string){
        var modal =  dom.modal;
        if(modal.classList.contains("game-modal-show")){
            modal.classList.remove("game-modal-show");
        }else{
            modal.classList.add("game-modal-show");
        }

        modal.querySelector("h1").innerText = string;
    }

    //NOT IN USE
    function debug(an_object) {
        //document.getElementById("debug").innerHTML += JSON.stringify(an_object) + "<br>"
    }

    //NOT IN USE
    function test(val, actual_value) {
        //console.log(val, actual_value, val == actual_value);
    }

    function update_buttons(){
        console.trace(gameState)
        switch(gameState){
            case AWAITING_BET:
                    dom.buttons.card.disabled = true;
                    dom.buttons.stand.disabled = true;
                    dom.buttons.new_game.disabled = true;
                    dom.buttons.bet.disabled = false;
                break;
            case GAME_START:
                    dom.buttons.card.disabled = false;
                    dom.buttons.stand.disabled = false;
                    dom.buttons.new_game.disabled = true;
                    dom.buttons.bet.disabled = true;
                    
                break;
            case GAME_END:
                    dom.buttons.card.disabled = true;
                    dom.buttons.stand.disabled = true;
                    dom.buttons.new_game.disabled = false;
                    document.querySelector("#start-value").innerText = "Start Money:" + game.startMoney;
                break;
        }
    }

    function drag(e) {
        var data = {
            "id":e.currentTarget.id,
            "action":"add"
        };
        e.dataTransfer.setData("text",JSON.stringify(data));
    }

    function dragFromBet(e) {
        var data = {
            "id":e.currentTarget.id,
            "action":"remove"
        }
        e.dataTransfer.setData("text",JSON.stringify(data));
    }

    function drop(e) {
        e.preventDefault();
        let receivedData =  JSON.parse(e.dataTransfer.getData("text"));
        let element = document.getElementById( receivedData.id);
        let clone = element.cloneNode(true);
        clone.id = "user-" + clone.id + "-"+ (new Date()).getTime();
        clone.addEventListener("dragstart", dragFromBet);
        e.currentTarget.querySelector("p").style.display = "none";
        dom.chipNpdes.appendChild(clone);
        simplifyChips(e);
        check_available_chips();
    }

    function allowDrop(ev) {
        ev.preventDefault();
    }

    //Count the value present in the HTML
    function countValue() {
        let chips = Array.prototype.slice.call(dom.chipNpdes.getElementsByClassName("chip"));
        if(chips.length == 0) return 0;
        let value = chips.map(chip => parseInt(chip.dataset.value)).reduce((total,valor) => total+=valor)
        return value;
    }

    //Replace Chips for more simple chips
    function simplifyChips(e) {
        // if i have 5 chips of 1, then is equivalent of having 1 chip of 5;
        let chips = Array.prototype.slice.call(dom.chipNpdes.getElementsByClassName("chip-1"));
        if (chips.length === 5) {
            chips.forEach((chip) => {
                chip.remove();
            })
            var element = document.getElementById("chip-5");
            var clone = element.cloneNode(true);
            dom.chipNpdes.appendChild(clone);
        }

        // if i have 5 chips of 5, then is equivalent of having 1 chip of 25;
        chips = Array.prototype.slice.call(dom.chipNpdes.getElementsByClassName("chip-5"));
        if (chips.length === 5) {
            chips.forEach((chip) => {
                chip.remove();
            })
            var element = document.getElementById("chip-25");
            var clone = element.cloneNode(true);
            dom.chipNpdes.appendChild(clone);
        }

        // if i have 2 chips of 25, then is equivalent of having 1 chip of 50;
        chips = Array.prototype.slice.call(dom.chipNpdes.getElementsByClassName("chip-25"));
        if (chips.length === 2) {
            chips.forEach((chip) => {
                chip.remove();
            })
            var element = document.getElementById("chip-50");
            var clone = element.cloneNode(true);
            dom.chipNpdes.appendChild(clone);
        }

        // if i have 2 chips of 50, then is equivalent of having 1 chip of 100;
        chips = Array.prototype.slice.call(dom.chipNpdes.getElementsByClassName("chip-50"));
        if (chips.length === 2) {
            chips.forEach((chip) => {
                chip.remove();
            })
            var element = document.getElementById("chip-100");
            var clone = element.cloneNode(true);
            dom.chipNpdes.appendChild(clone);
        }

    }

    function player_place_bet(){
        data.game_state = GAME_START;
        start_game();
    }

    //Check the winner
    function check_winner(state){
        let string = "";
        if (state.gameEnded) {
            let cards = game.player_cards;

            if (state.playerBusted) {
                string += "Jogador passou dos 21. Cartas:" + cards;
            } else {
                if (state.dealerWon) {
                    string += "Dealer ganhou. Cartas:" + cards;
                } else {
                    string += "Jogador ganhou. Cartas:" + cards;
                }
            }
            game.pay_bet();
            data.game_state = GAME_END;
            toggleModal(string);
        }
    }

    //Update the visual, to hide chips that can't be used
    function check_available_chips() {
        var bet_value = countValue();

        if(bet_value > 0){
            dom.buttons.bet.disabled = false;
        }else{
            dom.buttons.bet.disabled = true;

            document.getElementById("bet-area").querySelector("p").style.display = "inline-block"
        }

        let chips = Array.prototype.slice.call(document.querySelectorAll(".rules .chip"));

        //Disable individual inputs
        if (game.startMoney - bet_value < 100) {
            document.querySelector(".chip[data-value='100']").style.display = "none";
        } else {
            document.querySelector(".chip[data-value='100']").style.display = "inline-block";
        }

        if (game.startMoney - bet_value < 50) {
            document.querySelector(".chip[data-value='50']").style.display = "none";
        } else {
            document.querySelector(".chip[data-value='50']").style.display = "inline-block";
        }

        if (game.startMoney - bet_value < 25) {
            document.querySelector(".chip[data-value='25']").style.display = "none";
        } else {
            document.querySelector(".chip[data-value='25']").style.display = "inline-block";
        }

        if (game.startMoney - bet_value < 5) {
            document.querySelector(".chip[data-value='5']").style.display = "none";
        } else {
            document.querySelector(".chip[data-value='5']").style.display = "inline-block";
        }

        //Disable all if bet > startMoney
        if (bet_value >= game.startMoney) {
            bet_value = game.startMoney;
            chips.forEach(element => {
                element.display = "none";
            });
        }

        data.player_bet = bet_value;
    }

    function addEvents(){
        document.getElementById("bet-area").addEventListener("dragover",allowDrop);
        document.getElementById("bet-area").addEventListener("drop",drop );
        dom.buttons.bet.addEventListener("click",player_place_bet);
        dom.buttons.stand.addEventListener("click",dealer_finish);
        dom.buttons.card.addEventListener("click",player_new_card);
        dom.buttons.new_game.addEventListener("click",create_game);
        document.documentElement.addEventListener("dragover",allowDrop);
        document.documentElement.addEventListener("drop",removeChip );


        let chips = Array.prototype.slice.call(document.querySelectorAll(".rules .chip"));
        chips.forEach(function(chip){
            chip.addEventListener("dragstart",drag);
        })

    }


    //FUNÇÕES QUE DEVEM SER IMPLEMENTADOS PELOS ALUNOS
    function new_game() {
        if(game){
            var old_value = game.startMoney;
            game = new BlackJack(old_value);
            toggleModal("")
        
        }else{
            game = new BlackJack();
        }

        document.querySelector("#bet-area p").style.display = "block";
        document.getElementById("debug").innerHTML = ""
        document.querySelector(".spot-cards").innerHTML = "";
        document.querySelector(".dealer-cards").innerHTML = "";
        document.querySelector("#start-value").innerText = "Start Money:" + game.startMoney;
        data.player_bet = 0;
        document.getElementById("hand-value").innerHTML = "Hand Value: " + 0;
        dom.chipNpdes.innerHTML = "";
        
    }
    function start_game() {
        game.dealer_move();    
        update_dealer();
        
        var cards = document.querySelector(".dealer-cards").innerHTML;
        document.querySelector(".dealer-cards").innerHTML = cards + `<img class="game-card" src="assets/svg/back_card.svg">`
        
        game.dealer_move();

    }

    function update_dealer(state) {
        var state = game.get_game_state();

        check_winner(state);
        
        let cardsHTML = game.dealer_cards.map((card) => {
            let cardString = naipeMapping[card[NAIPE]]  + "_" + cardMapping[card[VALOR]] + ".svg";
            cardString  = `<img class="game-card" src="assets/svg/${cardString}">`; 
            return cardString;
        });
        
        document.querySelector(".dealer-cards").innerHTML = cardsHTML.join();

    }

    function update_player(state) {
        var state = game.get_game_state();
        
        check_winner(state)

        var cartsHTML = game.player_cards.map((card) => {
            let cardString = naipeMapping[card[NAIPE]]  + "_" + cardMapping[card[VALOR]] + ".svg";
            cardString  = `<img class="game-card" src="assets/svg/${cardString}">`; 
            return cardString;
        });
        
        document.getElementById("hand-value").innerHTML = "Hand Value: " + game.player_points;
        document.querySelector(".spot-active .spot-cards").innerHTML = cartsHTML.join();
    }
    function create_game(){

        data.game_state = AWAITING_BET;
        new_game();
    }

    function dealer_new_card() {
        game.dealer_move();
        update_dealer();
        return game.get_game_state();
    }

    function player_new_card() {
        game.player_move();
        update_player();
        return game.get_game_state();
    }

    function dealer_finish() {
        game.dealerTurn = true;
        dealer_new_card();
        game.dealerTurn = false;
    }

    addEvents();
    new_game();
})()