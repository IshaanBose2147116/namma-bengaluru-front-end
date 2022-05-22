import ServerAPI from "./server_api.js";

const hotelsSection = document.getElementById("services");
let userPosition = undefined;
let timeout = undefined;

$(document).ready(() => {
	hotelsSection.innerHTML += `
	<div class="cust-container-hotel">
		<h3>View Hotels</h3>
		<h5>Click on the links to know more about the hotels!</h5>
	</div>
	<div class="cust-row">
		<div class="cust-col-1">
			<div class="wrapper">
				<header>
					<h2>Price Range</h2>
					<p>Use slider or enter min and max price</p>
				</header>
				<div class="price-input">
					<div class="field">
						<span>Min</span>
						<input type="number" class="input-min" value="5000">
					</div>
					<div class="separator">-</div>
					<div class="field">
						<span>Max</span>
						<input type="number" class="input-max" value="15000">
					</div>
				</div>
				<div class="slider">
					<div class="progress"></div>
				</div>
				<div class="range-input">
					<input type="range" class="range-min" min="0" max="20000" value="5000" step="500">
					<input type="range" class="range-max" min="0" max="20000" value="15000" step="500">
				</div>
			</div>
		</div>
		<div class="cust-col-2" id="init-box">
		</div>
	</div>
	<div id="hotels-view"></div>
	`;

	ServerAPI.getHotels(response => {
		if (response.status === 200) {
			for (let i = 0; i < response.data.length; i++)
				response.data[i].image = ServerAPI.server + response.data[i].image;
			console.log(response);
			if (navigator.geolocation) {
				document.getElementById("init-box").innerHTML = "<h1>Loading...</h1>";

				navigator.geolocation.getCurrentPosition(position => {
					userPosition = position;
					displayHotels(response.data);
				}, error => {
					alert(error.code === error.PERMISSION_DENIED ? 
						"Permission denied, allow use of location to automatically find route to hotel from your current location." : 
						error.message);
					displayHotels(response.data);
				});
			} else {
				displayHotels(response.data);
			}
		} else {
			alert("Could not retrieve hotels!");
			console.log(response.data);
		}
	});
});

/**
 * 
 * @param {array} hotels 
 */
function displayHotels(hotels) {
	console.log(userPosition);
	console.log("Hotels: ", hotels);
	document.getElementById("hotels-view").innerHTML = "";

	if (hotels.length === 0) {
		document.getElementById("init-box").innerHTML = "<h1>No hotels available!</h1>";
	} else {
		for (let i = 0; i < hotels.length; i++) {
			let gmapURL = "";
			let urlFormattedAdd = hotels[i].address.replaceAll(" ", "+");
			urlFormattedAdd = urlFormattedAdd.replaceAll("/", "%2F");

			if (userPosition)
				gmapURL = `https://www.google.com/maps/dir/${ userPosition.coords.latitude },${ userPosition.coords.longitude }/${ urlFormattedAdd }`;
			else
				gmapURL = `https://www.google.com/maps/place/${ urlFormattedAdd }`;

			if (i === 0) {
				document.getElementById("init-box").innerHTML = `
				<div class="container">
					<div class="row">
						<div class="col-lg-8">
							<div class="place-card">
								<div class="place-card__img">
									<img src="${ hotels[i].image }" class="place-card__img-thumbnail" alt="Thumbnail">
								</div>
								<div class="place-card__content">
									<h4 class="place-card__content_header">
										<a href="${ hotels[i].link }" class="text-dark place-title" target="_blank">${ hotels[i].name }</a> 
										<div>
											<a href="${ hotels[i].link }" class="text-center" class="btn btn-warning">
												<i class="fa fa-rupee">
													${ (parseFloat(hotels[i].highest_price) + parseFloat(hotels[i].lowest_price)) / 2 }
													<p>per Night</p>
												</i>
											</a>
										</div>
									</h4>
									<p><i class="fa fa-map-marker"></i> 
										<a href="${ gmapURL }" target="_blank">${ hotels[i].address }</a>
									</p>
									<div class="text-muted my-4">
										${ hotels[i].description }
									</div> 
								</div>
							</div>
						</div>
					</div>
				</div>
				`;
			} else {
				document.getElementById("hotels-view").innerHTML += `
				<div class="cust-row">
					<div class="cust-col-1"></div>
					<div class="cust-col-2">
						<div class="container">
							<div class="row">
								<div class="col-lg-8">
									<div class="place-card">
										<div class="place-card__img">
											<img src="${ hotels[i].image }" class="place-card__img-thumbnail" alt="Thumbnail">
										</div>
										<div class="place-card__content">
											<h4 class="place-card__content_header">
												<a href="${ hotels[i].link }" class="text-dark place-title" target="_blank">${ hotels[i].name }</a> 
												<div>
													<a href="${ hotels[i].link }" class="text-center" class="btn btn-warning">
														<i class="fa fa-rupee">
															${ (parseFloat(hotels[i].highest_price) + parseFloat(hotels[i].lowest_price)) / 2 }
															<p>per Night</p>
														</i>
													</a>
												</div>
											</h4>
											<p><i class="fa fa-map-marker"></i> 
												<a href="${ gmapURL }" target="_blank">${ hotels[i].address }</a>
											</p>
											<div class="text-muted my-4">
												${ hotels[i].description }
											</div> 
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				`;
			}
		}
	}

	enablePriceRangeInput();
}

function enablePriceRangeInput() {
	const rangeInput = document.querySelectorAll(".range-input input"),
	priceInput = document.querySelectorAll(".price-input input"),
	range = document.querySelector(".slider .progress");
	let priceGap = 1000;

	priceInput.forEach((input) => {
		input.addEventListener("input", (e) => {
			let minPrice = parseInt(priceInput[0].value), maxPrice = parseInt(priceInput[1].value);

			if (maxPrice - minPrice >= priceGap && maxPrice <= rangeInput[1].max) {
				if (e.target.className === "input-min") {
					rangeInput[0].value = minPrice;
					range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
				} else {
					rangeInput[1].value = maxPrice;
					range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
				}
			}
		});
	});

	rangeInput.forEach((input) => {
		input.addEventListener("input", (e) => {
			let minVal = parseInt(rangeInput[0].value),
			maxVal = parseInt(rangeInput[1].value);

			if (maxVal - minVal < priceGap) {
				if (e.target.className === "range-min") {
					rangeInput[0].value = maxVal - priceGap;
				} else {
					rangeInput[1].value = minVal + priceGap;
				}
			} else {
				priceInput[0].value = minVal;
				priceInput[1].value = maxVal;
				range.style.left = (minVal / rangeInput[0].max) * 100 + "%";
				range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
			}

			clearTimeout(timeout);
			timeout = setTimeout(() => {
				ServerAPI.getHotelsWithinRange(minVal, maxVal, response => {
					if (response.status === 200) {
						for (let i = 0; i < response.data.length; i++)
							response.data[i].image = ServerAPI.server + response.data[i].image;
						displayHotels(response.data);
					}
				});
			}, 800);
		});
	});
}