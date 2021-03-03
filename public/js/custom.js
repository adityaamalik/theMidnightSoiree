(function ($) {
  "use strict";

  $(function () {
    $("#tabs").tabs();
  });

  $(window).scroll(function () {
    var scroll = $(window).scrollTop();
    var box = $(".header-text").height();
    var header = $("header").height();

    if (scroll >= box - header) {
      $("header").addClass("background-header");
    } else {
      $("header").removeClass("background-header");
    }
  });

  $(".schedule-filter li").on("click", function () {
    var tsfilter = $(this).data("tsfilter");
    $(".schedule-filter li").removeClass("active");
    $(this).addClass("active");
    if (tsfilter == "all") {
      $(".schedule-table").removeClass("filtering");
      $(".ts-item").removeClass("show");
    } else {
      $(".schedule-table").addClass("filtering");
    }
    $(".ts-item").each(function () {
      $(this).removeClass("show");
      if ($(this).data("tsmeta") == tsfilter) {
        $(this).addClass("show");
      }
    });
  });

  // Window Resize Mobile Menu Fix
  mobileNav();

  // Scroll animation init
  window.sr = new scrollReveal();

  // Menu Dropdown Toggle
  if ($(".menu-trigger").length) {
    $(".menu-trigger").on("click", function () {
      $(this).toggleClass("active");
      $(".header-area .nav").slideToggle(200);
    });
  }

  function onScroll(event) {
    var scrollPos = $(document).scrollTop();
    $(".nav a").each(function () {
      var currLink = $(this);
      var refElement = $(currLink.attr("href"));
      if (
        refElement.position().top <= scrollPos &&
        refElement.position().top + refElement.height() > scrollPos
      ) {
        $(".nav ul li a").removeClass("active");
        currLink.addClass("active");
      } else {
        currLink.removeClass("active");
      }
    });
  }

  // Page loading animation
  $(window).on("load", function () {
    $("#js-preloader").addClass("loaded");
  });

  // Window Resize Mobile Menu Fix
  $(window).on("resize", function () {
    mobileNav();
  });

  // Window Resize Mobile Menu Fix
  function mobileNav() {
    var width = $(window).width();
    $(".submenu").on("click", function () {
      if (width < 767) {
        $(".submenu ul").removeClass("active");
        $(this).find("ul").toggleClass("active");
      }
    });
  }
})(window.jQuery);

//add to cart functionality

function addToCart() {
  // use this code if hex code are needed
  // const colors = document.getElementById("colorForm");
  // let selectedColor;
  // for (let i = 0; i < colors.length; i++) {
  //   if (colors[i].checked) {
  //     selectedColor = colors[i].value;
  //   }
  // }

  const id = document.getElementById("idOfProduct").innerText;
  const name = document.getElementById("nameOfProduct").innerText;
  const price = document.getElementById("priceOfProduct").innerText;
  const quantity = document.getElementById("quantityOfProduct").value;
  const size = document.getElementById("sizeOfProduct").value;
  const color = document.getElementById("colorOfProduct").value;
  const product = {
    id: id,
    name: name,
    price: price,
    size: size,
    quantity: quantity,
    color: color,
  };
  let products = [];
  if (JSON.parse(sessionStorage.getItem("products"))) {
    products = JSON.parse(sessionStorage.getItem("products"));
  } else {
    products = [];
  }
  products.push(product);
  sessionStorage.setItem("products", JSON.stringify(products));
  document.getElementById("addToCart").innerText = "Added";
  document.getElementById("addToCart").disabled = true;
}

