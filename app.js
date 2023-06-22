'use strict';

let bookList = [],
  basketList = [];


toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-bottom-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}


const toggleModal = () => {
  const basketModalEL = document.querySelector(".basket__modal");
  basketModalEL.classList.toggle("active");
};

// veri alma
const getBooks = () => {
  fetch("./products.json")
    .then((res) => res.json())
    .then((books) => bookList = books
    )
};

getBooks();

const createBookStars = (starRate) => {
  console.log('createBookItemsHtml() çalıştı ')
  let starRateHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (Math.round(starRate) >= i)
      starRateHtml += '<i class="bi bi-star-fill active"></i>';
    else starRateHtml += '<i class="bi bi-star-fill"></i>'
  }

  return starRateHtml;
};

const createBookItemsHtml = () => {
  console.log('CLASITIMI')
  const bookListEl = document.querySelector(".book__list");
  let bookListHtml = "";
  console.log('bookList CLASITIMI', bookList)

  bookList.forEach((book, index) => {
    console.log('bookList CLASITIMI', book.imgSource)

    bookListHtml += ` 

    <div class= "col-5 ${index % 2 == 0 && "offset-2"} my-5 ">
       
    <div class="row book_card">
      <div class="col-6">
        <img
         class="img-fluid shadow" 
         width="258" 
         height="400"
         src="${book.imgSource}" />
      </div>

      <div class="col-6  d-flex flex-column justify-content-between">
        <div class="book__detail">
          <span class="fos gray fs-5">${book.author}</span> <br>
          <span class="fs-4 fw-bold">${book.name}</span> <br>
          <span class="book__star-rate">
          ${createBookStars(book.starRate)}
            <span class="gray">${book.reviewCount}reviews</span>
          </span>

        </div>
        <p class="book__description fos gray">
        ${book.description}
        </p>
        <div>
          <span class="black fw-bold fs-5 me-2">${book.price}₺</span>
          ${book.oldPrice ?
        ` <span class="fw-bold fs-5 old__price">${book.oldPrice}₺</span>` : ""
      }
        </div>
        <button class="btn__purple" onclick ="addBookToBasket(${book.id})">ADD BASKET</button>
      </div>
    </div>
  </div>`;
  });

  bookListEl.innerHTML = bookListHtml;
};

const BOOK_TYPES = {
  ALL: "Tümü",
  NOVEL: "Roman",
  CHILDREN: "Çocuk",
  SELFIMPROVEMENT: "Kişisel Gelişim",
  HİSTORY: "Tarih",
  FINANCE: "Finans",
  SCIENCE: "Bilim",
}

const createBookTypesHtml = () => {
  const filterEl = document.querySelector(".filter");
  let filterHtml = "";
  let filterTypes = ["ALL"];
  bookList.forEach((book) => {
    if (filterTypes.findIndex((filter) => filter == book.type) == -1)
      filterTypes.push(book.type);
  });


  filterTypes.forEach((type, index) => {
    filterHtml += `<li class="${index == 0 ? "active" : null}" onclick="filterBooks(this)" data-type="${type}" >${BOOK_TYPES[type] || type}</li>`;
  });
  filterEl.innerHTML = filterHtml;

  //   // BOOK_TYPES["ALL"]
  //   // // SWİTCH CASE YERİNE. daha pratik

};

const filterBooks = (filterEl) => {
  document.querySelector(".filter .active").classList.remove("active");
  filterEl.classList.add("active");
  let bookType = filterEl.dataset.type;
  getBooks();
  if (bookType != "ALL")
    bookList = bookList.filter((book) => book.type == bookType);
  createBookItemsHtml();
};



const listBasketItems = () => {
  localStorage.setItem("basketList" , JSON.stringify(basketList));
  const basketListEl = document.querySelector(".basket__list");
  const basketCountEl = document.querySelector(".basket__count")
  basketCountEl.innerHTML = basketList.length > 0 ? basketList.length : null;
  const totalPriceEl = document.querySelector(".total__price");

  let basketListHtml = "";
  let totalPrice = 0;
  basketList.forEach(item => {
    totalPrice += item.product.price * item.quantity;
    basketListHtml +=
      `<li class="basket__item">
    <img src="${item.product.imgSource}" alt="" width="100" height="100">
    <div class="basket__item-info">
      <h3 class="book__name">${item.product.name} </h3>
      <span class="book__price"> ${item.product.price} ₺</span>
      <span class="book__remove" onclick="removeItemToBasket(${item.product.id})">Kaldır</span>
    </div>
    <div class="book__count">
      <span class="decrease" onclick="decreaseItemToBasket(${item.product.id})">-</span>
      <span>${item.quantity}</span>
      <span class="increase" onclick="increaseItemToBasket(${item.product.id})">+</span>
    </div>
  </li>`

  });


  basketListEl.innerHTML = basketListHtml ? basketListHtml :
    `<li class="basket__item">No İtems to Buy again </li>`;
  totalPriceEl.innerHTML = totalPrice > 0 ? "Toplam :" + totalPrice.toFixed(2) + "₺" : null;
  //sayıları ondaklı göstermesin diye
};



const addBookToBasket = (bookId) => {
  let findedBook = bookList.find((book) => book.id == bookId);
  console.log('calıstımı', findedBook);
  if (findedBook) {
    const basketAlreadyIndex = basketList.findIndex(
      (basket) => basket.product.id == bookId

    );

    if (basketAlreadyIndex == -1) {
      let addedItem = { quantity: 1, product: findedBook };
      basketList.push(addedItem);
      // console.log('çalıştı', basketList)
    } else {
      if (
        basketList[basketAlreadyIndex].quantity <
        basketList[basketAlreadyIndex].product.stock
      )
      basketList[basketAlreadyIndex].quantity += 1;

      else{ 
        toastr.error("üzgünüm, stoklarımız bitmiştir.");
      return;
    }

    }
    listBasketItems();
    toastr.success("Başarılı bir şekilde sepete eklendi.")
  }
};

const removeItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(basket => basket.product.id == bookId);
  if (findedIndex != -1) {
    basketList.splice(findedIndex, 1);
  }
  listBasketItems();
};

const decreaseItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );

  if (findedIndex != -1) {
    if (basketList[findedIndex].quantity != 1)
      basketList[findedIndex].quantity -= 1;
    else removeItemToBasket(bookId);
    listBasketItems();
  }
};

const increaseItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId);

  if (findedIndex != -1) {
    if (
      basketList[findedIndex].quantity < basketList[findedIndex].product.stock
    )
      basketList[findedIndex].quantity += 1;
      else toastr.error("üzgünüm, stoklarımız bitmiştir.");
      listBasketItems();

  }
};


if(localStorage.getItem("basketList")){
  basketList = JSON.parse (localStorage.getItem("basketList"));
  listBasketItems();
}

setTimeout(() => {
  createBookItemsHtml();
  createBookTypesHtml();
}, 1000);


//toastr.info('are you ok')
// uyarı için kullanırsın. şeklini ve yazıyı tostr de değiştebilirsin.