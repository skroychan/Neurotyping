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
chart.addEventListener("contextmenu", rmbPress, false);
chart.addEventListener("mousedown", startDrag, false);
document.addEventListener("mousemove", mouseMove, false);
document.addEventListener("mouseup", stopDrag, false);
document.addEventListener("paste", paste, false);

var chartBounds = chart.getBoundingClientRect();
var chartSize = chartBounds.right - chartBounds.left;

var chartOuter = document.getElementById("chart-img");
var chartResizeRatio = chartOuter.width / chartOuter.naturalWidth;

var saveLink = document.getElementById("save-link");
var sizeSelect = document.getElementById("image-size")
sizeSelect.addEventListener("change", sizeSelectChange);
var cropSelect = document.getElementById("crop-style")
cropSelect.addEventListener("change", cropSelectChange);
var snapCheckbox = document.getElementById("snap");
snapCheckbox.addEventListener("change", snapChange);

var imageInput = document.getElementById("image-file");
document.getElementById("pick-file").addEventListener("click", function() { imageInput.click(); });
imageInput.addEventListener("change", uploadImages, false);
document.getElementById("save").addEventListener("click", saveImage);

var menuLinkChart = document.getElementById("menu-chart");
var menuLinkHeatmap = document.getElementById("menu-heatmap");

var divPercent = document.getElementById("percent");
var divUpload = document.getElementById("upload");
var divOptions = document.getElementById("options");

var divHeatmap = document.getElementById("heatmap");
var divHeatmapOptions = document.getElementById("heatmap-options");

var percentElements = [
	document.getElementById("percent1"),
	document.getElementById("percent2"),
	document.getElementById("percent3"),
	document.getElementById("percent4")
];

resetLabels();

var heatmapCanvas = document.getElementById("heatmap-canvas");
var heatmapTempCanvas = document.getElementById("heatmap-temp-canvas");
heatmapCanvas.width = heatmapTempCanvas.width = chartSize;
heatmapCanvas.height = heatmapTempCanvas.height = chartSize;
heatmapCanvas.addEventListener("mousedown", heatmapMouseDown, false);
heatmapCanvas.addEventListener("contextmenu", rmbPress, false);
heatmapTempCanvas.addEventListener("mousedown", heatmapMouseDown, false);
heatmapTempCanvas.addEventListener("contextmenu", rmbPress, false);

var context = heatmapCanvas.getContext("2d");
context.lineCap = "round";
context.lineJoin = "round";
context.lineWidth = 50;
var tempContext = heatmapTempCanvas.getContext("2d");
tempContext.lineCap = "round";
tempContext.lineJoin = "round";
tempContext.lineWidth = 10;

var heatmapOutlinePoints;

var heatmapEraserButton = document.getElementById("eraser-button");
heatmapEraserButton.addEventListener("click", function() { setHeatmapColorIndex(0); }, false);
var heatmapGreenButton = document.getElementById("green-color-button");
heatmapGreenButton.addEventListener("click", function() { setHeatmapColorIndex(1); }, false);
var heatmapYellowButton = document.getElementById("yellow-color-button");
heatmapYellowButton.addEventListener("click", function() { setHeatmapColorIndex(2); }, false);
var heatmapRedButton = document.getElementById("red-color-button");
heatmapRedButton.addEventListener("click", function() { setHeatmapColorIndex(3); }, false);
document.getElementById("heatmap-clear").addEventListener("click", heatmapReset);
var heatmapSaveLink = document.getElementById("heatmap-save-link");
var heatmapSave = document.getElementById("heatmap-save");
heatmapSave.addEventListener("click", heatmapSaveClick, false);

var heatmapColors = ["eraser", "green", "yellow", "red"];
var heatmapColorButtons = [heatmapEraserButton, heatmapGreenButton, heatmapYellowButton, heatmapRedButton];
var heatmapActiveButtonClass = "color-button-active";

var heatmapColorIndex;
setHeatmapColorIndex(1);

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
var activeMenuClass = "active";

var isDrag = false;
var isHeatmapDraw = false;
var isHeatmapErase = false;

var dragTarget;
var currentImage;

window.addEventListener("hashchange", onHashChange, false);

setPage();


function onHashChange(e) {
	setPage();
}

