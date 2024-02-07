import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { Interaction } from './three.interaction.module.js';

//i just wanted to finish this quickly,
//so it won't have the best code but fast and functional

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const controls = new OrbitControls( camera, renderer.domElement );
const interaction = new Interaction(renderer, scene, camera);

let showWireframe = true;
let showblocks = true;
let roundNumbers = true;

let blockX = 2;
let blockY = 2;
let blockZ = -2;
let startingCorner = [1,-1,-1];
let endingCorner = [-1,1,1];

let isSelectingCornerFor = "start";
let isSelectingCorner = false;

let blockXInput = document.querySelector("#block-x");
let blockYInput = document.querySelector("#block-y");
let blockZInput = document.querySelector("#block-z");
let startCornerInput = document.querySelector("#start-selector");
let endCornerInput = document.querySelector("#end-selector");
let rotateAngle = document.querySelector("#rotate-angle");
let TiltAngle = document.querySelector("#tilt-angle");
setupListeners();


updateShape();

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 2, 3, 3 );
controls.update();

function animate() {

	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

	renderer.render( scene, camera );

}
animate();


function setupListeners() {
	blockXInput?.addEventListener("input", (event) => {
		let inputElement = event.target;
		if (inputElement.value < 0) inputElement.value = 0;
		blockZ = -parseFloat(inputElement.value);
		updateShape();
	});
	blockYInput?.addEventListener("input", (event) => {
		let inputElement = event.target;
		if (inputElement.value < 0) inputElement.value = 0;
		blockY = parseFloat(inputElement.value);
		updateShape();
	});
	blockZInput?.addEventListener("input", (event) => {
		let inputElement = event.target;
		if (inputElement.value < 0) inputElement.value = 0;
		blockX = parseFloat(inputElement.value);
		updateShape();
	});
	startCornerInput?.addEventListener("click", () => {
		isSelectingCornerFor = "start";
		isSelectingCorner = !isSelectingCorner;
		updateShape();
	});
	endCornerInput?.addEventListener("click", () => {
		isSelectingCornerFor = "end";
		isSelectingCorner = !isSelectingCorner;
		updateShape();
	});
	document.querySelector("#hide-wireframe")?.addEventListener("input", (event) => {
		let inputElement = event.target;
		showWireframe = !inputElement.checked;
		updateShape();
	});
	document.querySelector("#hide-blocks")?.addEventListener("input", (event) => {
		let inputElement = event.target;
		showblocks = !inputElement.checked;
		updateShape();
	});
}


function updateShape() {
	// errorText.textContent = "No Errors.";
	scene.clear();

	let _isWireframeShowing = showWireframe;
	if (isSelectingCorner == true) showWireframe = false;

	let startPoint = [blockX/4*startingCorner[0],blockY/4*startingCorner[1],blockZ/4*startingCorner[2]];
	// endingCorner = startingCorner.map(x => x * -1);
	let endPoint = [blockX/4*endingCorner[0],blockY/4*endingCorner[1],blockZ/4*endingCorner[2]];

	let xWidth = (endPoint[0] - startPoint[0]) * -2;
	let yWidth = (endPoint[1] - startPoint[1]) * 2;
	let zWidth = (endPoint[2] - startPoint[2]) * 2;

	let blockLength = Math.sqrt((xWidth ** 2) + (yWidth ** 2) + (zWidth ** 2));
	let rotationXY = Math.atan2(zWidth, xWidth);
	// if (rotationXY < 0) rotationXY += convertDegressToRadian(360);
	let rotationXY2Z = Math.atan2(yWidth, Math.sqrt((xWidth ** 2) + (zWidth ** 2))) - convertDegressToRadian(90);
	rotationXY2Z = -rotationXY2Z;
	// console.log("R",convertDegreesToBabftAngle(convertRadianToDegress(rotationXY)));
	// console.log("T",convertDegreesToBabftAngle(convertRadianToDegress(rotationXY2Z)));
	showAngleText(rotateAngle, rotationXY);
	showAngleText(TiltAngle, rotationXY2Z);
	if (isSelectingCorner !== true) {
		createRectangle(scene,
			[blockLength/20, blockLength/2, blockLength/20],
			[0,rotationXY,rotationXY2Z],
			[(endPoint[0]+startPoint[0])/2,(endPoint[1]+startPoint[1])/2,(endPoint[2]+startPoint[2])/2],
			0x4444ff
		);

		let _showBlocks = showblocks;
		showblocks = false;
		createRectangle(scene, [blockX / 2, blockY / 2, blockZ / 2]);
		showblocks = _showBlocks;
	}
	// createRectangle(scene, [blockLength / 20, blockLength / 2, blockLength / 20], [0,0,convertDegressToRadian(15)]);
	// createRectangle(scene, [0.05, 0.05, 0.05],[0,0,0],[blockX/4, blockY/4, blockZ/4]);
	
	if (isSelectingCorner == true) createClickableCorners();
	createRectangle(scene, [blockX+0.5, 0, blockZ+0.5], [0,0,0],[0,-blockY/4,0]);
	createRectangle(scene, [0, 0.25, blockZ+0.5], [0,0,0],[blockX/2+0.25,-(blockY/4)+0.125,0], 0xffffff);

	const pointGeometry = new THREE.BoxGeometry( 0.025, 0.025, 0.025 );
	const startingPointMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
	const startingPoint = new THREE.Mesh( pointGeometry, startingPointMaterial );
	startingPoint.position.set(...startPoint);
	const endingPointMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
	const endingPoint = new THREE.Mesh( pointGeometry, endingPointMaterial );
	endingPoint.position.set(...endPoint);
	scene.add( startingPoint );
	scene.add( endingPoint );
	
	if (isSelectingCorner == true) showWireframe = _isWireframeShowing;
}

