console.log("app.js loaded...");

const clientIdInput = document.getElementById("clientId");
const concealedField = document.querySelector(".concealed-field");
const currencyInput = document.getElementById("currency");
const debugCheckbox = document.getElementById("debug");
const passwordInput = document.getElementById("apiKey");
const payloadBlock = document.getElementById("payload-block");
const submitButton = document.getElementById("submit");
const toggleIcon = document.getElementById("togglePassword");
const transactionAmountInput = document.getElementById("transactionAmount");
const transactionIdInput = document.getElementById("transactionId");
const urlBlock = document.getElementById("url-block");
const validationBox = document.getElementById("validation-message");

document.addEventListener("DOMContentLoaded", () => {
	// Retrieve form values from local storage
	const getFormValues = () => ({
		measurementId: localStorage.getItem("measurementId") || "",
		apiSecret: localStorage.getItem("apiSecret") || "",
	});

	let { measurementId, apiSecret } = getFormValues();

	console.log(getFormValues());

	const updateInputFields = () => {
		document.getElementById("measurementId").value = measurementId;
		document.getElementById("apiKey").value = apiSecret;
	};

	const addItemGroup = () => {
		const container = document.getElementById("container");
		const itemGroup = document.createElement("div");
		itemGroup.classList.add("row,item-group,p-2"); // Add class for styling purposes
		itemGroup.innerHTML = `
		<div class="mb-1 font-monospace">
		<input
			type="text"
			class="form-control"
			aria-label="Item ID"
			placeholder="Item ID"
			name="itemId[]"
			required />
			</div>
		<div class="mb-1 font-monospace">
			<input
				type="number"
				class="form-control"
				aria-label="Quantity"
				placeholder="Quantity"
				name="quantity[]" />
		</div>
		<div class="mb-1 font-monospace">
			<input
				type="text"
				class="form-control"
				aria-label="Price"
				placeholder="Price"
				name="price[]" />
		</div>
		<div class="mb-2">
			<button
				class="btn btn-danger btn-sm remove-item-group mb-4 mt-2"
				type="button">
				Remove
			</button>
		</div>
        `;
		container.appendChild(itemGroup);

		itemGroup
			.querySelector(".remove-item-group")
			.addEventListener("click", function () {
				this.parentNode.parentNode.remove();
				displayCodeBlock(); // Update code blocks when a field group is removed
			});

		displayCodeBlock(); // Update code blocks when a new field group is added
	};

	// Display validation server related info
	const displayValidationBox = () => {
		validationBox.style.display = debugCheckbox.checked ? "block" : "none";
	};

	// Update submit button label when the validation server debugCheckbox is checked
	const updateSubmitButton = () => {
		submitButton.textContent = debugCheckbox.checked
			? "Validate Request"
			: "Send Refund";
		// Check if debugCheckbox is checked
		if (debugCheckbox.checked) {
			submitButton.classList.remove("btn-primary");
			submitButton.classList.add("btn-warning");
		} else {
			submitButton.classList.remove("btn-warning");
			submitButton.classList.add("btn-primary");
		}
	};

	// Update the MP URL when the validation server debugCheckbox is checked
	const updateUrl = () => {
		const endPoint = debugCheckbox.checked ? "debug/mp/collect" : "mp/collect";
		const url = `https://www.google-analytics.com/${endPoint}?measurement_id=${measurementId}&api_secret=${apiSecret}`;

		if (debugCheckbox.checked) {
			console.info(`Debug url enabled: ${url}`);
		}
		return url;
	};

	// Function to display URL and payload in code blocks
	const displayCodeBlock = () => {
		const url = updateUrl();
		urlBlock.textContent = `${url}`;

		const items = getItemsData();
		const payload = {
			client_id: clientIdInput.value,
			events: [
				{
					name: "refund",
					params: {
						currency: currencyInput.value.toUpperCase(),
						transaction_id: transactionIdInput.value,
						value: transactionAmountInput.value,
						items,
					},
				},
			],
		};
		payloadBlock.textContent = `${JSON.stringify(payload, null, 2)}`;
	};

	// Construct items array
	const getItemsData = () => {
		const itemIds = [...document.querySelectorAll('input[name="itemId[]"]')];
		const quantities = [
			...document.querySelectorAll('input[name="quantity[]"]'),
		];
		const prices = [...document.querySelectorAll('input[name="price[]"]')];

		return itemIds.map((itemIdElement, index) => {
			const itemId = itemIdElement.value;
			const quantity = parseInt(quantities[index].value, 10) || 1;
			const price = prices[index].value
				? parseFloat(prices[index].value).toFixed(2)
				: undefined;

			return {
				item_id: itemId,
				quantity,
				price,
			};
		});
	};

	const sendRefund = async (event) => {
		event.preventDefault();
		const items = getItemsData();

		// Log the request payload before sending it
		const payload = {
			client_id: clientIdInput.value,
			events: [
				{
					name: "refund",
					params: {
						currency: currencyInput.value.toUpperCase(),
						transaction_id: transactionIdInput.value,
						value: transactionAmountInput.value,
						items,
					},
				},
			],
		};
		const payloadString = JSON.stringify(payload, null, 2);
		console.log("%cPayload:", "font-weight: bold; color: blue;");
		console.log(payloadString);

		try {
			const url = updateUrl(); // Update URL when input values change
			const response = await fetch(url, {
				method: "POST",
				body: JSON.stringify(payload),
			});

			const data = await response.json();
			const serverResponse = data.validationMessages[0]?.description || "";
			const messageToLog = serverResponse
				? `😭 ${serverResponse}`
				: "✅ No errors found in payload";
			console.log("Server response:", messageToLog);
		} catch (error) {
			// Handle errors
			console.error("Error:", error);
		}
	};

	// Event listener to the debugCheckbox to update the button text dynamically
	debugCheckbox.addEventListener("change", () => {
		updateSubmitButton();
		displayValidationBox();
		displayCodeBlock(); // Update code blocks when debug checkbox is interacted with
	});

	// Event listener to update local storage when input values change
	document.querySelectorAll("#measurementId, #apiKey").forEach((input) => {
		input.addEventListener("input", () => {
			measurementId = document.getElementById("measurementId").value;
			apiSecret = document.getElementById("apiKey").value;

			localStorage.setItem("measurementId", measurementId);
			localStorage.setItem("apiSecret", apiSecret);

			displayCodeBlock(); // Update code blocks when input values change
		});
	});

	// Event listener to add item field groups
	document.getElementById("add-item-group").addEventListener("click", () => {
		addItemGroup(); // Update code blocks when a new field group is added
	});

	// Event listener to send refund payload on form submit
	document.getElementById("refund-form").addEventListener("submit", sendRefund);

	// Event listener to update code block on form field change
	document
		.querySelectorAll(
			"#clientId, #currency, #transactionAmount, #transactionId, input[name^='itemId'], input[name^='quantity'], input[name^='price']"
		)
		.forEach((input) => {
			input.addEventListener("input", () => {
				displayCodeBlock(); // Update code blocks in real-time
			});
		});

	// Event listener to reveal API key
	concealedField.addEventListener("click", function () {
		if (passwordInput.type === "password") {
			passwordInput.type = "text";
			toggleIcon.classList.remove("bi-eye-slash");
			toggleIcon.classList.add("bi-eye");
		} else {
			passwordInput.type = "password";
			toggleIcon.classList.remove("bi-eye");
			toggleIcon.classList.add("bi-eye-slash");
		}
	});

	// Call functions
	updateInputFields();
	updateSubmitButton();
	displayValidationBox();
	displayCodeBlock(); // Initial display of code block

	// Update code blocks when debug checkbox is initially checked
	if (debugCheckbox.checked) {
		displayCodeBlock();
	}
});