function loadCheckout() {
  const products = JSON.parse(sessionStorage.getItem("products"));

  document.getElementById("itemsList").innerHTML = "";
  let finalPrice = 0;
  products.forEach((product) => {
    const priceStr = product.price.substring(1);

    finalPrice = finalPrice + parseInt(priceStr) * parseInt(product.quantity);

    const itemsList = document.getElementById("itemsList");

    const li = document.createElement("li");
    li.className = "list-group-item";
    li.style.margin = "0 0 -1px";

    const rowDiv = document.createElement("div");
    rowDiv.className = "row d-inline-row align-items-center";

    const colDiv1 = document.createElement("div");
    colDiv1.className = "col-1";

    const removeButton = document.createElement("button");
    removeButton.innerText = "-";
    removeButton.style.fontWeight = "bold";
    removeButton.style.backgroundColor = "white";
    removeButton.style.border = "1px solid black";

    removeButton.onclick = () => removeFromCart(product);

    const colDiv2 = document.createElement("div");
    colDiv2.className = "col-5";

    const strongName = document.createElement("strong");
    strongName.innerText = product.name + " (" + product.size + ")";
    strongName.className = "soiree";

    const pColor = document.createElement("p");
    pColor.innerText = product.color;

    const colDiv3 = document.createElement("div");
    colDiv3.className = "col-2";

    const quantityHeading = document.createElement("h5");
    quantityHeading.className = "text-right";
    quantityHeading.innerText = product.quantity;

    const colDiv4 = document.createElement("div");
    colDiv4.className = "col-3";

    const priceHeading = document.createElement("h5");
    priceHeading.className = "text-right";
    priceHeading.innerText =
      "₹ " + parseInt(priceStr) * parseInt(product.quantity);

    const innerRow = document.createElement("div");
    innerRow.className = "row d-inline";

    const innerCol1 = document.createElement("div");
    innerCol1.className = "col";

    const innerCol2 = document.createElement("div");
    innerCol2.className = "col";

    innerCol1.appendChild(strongName);
    innerCol2.appendChild(pColor);
    innerRow.appendChild(innerCol1);
    innerRow.appendChild(innerCol2);

    colDiv4.appendChild(priceHeading);

    colDiv3.appendChild(quantityHeading);

    colDiv2.appendChild(innerRow);

    colDiv1.appendChild(removeButton);

    rowDiv.appendChild(colDiv1);
    rowDiv.appendChild(colDiv2);
    rowDiv.appendChild(colDiv3);
    rowDiv.appendChild(colDiv4);

    li.appendChild(rowDiv);

    itemsList.appendChild(li);
  });

  document.getElementById("totalPrice").innerText = "₹ " + finalPrice;
}

function checkCart() {
  const count = JSON.parse(sessionStorage.getItem("products")).length;

  if (count > 0) {
    document.getElementById("cartCount").innerText = "(" + count + ")";
  }
}

function removeFromCart(product) {
  const products = JSON.parse(sessionStorage.getItem("products"));
  const filteredProducts = products.filter((prod) => {
    return (
      prod.id != product.id ||
      prod.size != product.size ||
      prod.quantity != product.quantity
    );
  });

  sessionStorage.setItem("products", JSON.stringify(filteredProducts));

  loadCheckout();
}

function submitOrder() {
  const products = JSON.parse(sessionStorage.getItem("products"));

  const submitForm = document.getElementById("contact");
  let counter = 1;

  const elements = document.getElementById("contact").elements;
  let someEmpty = false;

  for (let i = 0, element; (element = elements[i++]); ) {
    if (element.value === "" && element.type !== "submit") {
      someEmpty = true;
    }
  }

  if (
    products !== null &&
    products.length !== 0 &&
    typeof products !== "undefined" &&
    !someEmpty
  ) {
    products.forEach((product) => {
      const inputElement = document.createElement("input");
      inputElement.value = JSON.stringify(product);
      inputElement.name = "order" + counter;
      inputElement.type = "hidden";

      counter++;
      submitForm.appendChild(inputElement);
    });

    submitForm.submit();
    sessionStorage.removeItem("products");
  } else {
    alert("Please fill all fields and select some items !");
  }
}

function toggleSizeChart() {
  const sizeChart = document.getElementById("sizeChart");
  if (sizeChart.style.display == "none") {
    sizeChart.style.display = "block";
  } else {
    sizeChart.style.display = "none";
  }
}
