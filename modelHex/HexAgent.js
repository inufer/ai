const Agent = require('ai-agents').Agent;

const Graph = require('node-dijkstra');

//  Implementamos la clase HexAgente e iniciamos el constructor el cual recibe la variable value. 

class HexAgent extends Agent {
    constructor(value) {
        super(value);
        this.size=0;
        this.board=[];
        this.check=[];
        this.raiz;

        this.expandNode=this.expandNode.bind(this)
        this.arraysEqual=this.arraysEqual.bind(this)
        this.isExplored=this.isExplored.bind(this)
        this.miniMaxPoda=this.miniMaxPoda.bind(this);
    }

    arraysEqual(arr1, arr2) {

        for(var i = arr1.length; i--;) {
            for(var j = arr1.length; j--;) {
                if(arr1[i][j] !== arr2[i][j]) return false;
            }
        }
        return true;
    }

    isExplored(board){
        for (let i = 0; i < this.check.length; i++) {
            if(this.arraysEqual(board,this.check[i].getBoard())){

                return false;            

            }
        }
        return true;
    }

    expandNode(type,father){
        var sons = []
        
        
        for (let i = 0; i < this.size; i++) {
            
            for (let j = 0; j < this.size; j++) {
                let aux = father.getBoard().map(function (arr) { return arr.slice(); });
                if(aux[i][j]===0){ 


                    if(type=="Min")aux[i][j]=this.getID();
                    else if(type=="Max"){
                        if(this.getID()=="1")aux[i][j]="2";
                        else aux[i][j]="1"
                    }
                    
                    
                    if(this.isExplored(father.getBoard())) sons.unshift(new Node(father,aux,type,father.getDepth()+1,i,j));
                   
                }
            }
        }
        return sons;
    }

    miniMaxPoda(player,alfa,beta){

        if(player.getDepth()==3){
             player.calculateHeuristic(this.getID());        
             player.informFather();
             let utility = player.getUtility();
             return utility;
        }
        let hijos=[]
        if(player.getType()=="Min")hijos=this.expandNode("Max",player);
        else hijos=this.expandNode("Min",player);
        
        if(player.getType()==="Max"){
            for (let i = 0; i < hijos.length; i++) {
                var puntuacion=this.miniMaxPoda(hijos[i],alfa,beta);
                if(puntuacion>alfa){
                    alfa=puntuacion
                }
                if(alfa>=beta){
                    return alfa;
                }
            }
            return alfa;
        }
        else{
            for (let i = 0; i < hijos.length; i++) {
                var puntuacion=this.miniMaxPoda(hijos[i],alfa,beta);
                if(puntuacion<beta){
                    beta=puntuacion
                }
                if(alfa>=beta){
                    return beta;
                }
            }
            return beta;

        }

    }

    
    /**
    * Devuelve un nuevo movimiento. El movimiento es una matriz de dos enteros, que representan el
    * Número de fila y columna del hex a jugar. Si el movimiento dado no es válido,
    * el controlador Hex realizará un movimiento válido aleatorio para el jugador
    * Ejemplo: [1, 1]
    */
    send() {
        this.board = this.perception.map(function (arr) { return arr.slice(); })
        this.size = this.board.length;

        this.raiz=new Node(null,this.board,"Max",0);


        let num=this.miniMaxPoda(this.raiz,-100,100);

        this.check=[];

        return this.raiz.getPos()
    }

}

module.exports = HexAgent;

/**
 * Devuelve una matriz que contiene la identificación del hex vacío en el tablero
 * id = row * size + col;
 * @param {Matrix} board 
 */
function getEmptyHex(board) {
    let result = [];
    let size = board.length;
    for (let k = 0; k < size; k++) {
        for (let j = 0; j < size; j++) {
            if (board[k][j] === 0) {
                result.push(k * size + j);
            }
        }
    }
    return result;
}


class Node{f
    constructor(father,state,type,depth,fila, columna){
        this.father=father;
        this.state=state;
        this.type=type;
        this.depth=depth;
        this.fila=fila;
        this.columna=columna;
        
        if(type=="Min")this.utility=Infinity;
        else this.utility=-Infinity;
        
    }


    getBoard(){
        return this.state;
    }

    getDepth(){
        return this.depth;
    }

    getType(){
        return this.type;
    }

    setUtility(value,row,column){
        
        if(this.type=="Min"){
            this.utility=Math.min(value,this.utility);
        }
        else {
            this.utility=Math.max(value,this.utility)
            
        }
        
        if(this.depth!=0){
            this.informFather();
        }
        else if(this.utility==value ){
            this.fila=row;
            this.columna=column;
        }

    }

    informFather(){
        this.father.setUtility(this.utility,this.fila,this.columna);
    }

