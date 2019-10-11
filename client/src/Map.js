import React from 'react';
import * as d3 from 'd3';
import './Map.css';
import {dataSchema, visSchema, recommend, bind, createSymbolSvg} from './visualmodel.js';

class Map extends React.Component {
	constructor(props) {
		super(props);
		this.drawing = React.createRef();
		this.SVG_HEIGHT = this.props.height || 376;
		this.SVG_WIDTH = this.props.width || 575;
		this.MARKER_RADIUS = this.props.markerRadius || 5;
		this.MARKER_COLOR = this.props.markerColor || '#FFF';
		this.state = {
			// This is for heatmap (Array of objects{id, x, y, timeStamp}).
			locationData: [],
			// This is for tracking user (Object of object{id, name, location(array of points), trackingObj, hidden})
			userTrackingData: {},
		}
		// Recommend a notation taking into account the data fields present (dataSchema)
		// and the supported visualisation features (visSchema).
		this.notation = recommend(
			dataSchema,
			visSchema
		);
		// Log the notation ('bind_' properties represent visual properties that vary with data).
		console.log("notation:", this.notation);
	}

	scaleMap(x, y, transform = 'top left') {
		this.svg.attr('transform', `scale(${x},${y})`).attr('transform-origin', transform);
	}

	addUtilitiesForMap() {

		// Tooltip that is shown when hovered above an area
		this.tooltip = d3.select("body")
			.append("div")
			.attr("class", "tooltip")

		this.lineFunction = d3.line()
			.curve(d3.curveCatmullRomOpen)
			// .curve(d3.curveCardinalOpen, 0.75)
			.x(function (d) { return d.x; })
			.y(function (d) { return d.y; })
	}

	componentWillReceiveProps(nextProps) {
		nextProps.trackuserdata.forEach(user => this.trackUser(user))
	}

