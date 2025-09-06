// ===== Initialize localStorage =====
function initializeApp(){
  if(!localStorage.getItem("users")) localStorage.setItem("users", JSON.stringify([]));
  if(!localStorage.getItem("products")) localStorage.setItem("products", JSON.stringify([]));
  if(!localStorage.getItem("cart")) localStorage.setItem("cart", JSON.stringify([]));
  if(!localStorage.getItem("purchases")) localStorage.setItem("purchases", JSON.stringify([]));
}

initializeApp();

// Reset App
function resetApp(){
  if(confirm("Are you sure you want to clear all data?")){
    localStorage.clear();
    initializeApp();
    alert("App reset!");
    window.location.href="index.html";
  }
}

// ===== Signup =====
const signupForm = document.getElementById("signupForm");
if(signupForm){
  signupForm.addEventListener("submit", e=>{
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users"));
    const newUser = {
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    };
    if(users.find(u=>u.email===newUser.email)){ alert("Email exists!"); return;}
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    alert("Account created!");
    window.location.href="index.html";
  });
}

// ===== Login =====
const loginForm = document.getElementById("loginForm");
if(loginForm){
  loginForm.addEventListener("submit", e=>{
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users"));
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const user = users.find(u=>u.email===email && u.password===password);
    if(user){
      localStorage.setItem("currentUser", JSON.stringify(user));
      window.location.href="dashboard.html";
    }else alert("Invalid email/password!");
  });
}

// ===== Display username =====
const usernameSpan = document.getElementById("username");
if(usernameSpan){
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if(!currentUser){ window.location.href="index.html"; }
  else usernameSpan.innerText = currentUser.username;
}

// ===== Add Product =====
const addForm = document.getElementById("addForm");
if(addForm){
  addForm.addEventListener("submit", e=>{
    e.preventDefault();
    const products = JSON.parse(localStorage.getItem("products"));
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const fileInput = document.getElementById("productImage");
    const reader = new FileReader();
    reader.onload = function(){
      const newProduct = {
        id: Date.now(),
        title: document.getElementById("title").value,
        category: document.getElementById("category").value,
        description: document.getElementById("description").value,
        price: parseFloat(document.getElementById("price").value),
        image: reader.result,
        seller: currentUser.email
      };
      products.push(newProduct);
      localStorage.setItem("products", JSON.stringify(products));
      alert("Product added!");
      window.location.href="my_listings.html";
    }
    reader.readAsDataURL(fileInput.files[0]);
  });
}

// ===== My Listings =====
const myProductsDiv = document.getElementById("myProducts");
if(myProductsDiv){
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  let products = JSON.parse(localStorage.getItem("products")).filter(p=>p.seller===currentUser.email);

  function renderMyProducts(){
    myProductsDiv.innerHTML = "";
    products.forEach(p=>{
      myProductsDiv.innerHTML += `
      <div class="productCard">
        <img src="${p.image || 'images/placeholder.png'}">
        <div class="productInfo">
          <h3>${p.title}</h3>
          <p class="price">$${p.price}</p>
          <button onclick="editProduct(${p.id})">Edit</button>
          <button onclick="deleteProduct(${p.id})">Delete</button>
        </div>
      </div>`;
    });
  }

  renderMyProducts();

  window.deleteProduct = function(id){
    if(confirm("Delete this product?")){
      products = products.filter(p=>p.id!==id);
      let allProducts = JSON.parse(localStorage.getItem("products")).filter(p=>p.id!==id);
      localStorage.setItem("products", JSON.stringify(allProducts));
      renderMyProducts();
    }
  }

  window.editProduct = function(id){
    const product = products.find(p=>p.id===id);
    const newTitle = prompt("Edit title:", product.title);
    if(newTitle!==null) product.title=newTitle;
    const newPrice = prompt("Edit price:", product.price);
    if(newPrice!==null) product.price=parseFloat(newPrice);
    const newDesc = prompt("Edit description:", product.description);
    if(newDesc!==null) product.description=newDesc;

    let allProducts = JSON.parse(localStorage.getItem("products"));
    const idx = allProducts.findIndex(p=>p.id===id);
    allProducts[idx]=product;
    localStorage.setItem("products", JSON.stringify(allProducts));

    renderMyProducts();
  }
}

// ===== Product Feed for Dashboard =====
function renderProductFeed(){
  const feedDiv = document.getElementById("productFeed");
  if(!feedDiv) return;
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const searchText = document.getElementById("search").value.toLowerCase();
  const products = JSON.parse(localStorage.getItem("products")).filter(p=>{
    return p.title.toLowerCase().includes(searchText) && p.seller!==currentUser.email;
  });
  feedDiv.innerHTML = "";
  products.forEach(p=>{
    feedDiv.innerHTML += `
      <div class="productCard">
        <img src="${p.image}">
        <div class="productInfo">
          <h3>${p.title}</h3>
          <p class="price">$${p.price}</p>
          <button onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>`;
  });
}

// ===== Add to Cart =====
function addToCart(id){
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  let cart = JSON.parse(localStorage.getItem("cart"));
  const product = JSON.parse(localStorage.getItem("products")).find(p=>p.id===id);
  product.buyer = currentUser.email;
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart!");
}

// ===== Render Cart =====
const cartDiv = document.getElementById("cartItems");
if(cartDiv){
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const cart = JSON.parse(localStorage.getItem("cart")).filter(c=>c.buyer===currentUser.email);
  let total=0;
  cartDiv.innerHTML="";
  cart.forEach(p=>{
    total+=p.price;
    cartDiv.innerHTML += `
      <div class="productCard">
        <img src="${p.image}">
        <div class="productInfo">
          <h3>${p.title}</h3>
          <p class="price">$${p.price}</p>
        </div>
      </div>`;
  });
  cartDiv.innerHTML += `<h3>Total: $${total}</h3>`;
}

// ===== Previous Purchases =====
const prevDiv = document.getElementById("previousItems");
if(prevDiv){
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const purchases = JSON.parse(localStorage.getItem("purchases")).filter(c=>c.buyer===currentUser.email);
  prevDiv.innerHTML="";
  purchases.forEach(p=>{
    prevDiv.innerHTML += `
      <div class="productCard">
        <img src="${p.image}">
        <div class="productInfo">
          <h3>${p.title}</h3>
          <p class="price">$${p.price}</p>
        </div>
      </div>`;
  });
}
