import React, {useState, ChangeEvent} from 'react';
import './App.css';


let main_logs:any[] = []


const LogCell = (props:any) => (
	<tr className="logcell">
		<td>{props.pid}</td><td>{props.name}</td><td>{props.username}</td><td>{props.state}</td><td>{props.ram}</td>
	</tr>
);


const InputText = ({inputDidChange} : any) => {
	const [inputText, setInputText] = useState('');
	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setInputText(event.target.value);
		inputDidChange(event.target.value)
	};
	return (
		<div>
			<input type="text" value={inputText} onChange={handleInputChange} />
		</div>
	);
};




class Game extends React.Component<any, any> {
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
			cached_ram: 0,
			userPIDQuery : ""
		};
		this.handleInputChange = this.handleInputChange.bind(this);
	}


	componentDidMount() {
		//TODO uncomment
		setInterval( this.getData , 3000);
		// this.getData()
	}

	getData(){
		fetch("http://localhost:5000/get_data", {method: "GET"})
			.then((response) => response.json())
			.then((data) => {
				main_logs = data["processes"]
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
			})
			.catch((err) => {
				console.log(err.message)
			})
	}

	handleInputChange (fatherPIDText: string) {
		this.setState({userPIDQuery : fatherPIDText})
	}
	render() {
		let the_logs:any[] = []
		if (main_logs !== undefined) {
			for (const [, log] of Object.entries(main_logs)) {
				if (this.state.userPIDQuery === "") {
					if (log.FatherPID === -1) {
						the_logs = the_logs.concat((
							<LogCell key={log.ENTRY} pid={log.PID} name={log.Name} username={log.Username == -1 ? "--" : log.Username}
									 state={log.State}
									 ram={log.RAM}/>
						))
					}
				}
				else {
					console.log("Process " + log.PID)
					if (log.FatherPID === parseInt(this.state.userPIDQuery)) {
						the_logs = the_logs.concat((
							<LogCell key={log.ENTRY} pid={log.PID} name={log.Name} username={log.Username == -1 ? "--" : log.Username}
									 state={log.State}
									 ram={log.RAM}/>
						))
					}
				}
			}
		}

		return (

			<div className="processes">

				<h1 >Sistemas Operativos 1 - Práctica 2</h1>
				<h4 >201801290 - Brian Matus </h4>
				<div className="processes-board">
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
				</div>
				<div className="processes-info">
					<h3>Buscador Hijos por PID:</h3>
					<InputText inputDidChange={this.handleInputChange}></InputText>


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
