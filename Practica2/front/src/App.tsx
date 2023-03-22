import React, {useState} from 'react';
import './App.css';


let main_logs:any[] = [
	{"left": "2", "right": "2", "operation": "+", "result": "5"}
]


function Buscador() {
	const [texto, setTexto] = useState("");

	const handleTextoChange = (event:any) => {
		setTexto(event.target.value);
	};

	const handleSubmit = (event:any) => {
		event.preventDefault();
		// Aquí puedes realizar la búsqueda con el valor del textarea
		console.log(texto);
	};

	return (
		<form onSubmit={handleSubmit}>
			<textarea value={texto} onChange={handleTextoChange} />
			<button type="submit">Buscar</button>
		</form>
	);
}
//
// class ButtonSearch extends React.Component<any, any> {
// 	constructor(props:any) {
// 		super(props);
// 		this.state = {
// 			inputValue: ''
// 		};
// 		this.handleInputChange = this.handleInputChange.bind(this);
// 	}
//
// 	handleInputChange(event:any) {
// 		const target = event.target;
// 		const value = target.value;
// 		const name = target.name;
//
// 		this.setState({
// 			[name]: value
// 		});
// 	}
//
// 	Searcher = (props:any) => {
// 		return <input type="text" value={} onChange={this.handleInputChange} />
//
// 		return (
// 			<form onSubmit={handleSubmit}>
// 				<textarea value={this.state.inputValue} onChange={handleTextoChange} />
// 				<button type="submit">Buscar</button>
// 			</form>
// 		);
//
// 	};
// }

class Board extends React.Component<any, any> {
	constructor(props:any) {
		super(props);
		this.state = {
			count_total_proc: 0,
			count_running_proc: 0,
			count_suspended_proc: 0,
			count_stopped_proc: 0,
			count_zombie_proc: 0,
			count_other_proc: 0,
			cpu_percent: 0,
			ram_percent: 0,
			total_ram: 0,
			free_ram: 0,
			buffered_ram: 0,
			cached_ram: 0
		};
	}
	getData(){
		fetch("http://localhost:5000/get_data", {method: "GET"})
			.then((response) => response.json())
			.then((data) => {
				this.setState({
					count_running_proc: data["count_running_proc"],
					count_suspended_proc: data["count_suspended_proc"],
					count_stopped_proc: data["count_stopped_proc"],
					count_zombie_proc: data["count_zombie_proc"],
					count_other_proc: data["count_other_proc"],
					count_total_proc: data["count_total_proc"],
					ram_percent: data["ram_usage"],
					cpu_percent: data["cpu_usage"],
					total_ram: data["total_ram"],
					free_ram: data["free_ram"],
					buffered_ram: data["buffered_ram"],
					cached_ram: data["cached_ram"],
				})

				console.log("Setting main_logs to:")
				console.log(data["processes"])
				main_logs = data["processes"]
				this.props.onLogChange()
			})
			.catch((err) => {
				console.log(err.message)
			})
	}

	componentDidMount() {
		//TODO uncomment
		// setInterval( this.getData , 3000);
		this.getData()
	}
	render() {
		return (
			<div className="resume">
				<div className="ram_data">
					<h1>Uso de RAM: {this.state.ram_percent}%</h1>
					<h4>Total RAM:  {this.state.total_ram}</h4>
					<h4>Free RAM:  {this.state.free_ram}</h4>
					<h4>Buffered RAM: {this.state.buffered_ram}</h4>
					<h4>Cached RAM: {this.state.cached_ram}</h4>
				</div>

				<div className="cpu_data">
					<h1>Uso de CPU:  {this.state.cpu_percent}%</h1>
					<h4>Procesos en ejecución:  {this.state.count_running_proc}</h4>
					<h4>Procesos suspendidos: {this.state.count_suspended_proc}</h4>
					<h4>Procesos detenidos: {this.state.count_stopped_proc}</h4>
					<h4>Procesos zombie: {this.state.count_zombie_proc}</h4>
					<h4>Procesos otros: {this.state.count_other_proc}</h4>
					<h4>Total de procesos: {this.state.count_total_proc}</h4>
				</div>
			</div>
		);
	}

}


const LogCell = (props:any) => (
	<tr className="logcell">
		<td>{props.pid}</td><td>{props.name}</td><td>{props.username}</td><td>{props.state}</td><td>{props.ram}</td>
	</tr>
);



class Game extends React.Component {

	handleLogChange() {
		console.log("Setting new stuff!")
		this.setState({})
	}
	render() {
		let the_logs:any[] = []
		if (main_logs !== undefined) {
			for (const [index, log] of Object.entries(main_logs)) {
				console.log(log)
				if (log.FatherPID === -1) {
					the_logs = the_logs.concat((
						<LogCell key={log.ENTRY} pid={log.PID} name={log.Name} username={log.Username} state={log.State}
								 ram={log.RAM}/>
					))
				}
			}
		}

		console.log("Compound logs are:")
		console.log(the_logs)

		return (

			<div className="processes">
				<div className="processes-board">
					<Board onLogChange={() => this.handleLogChange()} />
				</div>
				<div className="processes-info">
					<table>
						<thead>
							<tr className="logcell">
								<th>PID</th>
								<th>Name</th>
								<th>Username</th>
								<th>State</th>
								<th>RAM</th>
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
	search(){
		let the_logs:any[] = []
		if (main_logs !== undefined) {
			main_logs.forEach((log, index) => {

				if(log.fatherpid === 1){

					if(log.name === this.state){
						the_logs = the_logs.concat((
							<LogCell key={index} pid={log.pid} name={log.name} username={log.username} state={log.state} ram={log.ram}/>
						))
					}
				}
			})
		}
		return (

			<div className="processes">
				<div className="processes-board">
					<Board onLogChange={() => this.handleLogChange()} />
				</div>
				<div className="processes-info">
					<table>
						<thead>
						<tr className="logcell">
							<th>PID</th>
							<th>Name</th>
							<th>Username</th>
							<th>State</th>
							<th>RAM</th>
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