function setPage() {
	var hash = window.location.hash;
	if (hash) {
		if (hash == "#heatmap") {
			menuLinkChart.classList.remove(activeMenuClass);
			chart.style.display = "none";
			divPercent.style.display = "none";
			divUpload.style.display = "none";
			divOptions.style.display = "none";

			menuLinkHeatmap.classList.add(activeMenuClass);
			divHeatmap.style.display = "block";
			divHeatmapOptions.style.display = "block";
		} else {
			menuLinkChart.classList.add(activeMenuClass);
			chart.style.display = "block";
			divPercent.style.display = "block";
			divUpload.style.display = "block";
			divOptions.style.display = "block";
			
			menuLinkHeatmap.classList.remove(activeMenuClass);
			divHeatmap.style.display = "none";
			divHeatmapOptions.style.display = "none";
		}
	}
}

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

	if (e.target.classList.contains('draggable')) {
		e.target.remove();
		resetLabels();
	}

	return false;
}

function paste(e) {
	var items = (e.clipboardData || e.originalEvent.clipboardData).items;
	var files = [];
	for (index in items) {
		var item = items[index];
		if (item.kind === "file") {
			var blob = item.getAsFile();
			files.push(blob);
		} else if (item.kind === "string") {
			item.getAsString(function (s) {
				addImageFromUrl(s);
			});
		}
	}

	if (files) {
		handleFiles(files);
	}
}

function startDrag(e) {
	if (!e.target.classList.contains('draggable')) {
		return;
	}

	e.preventDefault();
	dragTarget = e.target;

	offsetX = e.clientX;
	offsetY = e.clientY;

	var offset = calculateOffset(dragTarget);
	coordX = parseFloat(dragTarget.style.left) + offset[0];
	coordY = parseFloat(dragTarget.style.top) + offset[1];

	isDrag = true;

	return false;
}

function mouseMove(e) {
	if (isDrag) {
		var x = coordX + e.clientX - offsetX;
		var y = coordY + e.clientY - offsetY;

		updateImage(dragTarget, x, y);
	} else if (isHeatmapDraw) {
		chartBounds = divHeatmap.getBoundingClientRect();
		var x = e.clientX - chartBounds.left;
		var y = e.clientY - chartBounds.top;

		var ctx = isHeatmapErase ? context : tempContext;
		if (isHeatmapErase) {
			ctx.beginPath();
			ctx.moveTo(x, y);
			x -= e.movementX;
			y -= e.movementY;
		} else {
			heatmapOutlinePoints.push([x, y]);
		}
		ctx.lineTo(x, y);
		ctx.stroke();
	}

	return false;
}

function stopDrag() {
	if (isHeatmapDraw) {
		if (!isHeatmapErase) {
			tempContext.clearRect(0, 0, heatmapTempCanvas.width, heatmapTempCanvas.height);
			heatmapOutlinePoints = simplifyPath(heatmapOutlinePoints, 2);

			var i = 0;
			tempContext.beginPath();
			tempContext.moveTo(heatmapOutlinePoints[0][0], heatmapOutlinePoints[0][1]);
			for (i = 1; i < heatmapOutlinePoints.length - 1; i++) {
				var xc = (heatmapOutlinePoints[i][0] + heatmapOutlinePoints[i + 1][0]) / 2;
				var yc = (heatmapOutlinePoints[i][1] + heatmapOutlinePoints[i + 1][1]) / 2;
				tempContext.quadraticCurveTo(heatmapOutlinePoints[i][0], heatmapOutlinePoints[i][1], xc, yc);
			}
			tempContext.quadraticCurveTo(heatmapOutlinePoints[i][0], heatmapOutlinePoints[i][1], heatmapOutlinePoints[0][0], heatmapOutlinePoints[0][1]);
			tempContext.stroke();
			tempContext.fill();
			context.drawImage(heatmapTempCanvas, 0, 0);
			tempContext.clearRect(0, 0, heatmapTempCanvas.width, heatmapTempCanvas.height);
		} else {
			context.closePath();
		}
	}

	isDrag = false;
	isHeatmapDraw = false;
}

function heatmapMouseDown(e) {
	isHeatmapDraw = true;

	if (!isHeatmapErase) {
		tempContext.strokeStyle = tempContext.fillStyle = heatmapColors[heatmapColorIndex];
		tempContext.beginPath();
		tempContext.moveTo(e.offsetX, e.offsetY);
		heatmapOutlinePoints = [[e.offsetX, e.offsetY]];
	} else {
		context.beginPath();
		context.moveTo(e.offsetX, e.offsetY);
	}

	return false;
}

function heatmapSetPen(isPen) {
	isHeatmapErase = !isPen;
	context.globalCompositeOperation = isHeatmapErase ? "destination-out" : "source-over";
	heatmapTempCanvas.style.display = isHeatmapErase ? "none" : "block";
}

