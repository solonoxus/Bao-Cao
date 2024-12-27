const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const UserModel = require("../models/user");
const ProductModel = require("../models/newproduct");

const jwt = require("jsonwebtoken");
const url = require("url");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = {
  //Sign Up new User
  //Render

  getSignUp: function (req, res, next) {
    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render("user/signup", {
      path: "/signup",
      pageTitle: "signup",
      errorMessage: message,
      userr: null,
    });
  },

  postSignUp: function (req, res, next) {
    const { username, password, email, age, phone, address, confirmpassword } =
      req.body;

    const today = new Date();
    var date_format = new Date(today).toDateString("yyyy-MM-dd");
    const created = date_format;
    UserModel.findOne({
      username: username,
    })
      //Render Signup nếu sai
      .then(function (user) {
        if (user) {
          return res.render("user/signup", {
            path: "/signup",
            errorMessage: "Username exists already~!",
            error: console.log("Already"),
            userr: null,
          });
        }
        if (username == "" || password == "") {
          return res.render("user/signup", {
            path: "/signup",
            errorMessage: "Invalid Username or Password",
            error: console.log("Invalid"),
          });
        }
        if (password != confirmpassword) {
          return res.render("user/signup", {
            path: "/signup",
            errorMessage: "Password and Confirmpassword not same",
            error: console.log("Not same"),
          });
        }
        //Mã hóa password với bcrypt
        return bcrypt
          .hash(password, 12)
          .then(function (hashpassword) {
            const userData = new UserModel({
              username: username,
              password: hashpassword,
              email: email,
              age: age,
              phone: phone,
              address: address,
              created: created,
            });
            return userData.save({
              alo: console.log("Save Done"),
            });
          })
          .then(function (result) {
            res.redirect("/login");
          });
      })

      .catch(function (err) {
        res.send("error: " + err);
      });
  },

  //Login User
  getLogin: function (req, res, next) {
    console.log(
      "TCL: process.env.SECRETKEY_TOKEN",
      process.env.SECRETKEY_TOKEN
    );

    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render("user/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: message,
      userr: null,
    });
  },

  postLogin: function (req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    // Kiểm tra tài khoản admin đặc biệt
    if (username === "loc" && password === "1234567") {
      req.session.isLoggedIn = true;
      req.session.role = "admin";
      req.session.user = {
        username: username,
        role: "admin",
      };
      return req.session.save((err) => {
        return res.redirect("/adminTin");
      });
    }

    // Xử lý đăng nhập thông thường
    UserModel.findOne({ username: username })
      .then((user) => {
        if (!user) {
          return res.render("user/login", {
            path: "/login",
            errorMessage: "Tài khoản không tồn tại",
            userr: null,
          });
        }

        // So sánh password
        bcrypt.compare(password, user.password).then((match) => {
          if (match) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.role = user.role;

            return req.session.save((err) => {
              if (user.role === "admin") {
                return res.redirect("/adminTin");
              }
              return res.redirect("/");
            });
          }

          return res.render("user/login", {
            path: "/login",
            errorMessage: "Mật khẩu không đúng",
            userr: null,
          });
        });
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/login");
      });
  },

  //Logout
  postLogout: function (req, res, next) {
    // huy session khi user dang xuat
    req.session.destroy((err) => {
      console.log(err);
      res.redirect("/");
    });
  },

  //Account
  getAccount: function (req, res, next) {
    res.render("user/account", {});
  },

  //Edit User
  postEditUser: function (req, res, next) {
    const userID = req.body._id;
    const age = req.body.age;
    const phone = req.body.phone;
    console.log("TCL: ", userID);
    UserModel.findById(userID)
      .then(function (user) {
        if (!user) {
          res.render("/login");
        }
        if (req.body.age == "" || req.body.phone == "") {
          return res.render("user/login", {
            path: "/login",
            errorMessage: "Age or Phone is Empty",
            userr: null,
          });
        }

        user.age = age;
        user.phone = phone;
        console.log(user);
        return user.save();
      })

      .then(function (result) {
        console.log("Complete Updated Completed user!");
        req.session.isLoggedIn = false;
        return res.redirect("/");
      })
      .catch(function (err) {
        console.log("TCL: ", err);
      });
  },

  //Cart
  getCartPage: function (req, res, next) {
    let message = req.flash("errorMessage");
    let boolError = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    if (boolError.length > 0) {
      boolError = "true";
    } else {
      boolError = "false";
    }
    UserModel.findById(req.session.user._id)
      .then((user) => {
        user
          .populate("cart.items.productId")
          .execPopulate()
          .then((user) => {
            let products = user.cart.items;
            console.log(products);
            res.render("product/page-cart", {
              path: "/cart",
              pageTitle: "Your Cart",
              products: products,
              sum: user.cart.sum,
              errorMessage: message,
              error: boolError,
            });
          });
      })
      .catch((err) => console.log(err));
  },

  //API show cart
  getCart: function (req, res, next) {
    UserModel.findById(req.session.user._id)
      .then((user) => {
        user
          .populate("cart.items.productId")
          .execPopulate()
          .then((user1) => {
            console.log("TCL: user.cart.sum", user1.cart.sum);
            res.json({
              sumPrice: user.cart.sum,
              products: user.cart.items,
            });
          });
      })
      .catch((err) => console.log(err));
  },

  //Add Product
  postCart: function (req, res, next) {
    console.log("Add Product to Cart");
    const productId = req.body.productId;
    console.log("TCL: productId", productId);
    var newQuantity = req.body.productNumber;
    console.log("TCL: newQuantity", newQuantity);
    ProductModel.findById(productId)
      .then((product) => {
        UserModel.findById(req.session.user._id).then((user) => {
          return user.addToCart(product, newQuantity);
        });
      })
      .then((result) => {
        res.redirect("/");
      });
  },

  //Remove Product in Cart
  postRemoveProductCart: function (req, res, next) {
    const productID = req.body.productId;
    console.log("TCL: productID", productID);
    UserModel.findById(req.session.user._id)
      .then((user) => {
        ProductModel.findById(productID).then((productDetail) => {
          return user.removeProductCart(productID, productDetail);
        });
      })
      .then((result) => {
        res.redirect("/");
      })
      .catch((err) => console.log(err));
  },

  //Update Cart
  postUpdateCart: async function (req, res, next) {
    try {
      var { productQuantity, productId } = req.body;
      var newQuantityArr = [];
      var productIdArr = [];

      if (typeof productId == "string") {
        newQuantityArr = productQuantity.split(",");
        productIdArr = productId.split(",");
      } else {
        newQuantityArr = productQuantity;
        productIdArr = productId;
      }

      const user = await UserModel.findById(req.session.user._id);
      const products = await ProductModel.find();

      for (let i = 0; i < productIdArr.length; i++) {
        const product = products.find(
          (p) => p._id.toString() === productIdArr[i].toString()
        );
        if (product) {
          const currentQuantityInCart =
            user.cart.items.find(
              (item) => item.productId.toString() === productIdArr[i].toString()
            )?.quantity || 0;
          const totalQuantity =
            currentQuantityInCart + parseInt(newQuantityArr[i]);

          if (totalQuantity > product.quantity) {
            req.flash(
              "errorMessage",
              `Số lượng sản phẩm ${product.productname} không đủ! Chỉ còn ${product.quantity} sản phẩm.`
            );
            return res.redirect("/cart");
          }
        }
      }

      const newUpdateItems = productIdArr.map((id, index) => ({
        ID: id,
        Quantity: newQuantityArr[index],
      }));

      await user.updatedCart(newUpdateItems);
      return res.redirect("/cart");
    } catch (err) {
      console.log(err);
      req.flash("errorMessage", "Đã xảy ra lỗi khi cập nhật giỏ hàng.");
      return res.redirect("/cart");
    }
  },
  postCheckout: async function (req, res) {
    try {
      const { name, mobilenumber, address } = req.body;

      // Lấy user hiện tại
      const user = await UserModel.findById(req.session.user._id);
      if (!user) {
        req.flash("error", "Không tìm thấy thông tin người dùng");
        return res.redirect("/cart");
      }

      // Thực hiện checkout
      const result = await user.CheckOut(name, mobilenumber, address);

      if (result) {
        user.productNewOrder.isCompleted = false;
  await user.save();
        // Cập nhật session
        const updatedUser = await UserModel.findById(user._id);
        req.session.user = updatedUser;

        req.flash("success", "Đặt hàng thành công!");
        return res.redirect("/");
      } else {
        req.flash("error", "Có lỗi xảy ra khi đặt hàng");
        return res.redirect("/cart");
      }
    } catch (err) {
      console.error(err);
      req.flash("error", "Có lỗi xảy ra");
      res.redirect("/cart");
    }
  },

  postCart: async function (req, res, next) {
    try {
      const productId = req.body.productId;
      var newQuantity = parseInt(req.body.productNumber);

      const product = await ProductModel.findById(productId);
      if (!product) {
        req.flash("errorMessage", "Sản phẩm không tồn tại.");
        return res.redirect("/");
      }

      const user = await UserModel.findById(req.session.user._id);
      const currentQuantityInCart =
        user.cart.items.find(
          (item) => item.productId.toString() === productId.toString()
        )?.quantity || 0;
      const totalQuantity = currentQuantityInCart + newQuantity;

      if (totalQuantity > product.quantity) {
        req.flash(
          "errorMessage",
          `Số lượng sản phẩm ${product.productname} không đủ! Chỉ còn ${product.quantity} sản phẩm.`
        );
        return res.redirect("/product/" + productId);
      }

      await user.addToCart(product, newQuantity);
      return res.redirect("/");
    } catch (err) {
      console.log(err);
      req.flash(
        "errorMessage",
        "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng."
      );
      return res.redirect("/");
    }
  },
  
};

//Update cart Post
/*  var productID = req.params._id;
    var action = req.query.action;
    UserModel.findById(req.session.user._id)
    .then(user=>{
      ProductModel.findById(productID)
      .then(productDetail=>{
        console.log(action)
        return user.updatedCart(productID,productDetail,action);
      })
    })
    .then(result => {
      res.redirect("/");
    })
     .catch(err => console.log(err));
     */
