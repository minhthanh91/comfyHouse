// const cartBtn = $('.cart-btn');
// const closeCartBtn = $('.close-cart');
// const clearCartBtn = $('.clear-cart');
// const cartDOM = $('.cart');
// const cartOverLay = $('.cart-overlay');
// const cartItems = $('.cart-items');
// const cartTotal = $('.cart-total');
// const cartContent = $('.cart-content');
// const productsDOM = $('.products-center');

// cart
let cart = [];
// bagBtns
let BagBtnsArr = [];

// getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch('./products.json');
      let data = await result.json();

      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (e) {
      console.log(e);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach((product) => {
      result += `
      <!-- single product below -->
          <article class="product">
            <div class="img-container">
              <img
                src="${product.image}"
                alt="product"
                class="product-img"
              />
              <button class="bag-btn" data-id="${product.id}">
                <i class="fas fa-shopping-cart"></i>add to cart
              </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
          </article>
      `;
    });
    $('.products-center').html(result);
  }

  getBagBtns() {
    let thisUI = this;

    $('.bag-btn').each(function (i) {
      BagBtnsArr = [...$('.bag-btn')];
      let id = String($(this).data('id'));
      let isInCart = cart.some((item) => item.id === id);
      if (isInCart) {
        $(this).text('In Cart').prop('disabled', true);
      }
      $(this).click(function (e) {
        $(this).text('In Cart').prop('disabled', true);
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add product to cart
        cart = [...cart, cartItem];
        // save cart to localStorage
        Storage.saveCart(cart);
        // set cart values
        thisUI.setCartValues(cart);
        // display cart item
        thisUI.addCartItem(cartItem);
        // show the cart
        thisUI.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    $('.cart-total').text(tempTotal.toFixed(2));
    $('.cart-items').text(itemsTotal);
  }

  addCartItem(item) {
    let CartItemAdd = `
    <div class="cart-item">            
            <img src="${item.image}" alt="product" />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id='${item.id}'>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id='${item.id}'></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id='${item.id}'></i>
            </div>
          </div>
          `;
    $('.cart-content').append(CartItemAdd);
  }

  showCart() {
    $('.cart-overlay').addClass('transparentBcg');
    $('.cart').addClass('showCart');
  }
  hideCart() {
    $('.cart-overlay').removeClass('transparentBcg');
    $('.cart').removeClass('showCart');
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    $('.cart-btn').click(() => this.showCart());
    $('.close-cart').click(() => this.hideCart());
  }
  populateCart(cart) {
    cart.forEach((item) => {
      this.addCartItem(item);
    });
  }

  cartLogic() {
    // clear cart button
    $('.clear-cart').click(() => this.clearCart());

    // cart functionality
    $('.cart-content').click((e) => {
      //if click [remove]
      if ($(e.target).hasClass('remove-item')) {
        let removeItem = $(e.target);
        let id = String(removeItem.data('id'));
        removeItem.parent().parent().remove();
        this.removeItem(id);
      } else if ($(e.target).hasClass('fa-chevron-up')) {
        let increase = $(e.target);
        let id = String(increase.data('id'));
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount++;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        increase.next().text(tempItem.amount);
      } else if ($(e.target).hasClass('fa-chevron-down')) {
        let decrease = $(e.target);
        let id = String(decrease.data('id'));
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount--;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          decrease.prev().text(tempItem.amount);
        } else {
          decrease.parent().parent().remove();
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartIDs = cart.map((item) => item.id);
    cartIDs.forEach((id) => this.removeItem(id));
    $('.cart-content').empty();
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    $(button).prop('disabled', false);
    $(button).html(`<i class="fas fa-shopping-cart"></i>add to cart`);
  }
  getSingleButton(id) {
    return BagBtnsArr.find((button) => String($(button).data('id')) === id);
  }
}

// localStorage
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

$(document).ready(function () {
  const ui = new UI();
  const products = new Products();
  // setup app
  ui.setupApp();
  ui.cartLogic();

  // get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagBtns();
    });
});
