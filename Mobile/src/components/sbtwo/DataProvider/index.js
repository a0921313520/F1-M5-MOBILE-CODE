import React, { Component } from 'react';
const DataContext = React.createContext();
class DataProvider extends Component {
	state = {
	};

	render() {
		return <DataContext.Provider value={this.state}>{this.props.children}</DataContext.Provider>;
	}
}

const DataConsumer = DataContext.Consumer;

export default DataProvider;
export { DataConsumer };