function oldupdateShape() {
	errorText.textContent = "No Errors.";
	scene.clear();
	if (blockSegments % 2 !== 0) blockSegments += 1;

	let angleDegrees = 360/blockSegments;
	if (roundNumbers) angleDegrees = Math.round(100 * angleDegrees) / 100;
	angleInput.value = angleDegrees;
	let angleRadians = angleDegrees * (Math.PI/180);
	// let radius = (blockLength / 2) / Math.cos(angleRadians / 2);
	// let blockWidth = 2 * radius * Math.sin(angleRadians / 2);
	let blockWidth = blockLength * Math.tan(angleRadians / 2);
	blockWidth = Math.round(1e10 * blockWidth) / 1e10;
	if (roundNumbers) blockWidth = Math.round(100 * blockWidth) / 100;
	blockWidthInput.value = blockWidth;
	// blockWidthInput.value = Math.round(100 * (blockWidth + 0.000000000000002)) / 100;

	let height = 1;
	if (makeItSphere) height = blockWidth / 2;
	let totalBlockCount = 0;

	for (let sliceIndex = 0; sliceIndex < blockSegments / 2; sliceIndex++) {
		const group = new THREE.Group();

		for (let segmentIndex = 0; segmentIndex < blockSegments / 2; segmentIndex++) {
			let totalBlockSize = (blockLength * height * blockWidth) / 4;
			if (Math.floor(totalBlockSize) !== totalBlockSize) totalBlockSize = Math.floor(totalBlockSize) + 1;
			// if (totalBlockSize < blockSegments / 2) totalBlockSize = blockSegments / 2;
			totalBlockCount += totalBlockSize;
			createRectangle(group, [blockLength/2,height,blockWidth / 2], [0,angleRadians * segmentIndex,0]);
		}

		group.rotation.set(0,0,angleRadians * sliceIndex);
		scene.add(group);

		if (makeItSphere !== true) break;
	}

	totalBlocks.textContent = totalBlockCount;

	let scaleOffset = blockWidth - parseInt(currentBlockWidth.value);
	scaleOffset = Math.round(1e10 * scaleOffset) / 1e10;
	if (scaleOffset < 0) {
		scaleOffset = Math.abs(scaleOffset);
		scaleDirection.textContent = "Inwards";
	} else {
		scaleDirection.textContent = "Outwards";
	}
	scaleDirectionLength.textContent = scaleOffset / 2;
}

