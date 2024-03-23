// Run samplePayload() in the browser to auto fill
const samplePayload = async () => {
  // Function to click the "Add Item Group" button
  const clickAddItemButton = () => {
    document.getElementById('add-item-group').click();
  };

  // Function to remove the last item group
  const removeLastItemGroup = () => {
    document.querySelectorAll('button.remove-item-group')[2].click();
  };

  // Click the "Add Item Group" button three times concurrently
  await Promise.all(Array.from({ length: 3 }, () => clickAddItemButton()));

  // Wait for a short delay before continuing (if needed)
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(); // Resolve the promise after the delay
    }, 200);
  });

  // Fill form fields with example values
  const exampleValues = {
    clientId: 'exampleClientId',
    currency: 'USD',
    transactionAmount: '27.47',
    transactionId: 'exampleTransactionId',
    itemId: ['item1', 'item2', 'item3'], // Array of item IDs
    quantity: [2, 1, 3], // Array of quantities corresponding to each item
    price: [10.99, 5.49, 8.79], // Array of prices corresponding to each item
  };

  document.getElementById('clientId').value = exampleValues.clientId;
  document.getElementById('currency').value = exampleValues.currency;
  document.getElementById('transactionAmount').value =
    exampleValues.transactionAmount;
  document.getElementById('transactionId').value = exampleValues.transactionId;

  // Fill item fields dynamically (if needed)
  exampleValues.itemId.forEach((itemId, index) => {
    const itemInputs = document.querySelectorAll('input[name="itemId[]"]');
    if (itemInputs[index]) {
      itemInputs[index].value = itemId;
    }
  });

  exampleValues.quantity.forEach((quantity, index) => {
    const quantityInputs = document.querySelectorAll(
      'input[name="quantity[]"]',
    );
    if (quantityInputs[index]) {
      quantityInputs[index].value = quantity;
    }
  });

  exampleValues.price.forEach((price, index) => {
    const priceInputs = document.querySelectorAll('input[name="price[]"]');
    if (priceInputs[index]) {
      priceInputs[index].value = price;
    }
  });

  // Wait for a short delay before continuing (if needed)
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(); // Resolve the promise after the delay
    }, 200);
  });
  removeLastItemGroup();

  // Log a message once the process is completed
  console.log('🚀 Form filled with test data & the payload is updated.');
};

export default samplePayload;
