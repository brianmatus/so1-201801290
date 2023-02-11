import React, {useState} from 'react';
import './App.css';


let main_logs:any[] = [
	// {"left": "2", "right": "2", "operation": "+", "result": "5"}
]

const Square = (props:any) => {
	return <button className={["square", props.isOrange? "orange" : "simple"].join(" ")} onClick={props.onClick}>
		{props.value}
	</button>

};


class Board extends React.Component<any, any> {
	constructor(props:any) {
		super(props);
		this.state = {
			currentInput: "0",
			userHasTyped: false,
		};
	}

	componentDidMount() {

		fetch("http://localhost:5000/logs", {method: "GET"})
			.then((response) => response.json())
			.then((data) => {
				console.log(data)
				main_logs = data
				this.props.onLogChange()
			})
			.catch((err) => {
				console.log(err.message)
			})

	}

	handleClick(id:string) {
		switch (id) {
			case "AC":
				this.setState({userHasTyped: false, currentInput: "0"})

				fetch("http://localhost:5000/cleans", {method: "GET"})
					.then((response) => response.json())
					.then((data) => {
						console.log(data)
					})
					.catch((err) => {
						console.log(err.message)
					})
				break
			case "C":
				this.setState({userHasTyped: false, currentInput: "0"})
				break
			case "=":
				//TODO send api to operate
				fetch("http://localhost:5000/operate", {
					method: "POST",
					body: JSON.stringify({
						element:this.state.currentInput
					},),
					headers: {
						'Content-type': 'application/json; charset=UTF-8',
					}
				})
					.then((response) => response.json())
					.then((data) => {
						console.log(data)
						if (data.status === "0") {
							this.setState({userHasTyped: false, currentInput: data.result})
							main_logs = data.logs
							this.props.onLogChange()
						}
						else {
							this.setState({userHasTyped: false, currentInput: "ERROR"})
						}

					})
					.catch((err) => {
						console.log(err.message)
				})
				break
			case "": //Separators, do nothing
				// console.log(this.props)
				break
			case "CL":
				fetch("http://localhost:5000/cleanl", {method: "GET"})
					.then((response) => response.json())
					.then((data) => {
						console.log(data)
					})
					.catch((err) => {
						console.log(err.message)
					})
				main_logs = []
				this.props.onLogChange()

				break
			default: //Numbers
				let newInput = this.state.userHasTyped ? this.state.currentInput + id : id;
				this.setState({userHasTyped: true, currentInput: newInput})
		}


	}

	renderSquare(id:string, isOrange:boolean) {
		return (
			<Square value={id} onClick={() => this.handleClick(id)} isOrange={isOrange} />
		);
	}
	render() {
		return (
			<div>
				<div className="status">{this.state.currentInput}</div>
				<div className="board-row">
					{this.renderSquare("AC",true)}{this.renderSquare("C",true)}{this.renderSquare("CL",true)}{this.renderSquare("/",true)}
				</div>
				<div className="board-row">
					{this.renderSquare("7",false)}{this.renderSquare("8",false)}{this.renderSquare("9",false)}{this.renderSquare("*",true)}
				</div>
				<div className="board-row">
					{this.renderSquare("4",false)}{this.renderSquare("5",false)}{this.renderSquare("6",false)}{this.renderSquare("-",true)}
				</div>
				<div className="board-row">
					{this.renderSquare("1",false)}{this.renderSquare("2",false)}{this.renderSquare("3",false)}{this.renderSquare("+",true)}
				</div>
				<div className="board-row">
					{this.renderSquare("0",false)}{this.renderSquare(".",false)}{this.renderSquare("",false)}{this.renderSquare("=",true)}
				</div>
			</div>
		);
	}

}


const LogCell = (props:any) => (
	<tr className="logcell">
		<td>{props.t}</td><td>{props.a}</td><td>{props.op}</td><td>{props.b}</td><td>{props.r}</td>
	</tr>
);



class Game extends React.Component {

	handleLogChange() {
		this.setState({})
	}
	render() {
		let the_logs:any[] = []
		if (main_logs !== undefined) {
			main_logs.forEach((log, index) => {
				the_logs = the_logs.concat((
					<LogCell key={index} t={log.timestamp}a={log.left} b={log.right} op={log.operation} r={log.result}/>
				))
			})
		}
		return (
			<div className="game">
				<div className="game-board">
					<Board onLogChange={() => this.handleLogChange()} />
				</div>
				<div className="game-info">
					<table>
						<thead>
							<tr className="logcell">
								<th>Timestamp</th>
								<th>Operador 1</th>
								<th>Operacion</th>
								<th>Operador 2</th>
								<th>Resultado</th>
							</tr>
						</thead>
						<tbody>
							{the_logs}
						</tbody>
					</table>

				</div>
			</div>
		);
	}
}




export default Game;
