var neurotypes = [
	{ ntype: "Human Calculator",	color: "#31933c", xPos: 0.12311806289729008, yPos: 0.12311806289729008 },
	{ ntype: "Technician",			color: "#266330", xPos: 0.12311806289729008, yPos: 0.37437266309802614 },
	{ ntype: "Contemplative",		color: "#154c3f", xPos: 0.12311806289729008, yPos: 0.6256272632987622 },
	{ ntype: "Bookkeeper",			color: "#263031", xPos: 0.12311806289729008, yPos: 0.8768818634994983 },
	{ ntype: "Analyst",				color: "#3790d8", xPos: 0.37437266309802614, yPos: 0.12311806289729008 },
	{ ntype: "Quick-Witted",		color: "#225c94", xPos: 0.37437266309802614, yPos: 0.37437266309802614 },
	{ ntype: "Understanding",		color: "#192f73", xPos: 0.37437266309802614, yPos: 0.6256272632987622 },
	{ ntype: "Level-Headed",		color: "#11132b", xPos: 0.37437266309802614, yPos: 0.8768818634994983 },
	{ ntype: "Fascinator",			color: "#9762d4", xPos: 0.6256272632987622,  yPos: 0.12311806289729008 },
	{ ntype: "Overseer",			color: "#68158d", xPos: 0.6256272632987622,  yPos: 0.37437266309802614 },
	{ ntype: "Externalist",			color: "#7a1970", xPos: 0.6256272632987622,  yPos: 0.6256272632987622 },
	{ ntype: "Clearsighted",		color: "#7a134d", xPos: 0.6256272632987622,  yPos: 0.8768818634994983 },
	{ ntype: "Newtype",				color: "#d88f8f", xPos: 0.8768818634994983,  yPos: 0.12311806289729008 },
	{ ntype: "Aesthetician",		color: "#96221e", xPos: 0.8768818634994983,  yPos: 0.37437266309802614 },
	{ ntype: "Impressionist",		color: "#96671e", xPos: 0.8768818634994983,  yPos: 0.6256272632987622 },
	{ ntype: "Pure Instinct",		color: "#96961e", xPos: 0.8768818634994983,  yPos: 0.8768818634994983 }
];

var maxPos = 0.8768818634994983;
var minPos = 0.12311806289729008;
var blankColor = "#f5f5f5";

var chart = document.getElementById("chart");
chart.addEventListener("dragenter", dragenter, false);
chart.addEventListener("dragover", dragover, false);
chart.addEventListener("drop", drop, false);
chart.addEventListener('contextmenu', rmbPress, false);
chart.addEventListener('mousedown', startDrag, false);
document.addEventListener('mouseup', stopDrag, false);

var chartBounds = chart.getBoundingClientRect();
var chartSize = chartBounds.right - chartBounds.left;

var chartOuter = document.getElementById("chart-img");
var chartResizeRatio = chartOuter.width / chartOuter.naturalWidth;

var saveLink = document.getElementById("saveLink");
var sizeSelect = document.getElementById("image-size")
sizeSelect.addEventListener("change", sizeSelectChange);
var cropSelect = document.getElementById("crop-style")
cropSelect.addEventListener("change", cropSelectChange);
var snapCheckbox = document.getElementById("snap");
snapCheckbox.addEventListener("change", snapChange);

var imageInput = document.getElementById("image-file");
document.getElementById("pick-file").addEventListener("click", function() { imageInput.click(); });
imageInput.addEventListener("change", uploadImages, false);
var linkInput = document.getElementById("image-url");
document.getElementById("submit-link").addEventListener("click", addImageFromUrl);
document.getElementById("save").addEventListener("click", saveImage);

var percentElements = [
	document.getElementById("percent1"),
	document.getElementById("percent2"),
	document.getElementById("percent3"),
	document.getElementById("percent4")
];

for (var i = 0; i <= percentElements.length - 1; i++) {
	percentElements[i].style.color = blankColor;
}

var gridSize = 20;
var gridBorder = 5 * chartResizeRatio;
var gridCell = (chartSize - gridBorder * (gridSize - 1)) / gridSize;

var imageSize;
setImageSize(3);

var isSnapToGrid = true;
var isCrop = true;
var isCircle = false;
var isKeepAspect = false;

var circleClassName = "rounded";

var currentImage;


function dragenter(e) {
	e.stopPropagation();
	e.preventDefault();
}

function dragover(e) {
	e.stopPropagation();
	e.preventDefault();
}

function drop(e) {
	e.stopPropagation();
	e.preventDefault();

	handleFiles(e.dataTransfer.files, e.clientX, e.clientY);
}

