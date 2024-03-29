const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Your Requested Listing Doesn't Exists !");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let urls = [];
  for (file in req.files) {
    urls.push(file.path);
  }
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = urls.map((item) => (
    {
      url: item,
      filename: "listingimage",
    }
  ));
  await newListing.save();
  req.flash("success", "New Listing Created !");
  res.redirect("/listings");

  //if we are changing something in db then async funct will be there
  //   let { image, price, location, country, description, title } = req.body;
  // if (!req.body.listing) {
  //   throw new ExpressError(400, "Send valid data for listing "); //bad request , client ki galti ki vajah se server is request ko handle nahi kar pa raha
  // }

  //either do server side schema validation using this
  // if (!newListing.title) {
  //   throw new ExpressError(400, "Title is missing ! ");
  // }
  // if (!newListing.price) {
  //   throw new ExpressError(400, "Price is missing ! ");
  // }
  // if (!newListing.description) {
  //   throw new ExpressError(400, "Description is missing ! ");
  // }
  // if (!newListing.location) {
  //   throw new ExpressError(400, "Location is missing ! ");
  // } or use joi and use middleware validateListing
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Your Requested Listing Doesn't Exists !");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image[0].url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing "); //bad request
  }

  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.files !== "undefined") {
    let urls = [];
    for (file in req.files) {
      urls.push(file.path);
    }
    listing.image = urls.map((item) => ({
      url: item,
      filename: "listingimage",
    }));

    await listing.save();
  }

  req.flash("success", "Listing Updated ! ");

  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted !");
  res.redirect("/listings");
};
