const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const mongoClient = require("mongodb").MongoClient;
const UserModel = require("../models/user");
const ProductModel = require("../models/newproduct");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function(app) {
 
  app.get("/", function(req, res, next) {
    req.session.isManager = false;

    ProductModel.find()
      .then(products => {
        console.log("Tất cả sản phẩm:", products.map(p => ({name: p.productname, category: p.category})));
        var dataiPhone = products.filter(i => i.category == "iPhone");
        var dataMacbook = products.filter(i => i.category.toLowerCase().replace(/\s/g, '') == "macbook");
        var dataAppleWatch = products.filter(i => i.category.toLowerCase().replace(/\s/g, '') == "applewatch");
        var dataAirpods = products.filter(i => i.category == "airpods");
        console.log("iPhone:", dataiPhone.length);
        console.log("Macbook:", dataMacbook.length);
        console.log("Apple Watch:", dataAppleWatch.length);
        console.log("Airpods:", dataAirpods.length);
        res.render("homepage", {
          listproducts: dataiPhone,
          listmacbooks: dataMacbook,
          listapplewatch: dataAppleWatch,
          listairpod: dataAirpods
        });
      })
      .catch(err => {
        console.log(err);
      });
  });

  app.get("/contact", function(req, res, next) {
    res.render("general/contact", {
    });
  }),
    app.get("/about", function(req, res, next) {
      res.render("general/about", {
      });
    });

  app.get("/blog", function(req, res, next) {
    res.render("general/blog", {
    });
  });

  //iPhone
  app.get("/iPhone", function(req, res, next) {
      req.session.isManager = false;
      ProductModel.find()
        .then(products => {
          var data = products.filter(i => i.category == "iPhone");
          res.render("product/page-product", {
              kind: 'iphone',
              listproducts: data
            });
        })
        .catch(err => {
          console.log(err);
        });
  });

  //Macbook
  app.get("/macbook", function(req, res, next) {
    req.session.isManager = false;
    ProductModel.find()
      .then(products => {
        var data = products.filter(i => i.category.toLowerCase() == "macbook");
        res.render("product/page-product", {
          kind: 'macbook',
          listproducts: data
        });
      })
      .catch(err => {
        console.log(err);
      });
  });

  //Apple Watch
  app.get("/applewatch", function(req, res, next) {
    req.session.isManager = false;
    ProductModel.find()
      .then(products => {
        var data = products.filter(i => i.category.toLowerCase().replace(/\s/g, '') == "applewatch");
        res.render("product/page-product", {
          kind: 'applewatch',
          listproducts: data
        });
      })
      .catch(err => {
        console.log(err);
      });
  });

  //airpods
  app.get("/airpod", function(req, res, next) {
    req.session.isManager = false;
    ProductModel.find()
      .then(products => {
        var data = products.filter(i => i.category.toLowerCase().replace(/\s/g, '') == "airpods");
        res.render("product/page-product", {
          kind: 'airpods',
          listproducts: data
        });
      })
      .catch(err => {
        console.log(err);
      });
  });

   //airpods
   app.get("/airpod", function(req, res, next) {
    req.session.isManager = false;
    ProductModel.find()
      .then(products => {
        var data = products.filter(i => i.category.toLowerCase().replace(/\s/g, '') == "airpods");
        res.render("product/page-product", {
          kind: 'airpods',
          listproducts: data
        });
      })
      .catch(err => {
        console.log(err);
      });
  });


  //allproduct
  app.get("/allproducts", function(req, res, next) {
    req.session.isManager = false;
    var count = 0;
    ProductModel.find()
      .then(products => {
        res.render("product/page-product", {
          kind: 'allproducts',
          listproducts: products
        });
      })
      .catch(err => {
        console.log(err);
      });
  });
};
