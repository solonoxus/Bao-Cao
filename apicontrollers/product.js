const bodyParser = require("body-parser");
//Model

const ProductModel = require("../models/newproduct");
const UserModel = require("../models/user");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = {
  /* NEW DB*/
  getAddProduct: function(req, res, next) {
    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    req.session.isManager = false;
    res.render("product/addproduct", {
      errorMessageProduct: message,
      successMessageProduct: null
    });
  },

//   postAddProduct: function(req, res, next) {
//     const {
//         productname,
//         price,
//         imagePath,
//         description,
//         quantity,
//         category
//     } = req.body;
//     const today = new Date();
//     var date_format = new Date(today).toDateString("yyyy-MM-dd");
//     const created = date_format;

//     ProductModel.findOne({ imagePath: imagePath })
//         .then(function(product) {
//             if (product) {
//                 return res.render("product/addproduct", {
//                     errorMessageProduct: "Product is Exists",
//                     productt: null
//                 });
//             }
//             if (
//                 productname == "" ||
//                 price == "" ||
//                 imagePath == "" ||
//                 description == ""
//             ) {
//                 return res.render("product/addproduct", {
//                     errorMessageProduct: "Product name or Price or Imagepath or Description is Empty",
//                     productt: null
//                 });
//             } else {
//                 const newproductData = new ProductModel({
//                     productname: productname,
//                     imagePath: imagePath,
//                     price: price,
//                     description: description,
//                     quantity: quantity,
//                     category: category,
//                     created: created
//                 });
//                 return newproductData.save().then(function(product) {
//                     console.log(product);
//                     res.render("product/addproduct", {
//                         successMessageProduct: "Product added successfully!",
//                         productt: null // Làm trống form
//                     });
//                 });
//             }
//         })
//         .catch(function(err) {
//             console.log(err);
//             res.render("product/addproduct", {
//                 errorMessageProduct: "An error occurred while adding the product.",
//                 productt: null
//             });
//         });
// },
postAddProduct: function(req, res, next) {
  const {
      productname,
      price,
      imagePath,
      description,
      quantity,
      category
  } = req.body;
  const today = new Date();
  var date_format = new Date(today).toDateString("yyyy-MM-dd");
  const created = date_format;

  // Kiểm tra các trường bắt buộc
  if (productname == "" || price == "" || imagePath == "" || description == "") {
      return res.render("product/addproduct", {
          errorMessageProduct: "Vui lòng điền đầy đủ thông tin sản phẩm",
          productt: null
      });
  }

  // Tự động xác định category dựa trên tên sản phẩm
  let detectedCategory = category;
  if (!detectedCategory) {
      const productNameLower = productname.toLowerCase();
      if (productNameLower.includes('iphone')) {
          detectedCategory = 'iphone';
      } else if (productNameLower.includes('macbook')) {
          detectedCategory = 'macbook';
      } else if (productNameLower.includes('watch') || productNameLower.includes('apple watch')) {
          detectedCategory = 'applewatch';
      } else if (productNameLower.includes('airpod')) {
          detectedCategory = 'airpods';
      } else {
          detectedCategory = 'other';
      }
  }

  // Tạo sản phẩm mới
  const newproductData = new ProductModel({
      productname: productname,
      imagePath: imagePath,
      price: price,
      description: description,
      quantity: quantity || 0, // Mặc định là 0 nếu không có số lượng
      category: detectedCategory,
      created: created
  });

  newproductData.save()
      .then(function(product) {
          console.log("Sản phẩm đã được thêm:", product);
          res.render("product/addproduct", {
            errorMessageProduct: null,
              successMessageProduct: "Thêm sản phẩm thành công!",
              productt: null
          });
      })
      .catch(function(err) {
          console.log(err);
          res.render("product/addproduct", {
              errorMessageProduct: "Có lỗi xảy ra khi thêm sản phẩm.",
              productt: null
          });
      });
},

  getProductDetail: function(req, res, next) {
    const productId = req.params._id;
    console.log("TCL: productId", productId)
    UserModel.find()
    .then(users => {
              ProductModel.findById(productId)
                    .then((productdetail) => {   
             
                      res.render("product/product-detail", {
                        product: productdetail
                      });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
    .catch(err => {
        console.log(err);
    });
  },
};