function heatmapReset() {
	context.clearRect(0, 0, heatmapCanvas.width, heatmapCanvas.height);
	setHeatmapColorIndex(1);
}

function setHeatmapColorIndex(index) {
	heatmapSetPen(index != 0);
	heatmapColorIndex = index;
	for (var i = 0; i < heatmapColors.length; i++) {
		if (heatmapColorIndex == i) {
			heatmapColorButtons[i].classList.add(heatmapActiveButtonClass);
		} else {
			heatmapColorButtons[i].classList.remove(heatmapActiveButtonClass);
		}
	}
}

function heatmapSaveClick() {
	var newCanvas = document.createElement("canvas");
	newCanvas.width = chartOuter.naturalWidth;
	newCanvas.height = chartOuter.naturalHeight;
	var style = window.getComputedStyle(divHeatmap);
	var offset = parseInt(style.marginTop) / chartResizeRatio;
	var size = heatmapCanvas.width / chartResizeRatio;
	var ctx = newCanvas.getContext('2d');
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
	ctx.drawImage(chartOuter, 0, 0);
	ctx.globalAlpha = window.getComputedStyle(heatmapCanvas).opacity;
	ctx.drawImage(heatmapCanvas, offset, offset, size, size);

	var image = newCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
	heatmapSaveLink.setAttribute("href", image);
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

function addImageFromUrl(url) {
	x = chartSize / 2 - imageSize / 2;
	y = chartSize / 2 - imageSize / 2;

	var img = document.createElement("img");

	img.onload = function() {
		chart.appendChild(img);
		placeImage(img, x, y);
	}

	img.src = url;
}

function placeImage(img, x, y) {
	img.classList.add("draggable");

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
			var clip = child.style.clip.substring(child.style.clip.indexOf("(") + 1, child.style.clip.indexOf(")")).replace(/px/g, "").split(", ");
			ctx.drawImage(child,
				clip[3] * wResizeRatio,
				clip[0] * hResizeRatio,
				(parseFloat(clip[1]) - parseFloat(clip[3])) * wResizeRatio,
				(parseFloat(clip[2]) - parseFloat(clip[0])) * hResizeRatio,
				offset + (parseFloat(child.style.left) + parseFloat(clip[3])) / chartResizeRatio,
				offset + (parseFloat(child.style.top) + parseFloat(clip[0])) / chartResizeRatio,
				(parseFloat(clip[1]) - parseFloat(clip[3])) / chartResizeRatio,
				(parseFloat(clip[2]) - parseFloat(clip[0])) / chartResizeRatio
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

function resetLabels() {
	for (var i = 0; i < percentElements.length; i++) {
		percentElements[i].innerHTML = "---";
		percentElements[i].style.color = blankColor;
	}
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
		if (x > maxPos) { x = maxPos; }
		else if (x < minPos) { x = minPos; }
		if (y > maxPos) { y = maxPos; }
		else if (y < minPos) { y = minPos; }
		
		var px = (1 - Math.abs(centerX - x) / 0.25);
		var py = (1 - Math.abs(centerY - y) / 0.25);
		if (px <= 0 && py <= 0) return -(px * py);
		return px * py;
	}
}

function simplifyPath(points, length) {
	function simplify(start, end) {
		var index, dx, dy, p, t, dist;
		var p1 = points[start];
		var p2 = points[end];
		var xx = p1[0];
		var yy = p1[1];
		var ddx = p2[0] - xx;
		var ddy = p2[1] - yy;
		var dist1 = ddx * ddx + ddy * ddy;
		var maxDist = length;
		for (var i = start + 1; i < end; i++) {
			p = points[i];
			if (ddx !== 0 || ddy !== 0) {
				t = ((p[0] - xx) * ddx + (p[1] - yy) * ddy) / dist1;
				if (t > 1) {
					dx = p[0] - p2[0];
					dy = p[1] - p2[1];
				} else if (t > 0) {
					dx = p[0] - (xx + ddx * t);
					dy = p[1] - (yy + ddy * t);
				} else {
					dx = p[0] - xx;
					dy = p[1] - yy;
				}
			} else {
				dx = p[0] - xx;
				dy = p[1] - yy;
			}
			dist = dx * dx + dy * dy;
			if (dist > maxDist) {
				index = i;
				maxDist = dist;
			}
		}

		if (maxDist > length) {
			if (index - start > 1) {
				simplify(start, index);
			}
			newLine.push(points[index]);
			if (end - index > 1) {
				simplify(index, end);
			}
		}
	}
	var end = points.length - 1;
	var newLine = [points[0]];
	simplify(0, end);
	newLine.push(points[end]);
	return newLine;
}