function rmbPress(e) {
	e.preventDefault();

	targ = e.target ? e.target : e.srcElement;

	if (targ.classList.contains('draggable')) {
		e.target.remove();
	}

	return false;
}

function startDrag(e) {
	targ = e.target ? e.target : e.srcElement;

	if (!targ.classList.contains('draggable')) {
		return;
	}

	offsetX = e.clientX;
	offsetY = e.clientY;

	var offset = calculateOffset(targ);
	coordX = parseFloat(targ.style.left) + offset[0];
	coordY = parseFloat(targ.style.top) + offset[1];

	drag = true;

	document.onmousemove = dragDiv;

	return false;
}

function dragDiv(e) {
	if (!drag) {
		return;
	}
	
	var x = coordX + e.clientX - offsetX;
	var y = coordY + e.clientY - offsetY;

	updateImage(targ, x, y);

	return false;
}

function stopDrag() {
	drag = false;
}


function uploadImages() {
	handleFiles(imageInput.files);
}

function handleFiles(files, x, y) {
	var imageType = /image.*/;
	chartBounds = chart.getBoundingClientRect();

	if (arguments.length > 1) {
		x = x - chartBounds.left - imageSize / 2;
		y = y - chartBounds.top - imageSize / 2;
	} else {
		x = chartSize / 2 - imageSize / 2;
		y = chartSize / 2 - imageSize / 2;
	}

	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		if (!file.type.match(imageType)) {
			continue;
		}

		var img = document.createElement("img");
		img.file = file;

		var reader = new FileReader();
		reader.onload = (function(aImg) {
			return function(e) {
				aImg.onload = function() {
					chart.appendChild(aImg);
					placeImage(aImg, x, y);
				}
				aImg.src = e.target.result;
			};
		})(img);

		reader.readAsDataURL(file);
	}
}

function addImageFromUrl() {
    if (linkInput.value.match(/\.(jpeg|jpg|gif|png)$/) == null) return;

	x = chartSize / 2 - imageSize / 2;
	y = chartSize / 2 - imageSize / 2;

	var img = document.createElement("img");

	img.onload = function() {
		chart.appendChild(img);
		placeImage(img, x, y);
	}

	img.src = linkInput.value;
}

function placeImage(img, x, y) {
	img.classList.add("draggable");
	//img.crossOrigin = "anonymous";

	updateImage(img, x, y);
}

function updateImage(img, x, y) {
	setCurrentImage(img, x, y);

	if (isKeepAspect) {
		var ratio = parseInt(img.naturalHeight) / parseInt(img.naturalWidth);
		currentImage.width = ratio > 1 ? imageSize : imageSize / ratio;
		currentImage.height = ratio > 1 ? imageSize * ratio : imageSize;
	} else {
		currentImage.width = imageSize;
		currentImage.height = imageSize;
		console.log(currentImage.width + " " + currentImage.height);
	}

	/*if (isCrop && isCircle) {
		currentImage.img.classList.add(circleClassName);
	} else {
		currentImage.img.classList.remove(circleClassName);
	}*/

	currentImage.offset = calculateOffset(currentImage.img);

	restrictToGrid();
	snapToGrid();
	updateLabels();

	applyCurrentImage(img);
}

function restrictToGrid() {
	var x = currentImage.pos[0];
	var y = currentImage.pos[1];

	if (x < 0) {
		x = 0; 
	} else if (x > chartSize - currentImage.width) {
		x = chartSize - currentImage.width;
	}

	if (y < 0) {
		y = 0;
	} else if (y > chartSize - currentImage.height) {
		y = chartSize - currentImage.height;
	}

	currentImage.pos = [x, y];
}

function snapToGrid() {
	if (isSnapToGrid) {
		currentImage.pos = [ 
			Math.round(gridSize / chartSize * currentImage.pos[0]) * (gridCell + gridBorder), 
			Math.round(gridSize / chartSize * currentImage.pos[1]) * (gridCell + gridBorder)
		];
	}
}

function calculateOffset(img) {
	if (isCrop) {
		var ratio = parseInt(img.naturalHeight) / parseInt(img.naturalWidth);
		if (ratio > 1) {
			return [0, 0, 0, imageSize * ratio - imageSize];
		} else if (ratio < 1) {
			return [(imageSize / ratio - imageSize) / 2, 0, (imageSize / ratio - imageSize) / 2, 0];
		}
	}

	return [0, 0, 0, 0];
}

function setImageSize(size) {
	imageSize = size * (gridCell + gridBorder) - gridBorder;
}

function setCurrentImage(img, x, y) {
	currentImage = { img: img, 
		width: img.style.width.replace("px", ""), 
		height: img.style.height.replace("px", ""), 
		offset: [0, 0, 0, 0], 
		pos: [x, y] 
	};
}