	componentDidMount() {
		// Map data points.
		const data = {
			// Canvas
			path0: {
				color: '#000',
				info: 'Canvas',
				points: [
					{ "x": 0, "y": 376 }, { "x": 575, "y": 376 },
					{ "x": 575, "y": 0 }, { "x": 0, "y": 0 },
					{ "x": 0, "y": 376 }
				]
			},
			// Washroom
			path1: {
				color: '#ff0000',
				info: 'Washroom',
				points: [
					{ "x": 208.44, "y": 158.49 }, { "x": 208.44, "y": 291.22 },
					{ "x": 245.11, "y": 298.59 }, { "x": 266.36, "y": 291.22 },
					{ "x": 268.03, "y": 157.28 }, { "x": 208.44, "y": 158.49 }
				]
			},
			// Meeting room GB3.503
			path2: {
				color: '#dff302',
				info: 'Meeting room GB3.503',
				points: [
					{ "x": 350.45, "y": 204.06 }, { "x": 350.45, "y": 243.75 },
					{ "x": 305.53, "y": 243.75 }, { "x": 305.53, "y": 204.06 },
					{ "x": 350.45, "y": 204.06 }
				]
			},
			// Meeting Room GB3.502
			path3: {
				color: '#118b41',
				info: 'Meeting Room GB3.502',
				points: [
					{ "x": 293.99, "y": 129.98 }, { "x": 342.97, "y": 138.92 },
					{ "x": 349.29, "y": 144.72 }, { "x": 350.37, "y": 201.09 },
					{ "x": 293.84, "y": 200.98 }, { "x": 293.99, "y": 129.98 }
				]
			},
			// Focus Room GB3.504
			path4: {
				color: '#c9b182',
				info: 'Focus Room GB3.504',
				points: [
					{ "x": 306.21, "y": 280.31 }, { "x": 350.39, "y": 265.75 },
					{ "x": 349.26, "y": 246.95 }, { "x": 305.72, "y": 246.95 },
					{ "x": 306.21, "y": 280.31 }
				]
			},
			// Meeting Room GB3.506
			path5: {
				color: '#a6bd7f',
				info: 'Meeting Room GB3.506',
				points: [
					{ "x": 334.15, "y": 373.91 }, { "x": 393.17, "y": 374.22 },
					{ "x": 392.85, "y": 291.12 }, { "x": 387.07, "y": 282.82 },
					{ "x": 378.09, "y": 280.31 }, { "x": 334.15, "y": 293.77 },
					{ "x": 334.15, "y": 373.91 }
				]
			},
			// Meeting Room GB3.501
			path6: {
				color: '#1fca03',
				info: 'Meeting Room GB3.501',
				points: [
					{ "x": 383.2, "y": 211.32 }, { "x": 374.65, "y": 220.77 },
					{ "x": 374.65, "y": 252.73 }, { "x": 416.37, "y": 252.28 },
					{ "x": 416.88, "y": 211.32 }, { "x": 383.2, "y": 211.32 }
				]
			},
			// Office Room
			path7: {
				color: '#808e93',
				info: 'Office Room',
				points: [
					{ "x": 3.11, "y": 194.33 }, { "x": 90.13, "y": 194.83 },
					{ "x": 90.62, "y": 236.33 }, { "x": 3.61, "y": 236.33 },
					{ "x": 3.11, "y": 194.33 }
				]
			},
			// Conference Area
			path8: {
				color: '#d0c86f',
				info: 'Conference Area',
				points: [
					{ "x": 93.52, "y": 288.72 }, { "x": 205.97, "y": 290.19 },
					{ "x": 205, "y": 158.44 }, { "x": 125.37, "y": 158.44 },
					{ "x": 110.89, "y": 194.68 }, { "x": 93.52, "y": 194.68 },
					{ "x": 93.52, "y": 288.72 }
				]
			},
			// Developers Area
			path9: {
				color: '#f5726f',
				info: 'Developers Area',
				points: [
					{ "x": 3.62, "y": 373.9 }, { "x": 91.79, "y": 374.37 },
					{ "x": 90.81, "y": 239.25 }, { "x": 4.12, "y": 239.25 },
					{ "x": 3.62, "y": 373.9 }
				]
			},
			// Other Deakin Office
			path10: {
				color: '#39ed08',
				info: 'Other Deakin Office',
				points: [
					{ "x": 3, "y": 191.57 }, { "x": 108, "y": 191.57 },
					{ "x": 123, "y": 154.64 }, { "x": 205.44, "y": 154.64 },
					{ "x": 205.44, "y": 124.31 }, { "x": 268, "y": 125.33 },
					{ "x": 268, "y": 100.66 }, { "x": 255.44, "y": 98.66 },
					{ "x": 91.77, "y": 99 }, { "x": 92.1, "y": 3.66 },
					{ "x": 3, "y": 3 }, { "x": 3, "y": 191.57 }
				]
			},
			// Storage Room
			path11: {
				color: '#27dbb2',
				info: 'Storage Room',
				points: [
					{ "x": 455, "y": 3 }, { "x": 454.11, "y": 137.56 },
					{ "x": 319.11, "y": 109.21 }, { "x": 257.14, "y": 95.82 },
					{ "x": 95, "y": 95.82 }, { "x": 95.36, "y": 3.36 },
					{ "x": 455, "y": 3 }
				]
			},
			// Washroom Ally
			path12: {
				color: '#808e93',
				info: 'Washroom Ally',
				points: [
					{ "x": 271.63, "y": 101.43 }, { "x": 269.04, "y": 290.93 },
					{ "x": 302.22, "y": 280.93 }, { "x": 302.22, "y": 203.43 },
					{ "x": 290.82, "y": 203.43 }, { "x": 291.34, "y": 125.43 },
					{ "x": 342.67, "y": 135.93 }, { "x": 350.1, "y": 141.93 },
					{ "x": 348.89, "y": 118.43 }, { "x": 271.63, "y": 101.43 }
				]
			},
			// Deakin Office
			path13: {
				color: '#878787',
				info: 'Deakin Office',
				points: [
					{ "x": 572.11, "y": 3.05 }, { "x": 572.47, "y": 374.29 },
					{ "x": 545.1, "y": 374.29 }, { "x": 545.1, "y": 251.74 },
					{ "x": 571.39, "y": 226.44 }, { "x": 485.1, "y": 139.83 },
					{ "x": 457, "y": 138.78 }, { "x": 457.71, "y": 3.38 },
					{ "x": 572.11, "y": 3.05 }
				]
			},
			// Kitchen
			path14: {
				color: '#baaf03',
				info: 'Kitchen',
				points: [
					{ "x": 397.15, "y": 286.39 }, { "x": 459, "y": 286.39 },
					{ "x": 459, "y": 202.77 }, { "x": 474.03, "y": 203.35 },
					{ "x": 473.45, "y": 234.77 }, { "x": 511.6, "y": 271.44 },
					{ "x": 537.62, "y": 246.41 }, { "x": 541.66, "y": 253.4 },
					{ "x": 541.08, "y": 374.44 }, { "x": 396.58, "y": 374.44 },
					{ "x": 397.15, "y": 286.39 }
				]
			},
			// Stairs 1
			path15: {
				color: '#878787',
				info: 'Stairs 1',
				points: [
					{ "x": 420.85, "y": 195 }, { "x": 420.85, "y": 283.19 },
					{ "x": 454.86, "y": 283.19 }, { "x": 454.86, "y": 195 },
					{ "x": 420.85, "y": 195 }
				]
			},
			// Stairs 2
			path16: {
				color: '#878787',
				info: 'Stairs 2',
				points: [
					{ "x": 267.67, "y": 129.25 }, { "x": 267.67, "y": 154.68 },
					{ "x": 208.44, "y": 155.26 }, { "x": 208.44, "y": 127.97 },
					{ "x": 267.67, "y": 129.25 }
				]
			},
			// Lift Lobby
			path17: {
				color: '#dedddd',
				info: 'Lift Lobby',
				points: [
					{ "x": 512.7, "y": 266 }, { "x": 538.17, "y": 241.23 },
					{ "x": 544.27, "y": 248.23 }, { "x": 565.85, "y": 226.7 },
					{ "x": 483.01, "y": 143.15 }, { "x": 459.08, "y": 141.63 },
					{ "x": 459.37, "y": 199.17 }, { "x": 478.06, "y": 199.46 },
					{ "x": 477.57, "y": 233.42 }, { "x": 512.7, "y": 266 }
				]
			},
			// Student's work area
			path18: {
				color: '#93edd8',
				info: 'Student\'s work area',
				points: [
					{ "x": 208.44, "y": 294.02 }, { "x": 244.69, "y": 301.48 },
					{ "x": 329.78, "y": 276.11 }, { "x": 330.78, "y": 374.61 },
					{ "x": 94.28, "y": 374.11 }, { "x": 93.78, "y": 291.03 },
					{ "x": 208.44, "y": 294.02 }
				]
			},
			// Lobby
			path19: {
				color: '#dcd781',
				info: 'Lobby',
				points: [
					{ "x": 394.22, "y": 283.36 }, { "x": 393.5, "y": 286.41 },
					{ "x": 389.69, "y": 278.76 }, { "x": 377, "y": 275.76 },
					{ "x": 333.5, "y": 289.26 }, { "x": 333.5, "y": 275.76 },
					{ "x": 353.44, "y": 269.76 }, { "x": 353.44, "y": 119.26 },
					{ "x": 454.5, "y": 141.76 }, { "x": 455, "y": 190.26 },
					{ "x": 416.88, "y": 190.76 }, { "x": 416.88, "y": 207.19 },
					{ "x": 380.63, "y": 208.26 }, { "x": 371.56, "y": 217.26 },
					{ "x": 371.56, "y": 255.94 }, { "x": 416.88, "y": 255.94 },
					{ "x": 416.88, "y": 282.95 }, { "x": 394.22, "y": 283.36 }
				]
			}
		}
		this.init_map(this.props.data || data);
		this.addUtilitiesForMap();

		// Find the scaling amount based on the parent div's height and width
		const xScale = document.getElementById("mapDiv").getBoundingClientRect().width / this.SVG_WIDTH;
		const yScale = document.getElementById("mapDiv").getBoundingClientRect().height / this.SVG_HEIGHT;
		this.scaleMap(xScale.toFixed(2), yScale.toFixed(2));

		// this.setState({ locationData: this.props.locationData || this.randomData() }, () => this.heatmap(this.state.locationData, Date.now(), Date.now() + 3600000))

		// Create a new layer for heatmap
		//this.heatmapLayer = this.svg.append('g');

		// Create a new layer for user tracking
		this.userTrackingLayer = this.svg.append('g');

		this.trackUser(this.props.trackuserdata);
	}

