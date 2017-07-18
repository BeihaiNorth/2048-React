import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Board from './board';



class TileView extends React.Component {
	render(){
		let classArray = ['tile'];
		classArray.push('position-'+this.props.positionR+'-'+this.props.positionC);
		classArray.push('tile-'+this.props.value);
		let classnames = classArray.join(' ');
		return (
			<div className={classnames}>
				<p>{this.props.value}</p>
			</div>
		);
	}
} 

class ScoreView extends React.Component {
	render(){
		return(
			<div className='score'>
				<div><h2>BEST</h2><h1>{this.props.bestscore}</h1></div>
				<div><h2>SCORE</h2><h1>{this.props.score}</h1></div>
			</div>
		 );
	}
}


class BoardView extends React.Component {
	constructor(props){
		super(props);
		this.state = {board: new Board(),
					  bestscore: 0};
	}
	restartGame(){
		this.setState({board: new Board()});
	}

	handleKeyDown(event){
		 if(this.state.board.hasLost){
			return;
		}
		//37left 38up 39right 40down
		if(event.keyCode >= 37 && event.keyCode <= 40){
			event.preventDefault();
			let direction = event.keyCode - 37;
			this.setState({board: this.state.board.move(direction)});
		}
	}
	componentDidMount(){
		window.addEventListener('keydown', this.handleKeyDown.bind(this));
	}
	componentWillUnmount(){
		window.removeEventListener('keydown', this.handleKeyDown.bind(this));
	}
	render(){
		let tiles = this.state.board.tiles
					.filter(tile => tile.value !==0)
					.map(tile => <TileView value={tile.value} key={tile.id} positionR={tile.row} positionC={tile.column} />);
		if(this.state.board.score > this.state.bestscore){
			this.setState({bestscore: this.state.board.score});
		}
		return(
			<div className='game'>
				<ScoreView score={this.state.board.score} bestscore={this.state.bestscore}/>
				<button className='restartBtn' type='button' onClick={this.restartGame.bind(this)}>Restart</button>
				<div className='logo'><h1>2048</h1></div>
				<p>Use the <b>arrow keys</b> to move the tiles and get a <b>2048</b>!</p>
				<div className='game-board'>
					<div className='board-row'>
						<div className='cell'></div>
						<div className='cell'></div>
						<div className='cell'></div>
						<div className='cell'></div>
					</div>
					<div className='board-row'>
						<div className='cell'></div>
						<div className='cell'></div>
						<div className='cell'></div>
						<div className='cell'></div>
					</div> 
					<div className='board-row'>
						<div className='cell'></div>
						<div className='cell'></div>
						<div className='cell'></div>
						<div className='cell'></div>
					</div>
					<div className='board-row'>
						<div className='cell'></div>
						<div className='cell'></div>
						<div className='cell'></div>
						<div className='cell'></div>
					</div>
					{tiles}
					<Restart board={this.state.board} onClick={this.restartGame.bind(this)} />
				</div>
			</div>
		);
	}
}

function Restart(props) {
	if(props.board.hasLost){
		return(
			<div className='lost'>
				<h3>Game Over!</h3>
				<p>Score {props.board.score}</p>
				<button type='button' className='tryagainBtn' onClick={props.onClick}>Try Again</button>
			</div>
		);
	} else {
		return null;
	}
}

class Game extends React.Component {
	render(){
		return(
			<div>
				<BoardView />
				<footer>
					<p>Created by <b><i>Liujun Xue</i></b></p>
					<p>Source code: <i>git clone https://github.com/BeihaiNorth/2048-React.git</i></p>
				</footer>
			</div>
		);
	}
}


ReactDOM.render(
	<Game />,
	document.getElementById('root')
);