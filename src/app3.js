let provider = new firebase.auth.GoogleAuthProvider();
let uid;
$("#login").click(function () {
    firebase.auth().signInWithPopup(provider).then(function (result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });
});

$("#logout").click(function () {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
    }).catch(function (error) {
        // An error happened.
    });
});

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {

        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        uid = user.uid;
        var providerData = user.providerData;
        // 如果使用者登入成功
        // 顯示 登出按鈕 隱藏 登入按鈕
        $("#username").removeClass("hidden");
        $("#username").text(displayName);
        $("#user-photo").removeClass("hidden");
        $("#user-photo").attr("src", photoURL);
        $("#login").addClass("hidden");
        $("#logout").removeClass("hidden");
        $("#checkout").removeClass("hidden");
    } else {
        // 如果使用者沒有登入
        // 顯示 登入按鈕 隱藏 登出按鈕
        $("#username").addClass("hidden");
        $("#user-photo").addClass("hidden");
        $("#login").removeClass("hidden");
        $("#logout").addClass("hidden");
        $("#checkout").addClass("hidden");

    }
});

if (localStorage["cart"] === undefined) {
    var cart = {};
} else {
    cart = JSON.parse(localStorage["cart"]);
    render();
};

// 1.取得一個產品的文件
// 1.1 建立一個文件的參考
let productsRef = db.collection("products");
// 1.2 使用文件參考取得資料
productsRef.get().then(function (snapshot) {
    // 2. 產生一張卡片，將內容替換成產品的資訊
    // 2.1 取得產品資料，建立產品物件
    snapshot.forEach(function (doc) {
        let product = doc.data();
        // 2.2 建立顯示用的模板
        let html =
            `<div class="card" id="${doc.id}">
      <img class="card-img-top" src="${product.imageUrl}" alt="Card image cap">
      <div class="card-body">
        <h5 class="card-title">${product.name}</h5>
        <p class="card-text">儲存空間:${product.storage}GB <br> 售價:${product.price}元</p>
        <a href="#" class="btn btn-primary" data-product-id="${doc.id}">購買</a>
      </div>
    </div>`;
        // 2.3 建立product 元素
        let $product = $(`<div class="col-md-3"></div>`);
        $product.html(html);

        // 3. 把卡片追加到products中
        $("#products").append($product);

        let $btn = $(`#${doc.id} .btn`);
        $btn.click(function (e) {
            e.preventDefault();
            let productId = $btn.attr("data-product-id")
            db
                .doc(`/products/${productId}`)
                .get()
                .then(function (doc) {
                    //alert("加入購物清單");
                    let selectedProduct = doc.data();
                    //console.log(selectedProduct);
                    //把資料加入購物車
                    if (cart[productId] === undefined) {
                        cart[productId] = {
                            product: selectedProduct,
                            count: 1
                        };
                    } else {
                        cart[productId].count++;
                    };
                    localStorage["cart"] = JSON.stringify(cart);
                    //繪製表格
                    render();
                });
        });
    });

});


function render() {
    $("#order-content").html("");
    let total = 0;
    Object.keys(cart).forEach(function (key) {
        let record = cart[key];
        let $row = $("<tr>");
        let html = `<td>${record.product.name} - ${record.product.storage}GB</td>
                    <td>${record.product.price}</td>
                    <td>${record.count}</td>
                    <td>${record.product.price * record.count}</td>`;
        $row.html(html);
        $row.appendTo($("#order-content"));
        total += record.product.price * record.count;
    });
    $("#total").text(`${total}元`);
}

$("#checkout").click(function () {
    var order = cart;
    order.uid = uid;
    db.collection("orders").add(order);
    alert("訂單已送出");
    cart = {};
    delete localStorage['cart'];
    render();
});

$("#remove-all").click(function () {
    cart = {};
    delete localStorage['cart'];
    render();
});