	init_map(dataPoints) {

		this.svg = d3.select(this.drawing.current).append('svg')
			.attr('height', this.SVG_HEIGHT)
			.attr('width', this.SVG_WIDTH);

		let lineFunction = d3.line()
			.x(function (d) { return d.x; })
			.y(function (d) { return d.y; })

		for (var key in dataPoints) {
			let data = dataPoints[key];

			this.svg.append("path")
				.attr("d", lineFunction(data.points))
				.attr("fill", data.color)
				.attr("class", data.info)
				.on("mouseover", () => this.tooltip.style("visibility", "visible").text(data.info))
				.on("mousemove", () => this.tooltip.style("top", (d3.event.pageY - 30) + "px").style("left", (d3.event.pageX + 10) + "px"))
				.on("mouseout", () => this.tooltip.style("visibility", "hidden"));
		}
	}

	randomData(numberOfData = 100) {
		let locationData = [];
		for (let i = 1; i <= numberOfData; i++) {
			let newData = {
				id: i,
				// x: Math.floor(Math.random() * this.SVG_WIDTH + 1),
				// y: Math.floor(Math.random() * this.SVG_HEIGHT + 1),
				// timestamp: new Date(Date.now() + Math.floor(Math.random() * 24 * 60 * 60 * 1000))
				...this.generateRandomLocation(Date.now(), new Date(Date.now() + 24 * 60 * 60 * 1000))
			}
			locationData.push(newData);
		}
		return locationData;
	}

