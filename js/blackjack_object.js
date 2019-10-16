// pcm 20172018a Blackjack object

//constante com o número máximo de pontos para blackJack
const MAX_POINTS = 21,VALOR = 1,NAIPE = 0,NUMERO_CARTAS = 52,NMERO_NAIPE = 13;

// Classe BlackJack - construtor
class BlackJack {
    constructor(startMoney) {
        // array com as cartas do dealer
        this.dealer_cards = [];
        // array com as cartas do player
        this.player_cards = [];
        // variável booleana que indica a vez do dealer jogar até ao fim
        this.dealerTurn = false;
        this.player_points = 0;

        this.playerBet = 0;
        
        this.startMoney = startMoney || 1000 ; //A thousand euros
        //If win, pays the double

        // objeto na forma literal com o estado do jogo
        this.state = {
            'gameEnded': false,
            'dealerWon': false,
            'playerBusted': false
        };


        //métodos utilizados no construtor (DEVEM SER IMPLEMENTADOS PELOS ALUNOS)

        /**
        * Função para gerar um deck de cartas novo
        * @returns {Array} Deck de cartas
        */
        this.new_deck = function () {
            let deck = [],  naipe = NMERO_NAIPE, baralho = NUMERO_CARTAS, naipe_id = 1;

            for(let i = 0; i<baralho;i++){
                let n = (i % naipe) + 1;
                var carta = [naipe_id, n];
                if(n == naipe){
                    naipe_id++;
                }
                deck.push(carta);
            }
            return deck;
        };

        /**
        * Função que ordena aleatoriamente um _deck_ de cartas
        * @param {Array}  deck - Um deck de cartas gerados 
        * @returns {Array} Deck de cartas ordenado aleatóriamente
        */
        this.shuffle = function (deck) {
            //Gerar numeros aleatorios entre [-1,0,1]
            /*
            Se valor gerado:
            - For 1: o elemento é movido para um index superior
            - For 0: o elemento é mantido na posição atual
            - For -1: O elemento é movido para um index inferior

            Se esses numeros forem gerados aleatóriamente, então a array é ordenada aleatóriamente
            */
            return deck.sort(() => Math.floor((Math.random() * 3) - 1));
        }

        // baralho de cartas baralhado
        this.deck = this.shuffle(this.new_deck());
        //this.deck = this.new_deck();
    }

    // métodos
    // devolve as cartas do dealer num novo array (splice)
    get_dealer_cards() {
        return this.dealer_cards.slice();
    }

    // devolve as cartas do player num novo array (splice)
    get_player_cards() {
        return this.player_cards.slice();
    }

    // Ativa a variável booleana "dealerTurn"

    /**
    * Setter para modificar a váriavel
    * @param {Boolean}  val - Valor a guardar
    */
    setDealerTurn (val) {
        this.dealerTurn = val;
    }

    /**
    * Função para calcular o valor das cartas
    * @param {Array}  cards - Cartas a calcular o valor
    */
    //MÉTODOS QUE DEVEM SER IMPLEMENTADOS PELOS ALUNOS
    get_cards_value(cards) {
        let valor_ases = 11;

        //Filtrar os Ases
        //Calcular a soma das cartas filtradas
        let soma_sem_ases = cards.reduce((valor_total, carta) => {
            if(carta[1] != 1){
                if(carta[1] >= 11 && carta[VALOR] <= 13)  return valor_total+=10;
                return valor_total+=carta[VALOR];
            }else{
                return valor_total+=0;
            }
        },0); //Definir o valor inicial para 0

        if(soma_sem_ases > 10) valor_ases = 1;
        
        //Calcular valores dos ases
        return cards.reduce((valor_total, carta) => {
            if(carta[VALOR] == 1) return valor_total+=valor_ases;
            return valor_total+=0;
        },soma_sem_ases); //Definir o valor inicial para a soma já calculada

    }

    dealer_move() {
        let deck = this.deck;
        let carta = deck.pop();
        this.dealer_cards.push(carta); 
        this.get_game_state()
    }

    player_move() {
        let deck = this.deck;
        let carta = deck.pop();
        this.player_cards.push(carta); 
        this.get_game_state();
    }

    get_game_state() {
        let pontuacao_dealer,pontuacao_player;
        pontuacao_dealer = this.get_cards_value(this.dealer_cards);
        pontuacao_player = this.get_cards_value(this.player_cards);
        this.player_points = pontuacao_player;
        /*if(pontuacao_dealer > pontuacao_player){
            this.state.gameEnded = true;
            this.state.dealerWon = true;
        }*/
        if(pontuacao_dealer > MAX_POINTS){
            this.state.gameEnded = true;
            this.state.dealerWon = false;
        } else if(pontuacao_player > MAX_POINTS){
            this.state.gameEnded = true;
            this.state.playerBusted = true;
        }else{
            if(this.dealerTurn){
                if( pontuacao_player > pontuacao_dealer){
                    this.state.gameEnded = true;
                    this.state.dealerWon = false;
                }else{
                    this.state.gameEnded = true;
                    this.state.dealerWon = true;
                }

              
            }
        }


        return this.state;
    }

    pay_bet(){
        var state = this.get_game_state();
        if(state.gameEnded){
            if(state.dealerWon || state.playerBusted){
                this.startMoney = this.startMoney - this.playerBet;
            }else{
                if(this.player_points == 21){
                    this.startMoney = this.startMoney + this.playerBet + (0.5 * this.playerBet)
                }else{
                    this.startMoney = this.startMoney + this.playerBet;
                }
            }
        }
       
    }
}