function createRectangle(group, size = [1,1,1], rotation = [0,0,0], position = [0,0,0], color = 0x00cc00) {
	
	//block
	if (showblocks) {
		const geometryCube = new THREE.BoxGeometry( ...size );
		const material = new THREE.MeshBasicMaterial( { color } );
		const cube = new THREE.Mesh( geometryCube, material );
		cube.rotation.set( ...rotation );
		cube.position.set( ...position );
		group.add( cube );
	}

	//wireframe / lines
	if (showWireframe === false) return;
	const materialline = new THREE.LineBasicMaterial( { color: 0xffffff } );
	const points = [];

	points.push( new THREE.Vector3( -0.5*size[0], -0.5*size[1], -0.5*size[2] ) );
	points.push( new THREE.Vector3( -0.5*size[0], -0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3( -0.5*size[0],  0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3( -0.5*size[0],  0.5*size[1], -0.5*size[2] ) );

	points.push( new THREE.Vector3(  0.5*size[0],  0.5*size[1], -0.5*size[2] ) );
	points.push( new THREE.Vector3(  0.5*size[0],  0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3(  0.5*size[0], -0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3(  0.5*size[0], -0.5*size[1], -0.5*size[2] ) );

	points.push( new THREE.Vector3( -0.5*size[0], -0.5*size[1], -0.5*size[2] ) );
	points.push( new THREE.Vector3( -0.5*size[0],  0.5*size[1], -0.5*size[2] ) );
	points.push( new THREE.Vector3(  0.5*size[0],  0.5*size[1], -0.5*size[2] ) );
	points.push( new THREE.Vector3(  0.5*size[0], -0.5*size[1], -0.5*size[2] ) );

	points.push( new THREE.Vector3(  0.5*size[0], -0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3( -0.5*size[0], -0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3( -0.5*size[0],  0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3(  0.5*size[0],  0.5*size[1],  0.5*size[2] ) );

	const geometry = new THREE.BufferGeometry().setFromPoints( points );

	const line = new THREE.Line( geometry, materialline );
	line.rotation.set( ...rotation );
	line.position.set( ...position );
	group.add( line );
}
function createClickableCorners() {
	let xMulti = [1,2,5,6];
	let yMulti = [0,1,2,3];
	let zMulti = [2,3,6,7];

	const geometryCube = new THREE.BoxGeometry( ...[0.1, 0.1, 0.1] );
	const material = new THREE.MeshBasicMaterial( { color: 0xffaaaa } );
	for (let index = 0; index < 8; index++) {
		const cube = new THREE.Mesh( geometryCube, material );
		const xValue = xMulti.includes(index) ? 1 : -1;
		const yValue = yMulti.includes(index) ? 1 : -1;
		const zValue = zMulti.includes(index) ? 1 : -1;
		cube.position.set( ...[ blockX/4 * xValue,  blockY/4 * yValue,  blockZ/4 * zValue] );
		
		scene.add( cube );
		cube.cursor = 'pointer';
		cube.on("click", (ev) => {
			// console.log(index, [xValue, yValue, zValue]);
			isSelectingCorner = false;
			if (isSelectingCornerFor == "start") {
				startingCorner = [xValue, yValue, zValue];
			} else {
				endingCorner = [xValue, yValue, zValue];
			};
			updateShape();
		});
	}
}

function showAngleText(element, radian) {
	let degrees = convertRadianToDegress(radian);
	let [fullRotations, angle, originalAngle] = convertDegreesToBabftAngle(degrees);
	if (fullRotations == 0) {
		element.textContent = angle;
	} else {
		element.textContent = `${fullRotations}x90 + ${angle}, ${originalAngle}`;
	}
}
function convertDegreesToBabftAngle(originalAngle) {
	let angle = originalAngle;
	if (angle < 0) angle += 360;
	let fullRotations = 0;
	if (angle > 90) {
		fullRotations += Math.floor(angle / 90);
		angle -= (90 * fullRotations);
	}
	angle = Math.round(1e2 * angle) / 1e2;
	return [fullRotations, angle, Math.round(1e2 * ((originalAngle + 360) % 360)) / 1e2];
}
function convertDegressToRadian(angle) {
	return angle * (Math.PI/180);
}
function convertRadianToDegress(radian) {
	return radian * (180 / Math.PI);
}