function getCurrentImageWidth() {
	return currentImage.width + currentImage.offset[0] + currentImage.offset[2];
}

function getCurrentImageHeight() {
	return currentImage.height + currentImage.offset[1] + currentImage.offset[3];
}

function applyCurrentImage(img) {
	img.style.left = currentImage.pos[0] - currentImage.offset[0];
	img.style.top = currentImage.pos[1] - currentImage.offset[1];
	img.style.width = currentImage.width + currentImage.offset[0] + currentImage.offset[2];
	img.style.height = currentImage.height + currentImage.offset[1] + currentImage.offset[3];
	img.style.clip = "rect(0, " + (currentImage.width + currentImage.offset[0]) + ", " + currentImage.height + ", " + currentImage.offset[2] + ")";
}

function saveImage() {
	var canvas = document.createElement("canvas");
	canvas.width = chartOuter.naturalWidth;
	canvas.height = chartOuter.naturalHeight;
	var style = chart.currentStyle || window.getComputedStyle(chart);
	var offset = parseInt(style.marginTop) / chartResizeRatio;
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(chartOuter, 0, 0);

	for (var i = 0; i < chart.children.length; i++) {
		var child = chart.children[i];
		if (child.nodeName == 'IMG') {
			var wResizeRatio = child.naturalWidth / child.width;
			var hResizeRatio = child.naturalHeight / child.height;
			var matches = child.style.clip.substring(child.style.clip.indexOf("(") + 1, child.style.clip.indexOf(")")).replace(/px/g, "").split(", ");
			ctx.drawImage(child,
				matches[3] * wResizeRatio,
				matches[0] * hResizeRatio,
				(parseFloat(matches[1]) - parseFloat(matches[3])) * wResizeRatio,
				(parseFloat(matches[2]) - parseFloat(matches[0])) * hResizeRatio,
				offset + (parseFloat(child.style.left) + parseFloat(matches[3])) / chartResizeRatio,
				offset + (parseFloat(child.style.top) + parseFloat(matches[0])) / chartResizeRatio,
				(parseFloat(matches[1]) - parseFloat(matches[3])) / chartResizeRatio,
				(parseFloat(matches[2]) - parseFloat(matches[0])) / chartResizeRatio
			);
		}
	}
	var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
	saveLink.setAttribute("href", image);
}

function sizeSelectChange(e) {
	setImageSize(e.target.value);
}

function cropSelectChange(e) {
	switch (e.target.value) {
		case "square":
			isCrop = true;
			isCircle = false;
			isKeepAspect = false;
			break;
		/*case "circle":
			isCrop = true;
			isCircle = true;
			isKeepAspect = false;
			break;*/
		case "stretch":
			isCrop = false;
			isKeepAspect = false;
			break;
		case "none":
			isCrop = false;
			isKeepAspect = true;
			break;
	}

	snapCheckbox.disabled = isKeepAspect;
	isSnapToGrid = !isKeepAspect;
}

function snapChange(e) {
	isSnapToGrid = snapCheckbox.checked;
}

function updateLabels() {
	var x = currentImage.pos[0] + imageSize / 2;
	var y = currentImage.pos[1] + imageSize / 2;
	var percentages = getPercentages(x, y).sort((a, b) => b[0] - a[0]).slice(0, 4);

	var total = 0;
	for (var i = 3; i >= 0; i--) {
		if (percentages[i][0] <= 0.005) {
			percentElements[i].innerHTML = "---";
			percentElements[i].style.color = blankColor;
		} else {
			var percent = Math.round(percentages[i][0] * 100);
			if (i == 0) { percent = 100 - total; } // so it all'd add up to 100 cuz sometimes it doesn't and i don't know why
			else { total += percent; }
			percentElements[i].innerHTML = percent + '% ' + percentages[i][1];
			percentElements[i].style.color = neurotypes.find(nt => nt.ntype == percentages[i][1]).color;
		}
	}
}

function getPercentages(x, y) {
	x /= chartSize;
	y /= chartSize;

	result = [];
	for (var i = 0; i < neurotypes.length; i++) {
		result.push([calculatePercent(neurotypes[i].xPos, neurotypes[i].yPos, x, y), neurotypes[i].ntype]);
	}

	return result;

	function calculatePercent(centerX, centerY, x, y) {
		if (x > maxPos) x = maxPos;
		if (y > maxPos) y = maxPos;
		if (x < minPos) x = minPos;
		if (y < minPos) y = minPos;
		
		var px = (1 - Math.abs(centerX - x) / 0.25);
		var py = (1 - Math.abs(centerY - y) / 0.25);
		if (px <= 0 && py <= 0) return -(px * py);
		return px * py;
	}
}
