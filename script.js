/*
 * K-means clustering
 * https://github.com/A-Rain-Lover
 */

var points = [];

/* The actual centroids' positions on the screen */
var centroids = [];

/* The true centroids' positions */
var centroid_targets = [];

/* Note : this is just for smooth animation */
/* TODO: 	keep only one of them as an array of objects */
/*		containing both informations */

var colors = [];

var k = 3;
var k_slider;

var iters = 1;
var iters_slider;

var oneshot = false;
var oneshot_cb;



var setup = () => {
	let w, h;
	let ratio = 3/5;
	w = windowWidth * ratio;
	h = windowHeight * ratio;

	var canvas = createCanvas(w, h);
	canvas.parent("canvas-div");
	init(w, h);

	textFont("Montserrat");
	
	createSpan("Clusters :")
		.parent("controls-div");

	k_slider = createSlider(3, 6, 1, 1)
			.parent("controls-div");
	

	createSpan("Iterations :")
		.parent("controls-div");

	iters_slider = createSlider(1, 512, 1, 1)
				.parent("controls-div");
	

	oneshot_cb = createCheckbox("One shot mode", false)
				.parent("controls-div");
};

var init = (c_width, c_height) => {
	points = [];
	colors = [];
	centroids = [];
	centroid_targets = [];
	/*
	 * Using HSL and only changing the hue
	 * with fixed saturation and lightness
	 * in order to get different vibrant colors
	 */
	colorMode(HSL);
	let p = 0.6;
	for (let i = 0; i < k; i++) {
		colors.push(color((100 + i * 360) / k, 60, 50));
		centroid_targets.push(
			createVector(
				randomGaussian(c_width / 2, 50),
				randomGaussian(c_height / 2, 50)
			)
		);
		centroids.push(createVector(0, 0));
	}
};

var draw = () => {
	background(220);
	k = k_slider.value();
	iters = iters_slider.value();
	oneshot = oneshot_cb.checked();

	k_slider.changed(() => {
		init(width, height);
	});

	draw_infos();
	draw_points();
	draw_centeroids();
};

const draw_infos = () => {
	strokeWeight(1);
	stroke(70);
	fill(0);
	textSize(18);
	text(`Clusters : ${k} \t|\t Iterations : ${iters}`, 10, 20);
};

const draw_points = () => {
	strokeWeight(5);
	points.forEach((p) => {
		stroke(colors[p.color]);
		point(p.coords);
	});
};

const draw_centeroids = () => {
	centroids.forEach((c, c_index) => {
		c.x -= (c.x - centroid_targets[c_index].x) * 0.5;
		c.y -= (c.y - centroid_targets[c_index].y) * 0.5;
		draw_triangle(c.x, c.y, c_index, 6);
	});
};

const draw_triangle = (x, y, color, size) => {
	stroke(colors[color]);
	strokeWeight(5);
	noFill();
	triangle(x, y - size, x - size, y + size, x + size, y + size);
};

var mouseClicked = () => {
	if ((mouseX ^ (mouseX - width)) >= 0 || (mouseY ^ (mouseY - height)) >= 0)
		return;

	points.push({
		coords: createVector(mouseX, mouseY),
		color: 0
	});
	if(!oneshot) kmeans();
};

var keyPressed = ()=>{
	if(oneshot) kmeans();
}

var kmeans = () => {
	for (let i = 0; i < iters; i++) {
		/* Associate each point with its closest centroid */
		points.forEach((p) => {
			let min_d = dist(
				p.coords.x,
				p.coords.y,
				centroid_targets[0].x,
				centroid_targets[0].y
			);
			let min_i = 0;

			centroid_targets.forEach((c, index) => {
				let a = dist(p.coords.x, p.coords.y, c.x, c.y);
				if (a < min_d) {
					min_d = a;
					min_i = index;
				}
			});

			p.color = min_i;
		});

		/* Update the centroids' positions */
		centroid_targets.forEach((c, c_index) => {
			let new_coords = createVector(0, 0);
			let n = 0;

			points
				.filter((p) => {
					return p.color == c_index;
				})
				.forEach((p) => {
					new_coords.add(p.coords);
					++n;
				});

			/* if n == 0 then there is no point in the current cluster */
			/* therefore, no updates */
			if (n == 0) return;

			new_coords.div(n);
			centroid_targets[c_index] = new_coords;
		});
	}
};
