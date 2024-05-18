let cartId = [];

// Function to fetch products from the API
async function fetch_api() {
    try {
        let response = await fetch("https://fakestoreapi.com/products");
        let data = await response.json();
        return data;
    } catch (err) {
        console.log("Some Error While Fetching Api", err);
        throw err; // Rethrow the error for handling outside this function if necessary
    }
}

let productCount = 4;

// Initialize the application when the window loads
window.onload = async () => {
    try {
        // Load cart items from localStorage
        let bagItemsStr = localStorage.getItem('bagItemsId');
        cartId = bagItemsStr ? JSON.parse(bagItemsStr) : [];
        displayBagIcon();
        await displayContent();
        await displayBagObjects();
        await displayBagItems();
        bagSummary();
    } catch (err) {
        console.error("Error on window load:", err);
    }
};

// Function for storing product id into bag items array
function addToBag(itemId) {
    cartId.push(itemId);
    localStorage.setItem('bagItemsId', JSON.stringify(cartId));
    displayBagIcon();
}

// Function for displaying product count in the bag icon
function displayBagIcon() {
    let bagItemCountElement = document.querySelector('.cart-icon');
    if (cartId.length > 0) {
        bagItemCountElement.innerText = cartId.length;
        bagItemCountElement.style.visibility = "visible";
    } else {
        bagItemCountElement.style.visibility = "hidden";
    }
}

// Load more products when the button is clicked
let btn = document.querySelector('.btn');
if (btn) {
    btn.addEventListener('click', async () => {
        productCount += 4;
        let loadBtn = document.querySelector('.loadBtn');
        let data = await fetch_api();
        await displayContent();
        if (productCount >= data.length) {
            loadBtn.style.display = "none";
        }
    });
}

// Show/hide "Go to Top" button based on scroll position
window.addEventListener("scroll", () => {
    let scrollPosition = window.scrollY;
    let gotoTopBtn = document.querySelector(".topBtn");
    if (scrollPosition < 10) {
        gotoTopBtn.style.display = "none";
    } else {
        gotoTopBtn.style.display = "block";
    }
    gotoTopBtn.addEventListener('click', () => {
        window.scrollTo(0, 0);
    });
});

// Function to display products on the page
async function displayContent(filterdata) {
    let items_container = document.querySelector(".products");
    if (!items_container) {
        return;
    }
    let data = await fetch_api();
    let displaySpace = document.querySelector(".products");
    let newElement = "";
    let button = document.querySelector('.load-btn');
    
    // Display either filtered data or the first set of products
    (filterdata || data.slice(0, productCount)).forEach((item) => {
        newElement += `<div class="product-container">
            <div class="product" id= ${item.id}>
            <img src="${item.image}" alt="" class="image">
            <div class="rating">${item.rating.rate} | ${item.rating.count}</div>
            <div class="title">${item.title}</div>
            <div class="description">${item.description}</div>
            <div class="read" onclick=toggleRead(${item.id})>Read More</div>
            <div class="price">RS ${item.price}</div>
            <div class="addto-cart" onclick="addToBag(${item.id})">Add To Cart</div>
            <div class="category">${item.category}</div>
            </div>
        </div>`;
    });
    displaySpace.innerHTML = newElement;
    button.innerHTML = `<button class="btn">Load Button</button>`;
}
displayContent();

// Debounce function to delay the execution of the input handler
function debounce(fun, delay) {
    let timer;
    return (...arg) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fun(...arg);
        }, delay);
    };
}

// Function to handle the search input
const myFunction = async (event) => {
    let data = await fetch_api();
    let filter = data.filter((item) => {
        return (
            item.title.toLowerCase().includes(event.target.value) ||
            item.description.toLowerCase().includes(event.target.value) ||
            item.price.toString().includes(event.target.value)
        );
    });
    displayContent(filter);
};

// Attach debounce to the search input
let input_data = document.querySelector(".search-input");
input_data.addEventListener('input', debounce(myFunction, 1000));

// Function to toggle the read more/less state
function toggleRead(Id) {
    let productId = document.getElementById(Id);
    let title = productId.querySelector('.title');
    let description = productId.querySelector('.description');
    let readBtn = productId.querySelector('.read');
    
    title.classList.toggle('toggleRead');
    description.classList.toggle('toggleRead');

    if (description.classList.contains("toggleRead")) {
        readBtn.innerText = 'Read Less';
        readBtn.style.color = "red";
    } else {
        readBtn.innerText = 'Read More';
        readBtn.style.color = "blue";
    }
}

let bagItemObject;
let convenience_fees = 99;
let discount = 10;
let delivery_time = "10 Oct 2023";
let return_time = 14;

// Function to generate HTML for each bag item
function generateHtml(bagItem) {
    return `<div class="bag-item-container">
        <div class="item-left-part">
          <img class="bag-item-img" src="${bagItem.image}">
        </div>
        <div class="item-right-part">
          <div class="item-name">${bagItem.title}</div>
          <div class="price-container">
            <span class="original-price">Rs ${bagItem.price}</span>
            <span class="discount-percentage">(${discount}% OFF)</span>
          </div>
          <div class="return-period">
            <span class="return-period-days">${return_time} days</span> return available
          </div>
          <div class="delivery-details">
            Delivery by
            <span class="delivery-details-days">${delivery_time}</span>
          </div>
        </div>
        <div class="remove-from-cart" onclick='removeToBag(${bagItem.id})'>X</div>
      </div>`;
}

// Function to display bag items
async function displayBagItems() {
    let displayContainerElement = document.querySelector(".bag-items-container");
    let html = '';
    
    await bagItemObject.forEach(bagItem => {
        html += generateHtml(bagItem);
    });
    displayContainerElement.innerHTML = html;
}

// Function to populate bag items from product data
async function displayBagObjects() {
    let items = await fetch_api();
    bagItemObject = cartId.map(itemId => {
        for (let i = 0; i < items.length; i++) {
            if (itemId == items[i].id) {
                return items[i];
            }
        }
    });
}

// Function to remove item from the bag
async function removeToBag(itemId) {
    cartId = cartId.filter(id => id !== itemId);
    localStorage.setItem('bagItemsId', JSON.stringify(cartId));
    displayBagIcon();
    await displayBagObjects();
    await displayBagItems();
    bagSummary();
}

// Function to display bag summary
function bagSummary() {
    let summary = document.querySelector('.bag-summary');
    let totalPrice = 0;
    let totalDiscount = 0;
    bagItemObject.forEach(bagItem => {
        totalPrice += bagItem.price;
        totalDiscount += Math.floor(bagItem.price * (discount / 100));
    });
    let finalPrice = Math.floor(totalPrice - totalDiscount + convenience_fees);

    summary.innerHTML = `<div class="bag-details-container">
        <div class="price-header">PRICE DETAILS (${cartId.length} Items) </div>
        <div class="price-item">
          <span class="price-item-tag">Total MRP</span>
          <span class="price-item-value">₹ ${totalPrice}</span>
        </div>
        <div class="price-item">
          <span class="price-item-tag">Discount on MRP</span>
          <span class="price-item-value priceDetail-base-discount">-₹ ${totalDiscount}</span>
        </div>
        <div class="price-item">
          <span class="price-item-tag">Convenience Fee</span>
          <span class="price-item-value">₹ ${convenience_fees}</span>
        </div>
        <hr>
        <div class="price-footer">
          <span class="price-item-tag">Total Amount</span>
          <span class="price-item-value">₹ ${finalPrice}</span>
        </div>
      </div>
      <button class="btn-place-order">
        <div class="css-xjhrni">PLACE ORDER</div>
      </button>`;
}