    calculateHeuristic(player){


        let matxTrp = this.transpose(this.state);
        let optPath ;
        let plyPath = this.shortestPath(this.state,player);

        if(player==="1"){
            optPath = this.shortestPath(matxTrp,player);
            plyPath = this.shortestPath(this.state,player);
        }
        else{
            optPath = this.shortestPath(this.state,"1");
            plyPath = this.shortestPath(matxTrp,"1");
        }



        if(plyPath===null){

            this.utility = -101;
        }else if(optPath===null){

            this.utility = 101;
        }else{
            
            let oponentPath;
            let playerPath;

            if(player==="1"){
                oponentPath = this.pathLength(optPath,matxTrp,player);
                playerPath = this.pathLength(plyPath,this.state,player);
            }
            else{
                oponentPath = this.pathLength(optPath,this.state,"1");
                playerPath = this.pathLength(plyPath,matxTrp,"1");                
            }

            
			if(playerPath<=0){
				this.utility = 100;
				
			}else if(oponentPath<=0){
				this.utility = -100;
			}
            else {
  
                this.utility = oponentPath - playerPath;
  
  
			}

        }
        
    }

    pathLength(arr,board, play){
        let size = arr.length;
        let boardSz = board.length;
        let tam = 0;

        for (let i = 1; i < (size-1); i++) {         
            let key = parseInt(arr[i],10);
            let x = Math.floor(key / boardSz);
            let y = key % boardSz;

            if(board[x][y] != play){
                tam++;
            }
        }

        return tam;
    }

    getUtility(){
        return this.utility;
    }

    getPos(){
        return [this.fila,this.columna];
    }
    
    shortestPath(board,player){
        const graph = new Graph();
        let size = board.length;
        

   
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {

                let key = i*size + j;
                let neighbors = this.getNeighborhood(key,board,player);
               
                if (j === 0) { 
                    if (board[i][j]===0) {
                        neighbors['L'] = 2; 
                    }else if(board[i][j]===player){
                        neighbors['L'] = 1; 
                    }
                }
                if (j === size - 1) {
                    if (board[i][j]===0) {
                        neighbors['R'] = 2; 
                    }else if(board[i][j]===player){
                        neighbors['R'] = 1; 
                    }
                }

                graph.addNode(key+'',neighbors); 
                
            }        
        }

        let neighborsL = {};
        let neighborsR = {};
    
        for (let i = 0; i < size; i++) {
            if (board[i][0] === 0) {
                neighborsL[(i * size) + ''] = 2;
            }else if(board[i][0] === player){
                neighborsL[(i * size) + ''] = 1;
            }
            if (board[i][size - 1] === 0) {
                neighborsR[(i * size + size - 1) + ''] = 2;
            }else if(board[i][size - 1] === player){
                neighborsR[(i * size + size - 1) + ''] = 1;
            }
        }
    
        graph.addNode('L', neighborsL);
        graph.addNode('R', neighborsR)

       return graph.path('L','R');
    
    }


    getNeighborhood(key,board,player) {
        let size = board.length;
        let row = Math.floor(key / size);
        let col = key % size;
        let result = {};
        
        if(this.insertNeighbor(row-1,col)){
            let name = (row-1)*size + col;
            if(board[row-1][col]=== 0){
                result[name+'']=2;
            }else if(board[row-1][col]=== player){
                result[name+''] = 1;
            }
        }

        if(this.insertNeighbor(row-1,col+1)){
            let name = (row-1)*size + (col+1);
            if(board[row-1][col+1]=== 0){
                result[name+'']=2;
            }else if(board[row-1][col+1]=== player){
                result[name+'']= 1;
            }
        }
        
        if(this.insertNeighbor(row,col+1)){
            let name = (row)*size + (col+1);
            if(board[row][col+1]=== 0){
                result[name+'']=2;
            }else if(board[row][col+1]=== player){
                result[name+''] = 1;
            }
        }

        if(this.insertNeighbor(row+1,col)){
            let name = (row+1)*size + col;
            if(board[row+1][col]=== 0){
                result[name+'']=2;
            }else if(board[row+1][col]=== player){
                result[name+''] = 1;
            }
        }

        if(this.insertNeighbor(row+1,col-1)){
            let name = (row+1)*size + (col-1);
            if(board[row+1][col-1]=== 0){
                result[name+'']=2;
            }else if(board[row+1][col-1]=== player){
                result[name+''] = 1;
            }
        }

        if(this.insertNeighbor(row-1,col-1)){
            let name = (row-1)*size + (col-1);
            if(board[row][col-1]=== 0){
                result[name+'']=2;
            }else if(board[row][col-1]=== player){
                result[name+''] = 1;
            }
        }

        
       return result;
    }


    insertNeighbor(row,col){
        if(row >= 0 && row < this.state.length && col >= 0 && col < this.state.length){
            return true;
        }else{
            return false;
        }
    }

    transpose(board) {
        let size = board.length;
        let boardT = new Array(size);
        for (let j = 0; j < size; j++) {
            boardT[j] = new Array(size);
            for (let i = 0; i < size; i++) {
                boardT[j][i] = board[i][j];
                if (boardT[j][i] === '1') {
                    boardT[j][i] = '2';
                } else if (boardT[j][i] === '2') {
                    boardT[j][i] = '1';
                }
            }
        }
        return boardT;
    }

}