	generateRandomLocation(startDate, endDate, height = this.SVG_HEIGHT, width = this.SVG_WIDTH) {
		let diff = endDate.getTime() - startDate.getTime();
		let new_diff = diff * Math.random();
		return {
			x: Math.floor(Math.random() * width),
			y: Math.floor(Math.random() * height),
			timestamp: new Date(startDate.getTime() + new_diff)
		}
	}

	heatmap(locationData, startTime, endTime) {
		this.heatmapLayer.selectAll('*').remove()
		const heatpoints = [];
		heatpoints.push(locationData.forEach(p => {
			if (p.timestamp > startTime && p.timestamp < endTime)
				return this.addPersonToHeatmap(p)
		}))
	}

	addPersonToHeatmap(location) {
		return this.heatmapLayer.append('circle')
			.attr('r', this.MARKER_RADIUS)
			.attr('cx', location.x)
			.attr('cy', location.y)
			.style('fill', this.MARKER_COLOR)
	}
		
	addNewUserToTrack(userData, visResult) {
		// Define custom markers for each user
		let data = [
			{ id: 0, name: 'start', height: 8, width: 8, size: visResult.marker_start.size, color: visResult.marker_start.color, shape: visResult.marker_start.shape, refX: 50, refY: 50, viewbox: "0 0 100 100" },
			{ id: 1, name: 'end', height: visResult.marker_end.size, width: visResult.marker_end.size, color: visResult.marker_end.color, shape: visResult.marker_end.shape, refX: 50, refY: 50, viewbox: "0 0 100 100" },
			{ id: 2, name: 'mid', height: visResult.marker_mid.size, width: visResult.marker_mid.size, color: visResult.marker_mid.color, shape: visResult.marker_mid.shape, refX: 50, refY: 50, viewbox: "0 0 100 100" }
		];

		let defs = this.svg.append('svg:defs');

		defs.selectAll('marker')
			.data(data)
			.enter()
			.append('svg:marker')
			.attr('id', function (d) { return 'marker_' + d.name + "_" + userData.id })
			.attr('markerHeight', function (d) { return d.height })
			.attr('markerWidth', function (d) { return d.width })
			.attr('refX', function (d) { return d.refX })
			.attr('refY', function (d) { return d.refX })
			.attr('viewBox', function (d) { return d.viewbox })
			.attr('orient', 'auto')
			.append(function(d) {
				// Generate custom SVG marker symbol with recommended color and shape
				return createSymbolSvg(d.color, d.shape);
			});

		return this.userTrackingLayer.append("path")
			.datum(visResult.path)
			.attr("d", this.lineFunction)
			.attr("fill", 'none')
			.attr("stroke", visResult.line_style.color) // Stroke color will be chosen based on person id
			.attr("class", 'person')
			.on("mouseover", () => this.tooltip.style("visibility", "visible").text(userData.name || userData.id))
			.on("mousemove", () => this.tooltip.style("top", (d3.event.pageY - 30) + "px").style("left", (d3.event.pageX + 10) + "px"))
			.on("mouseout", () => this.tooltip.style("visibility", "hidden"))
			.attr('marker-start', "url(#marker_start_" + userData.id + ")")
			.attr("marker-mid", "url(#marker_mid_" + userData.id + ")")
			.attr('marker-end', "url(#marker_end_" + userData.id + ")")
	}

