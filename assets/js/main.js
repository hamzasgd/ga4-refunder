const clientIdInput = document.getElementById("clientId");
const concealedField = document.querySelector(".concealed-field");
const consoleElement = document.getElementById("console-message");
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

	// console.log(getFormValues());

	const updateInputFields = () => {
		document.getElementById("measurementId").value = measurementId;
		document.getElementById("apiKey").value = apiSecret;
	};

	const addItemGroup = () => {
		const container = document.getElementById("container");
		const itemGroup = document.createElement("div");
		itemGroup.classList.add("row,item-group,p-2"); // Add class for styling purposes
		itemGroup.innerHTML = `
		<div class="row">
		<div class="col-sm-3 mb-1 font-monospace">
		<input
			type="text"
			class="form-control"
			aria-label="Item ID"
			placeholder="Item ID"
			name="itemId[]"
			value=""
			required />
			</div>
		<div class="col-sm-3 mb-1 font-monospace">
			<input
				type="number"
				class="form-control"
				aria-label="Quantity"
				placeholder="Quantity"
				value=""
				name="quantity[]" />
		</div>
		<div class="col-sm-3 mb-1 font-monospace">
			<input
				type="number"
				class="form-control"
				aria-label="Price"
				placeholder="Price"
				value=""
				name="price[]" />
		</div>
		<div class="col-sm-3 mb-2">
			<button
				class="btn btn-danger btn-sm rounded-pill remove-item-group mb-4 px-3"
				type="button">
				Remove
			</button>
		</div>
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
		return url;
	};

	// URL with masked API secret to print in the codeblock
	const maskApiSecret = (url) => {
		const apiSecretRegex = /api_secret=([^&]+)/;
		const match = url.match(apiSecretRegex);
		if (match) {
			const apiSecret = match[1]; // Extract api_secret value
			const maskedLength = Math.max(apiSecret.length - 4, 0); // Calculate the number of characters to mask
			const maskedSecret =
				apiSecret.substring(0, 2) +
				"*".repeat(maskedLength) +
				apiSecret.substring(apiSecret.length - 2); // Leave first two and last two characters unmasked
			const maskedUrl = url.replace(
				apiSecretRegex,
				`api_secret=${maskedSecret}`
			);
			return maskedUrl;
		} else {
			return url; // If no api_secret found, return the original URL
		}
	};

	// Function to display URL and payload in code blocks
	const displayCodeBlock = () => {
		const url = updateUrl();
		const maskedUrl = maskApiSecret(url);
		urlBlock.textContent = `${maskedUrl}`;

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

	// Log messages in console
	const logMessage = (message) => {
		if (consoleElement) {
			// Get current date and time
			const now = new Date();
			const date = now.toLocaleDateString("en-CA");
			const time = now.toLocaleTimeString("en-CA", { hour12: false });
			const timestamp = `[${date} ${time}]`;

			// Construct log message with timestamp
			const logEntry = `${timestamp} ${message}\n`;

			// Append log entry to console element
			consoleElement.textContent += logEntry;
		} else {
			console.error("Error: Console element not found.");
		}
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

		try {
			const url = updateUrl(); // Update URL when input values change
			const response = await fetch(url, {
				method: "POST",
				body: JSON.stringify(payload),
			});

			// Check if response status is 204 (No Content), indicating no response body
			if (response.status === 204) {
				logMessage(
					`✅ ${transactionIdInput.value} - Refund event sent to MP 💪`
				);
				return; // Exit function since there's no response body
			}

			const data = await response.json();
			const serverResponse = data.validationMessages[0]?.description || "";
			const messageToLog = serverResponse
				? `❌ ${serverResponse} 😭`
				: `✅ ${transactionIdInput.value} - Valid payload 👌`;
			logMessage(messageToLog);
		} catch (error) {
			// Handle errors
			if (error instanceof SyntaxError) {
				logMessage("😭 Server response not in JSON format.");
			} else {
				logMessage(error);
			}
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