	trackUser(userData) {

		if (!userData || Object.keys(userData).length === 0)
			return;

		// Preprocess data
		let personData = {
			// Convert id to a bin. This is needed as there are
			// a finite number of colours/textures available and
			// potentially infinite ids.
			"idbin": "bin" + (1 + userData.id % 3),
			"person_start": {
				// convert time to number (milliseconds since epoch)
				"time": new Date("2019-02-01T00:00:00Z").getTime()
			},
			"person_end": {
				// TODO: Extract start and end timestamps from userData.location
				"time": new Date("2019-10-01T00:00:00Z").getTime()
			},
			"person_path": userData.location
		};

		// Bind notation to data (will substitute 'bind_' properties in the notation with actual data values)
		let visResult = bind(this.notation, personData);

		// Log the recommended visualisation (after binding to data, all visual properties will be constant)
		console.log("visResult:", visResult);

		// If the user does not exists then add it to map
		if (this.state.userTrackingData[userData.id] === undefined) {
			let newUser = {
				id: userData.id,
				location: userData.location,
				name: userData.name,
				hidden: false
			}

			newUser.trackingObj = this.addNewUserToTrack(newUser, visResult);

			let newStateObj = Object.assign({}, this.state.userTrackingData);
			newStateObj[userData.id] = newUser;

			this.setState({ userTrackingData: Object.assign({}, newStateObj) });
		} else {
			// If user exists then add new locations.
			// Note: visResult.path may be different to userData.location. E.g. depending on the bindings specified by the notation, it may scale or swap the x and y axes.
			this.state.userTrackingData[userData.id].trackingObj.datum(visResult.path).transition().duration(1000).attr("d", this.lineFunction)

			let newStateObj = Object.assign({}, this.state.userTrackingData);
			newStateObj[userData.id].location = userData.location;
			this.setState({ userTrackingData: Object.assign({}, newStateObj) });
		}
	}

	render() {
		return (
			<React.Fragment>
				{/* <h1>GWP Map</h1> */}
				<div ref={this.drawing} id="mapDiv"></div>
			</React.Fragment>
		);
	}
}

export default Map;
