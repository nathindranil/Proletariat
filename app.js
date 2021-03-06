 var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    session = require("express-session"),
    methodOverride = require("method-override"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user"),
    Job = require('./models/job'),
    Review = require('./models/reviews'),
    MongoDBStore = require("connect-mongo")(session),
    app = express()

app.set("view engine", "ejs")

//mongoose.connect('mongodb://localhost:27017/majorproject', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: false, useFindAndModify: false});
mongoose.connect('mongodb+srv://team:hello@major-project.mclgk.mongodb.net/major-project?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false})

const secret = process.env.SECRET|| 'just a secret'

const store = new MongoDBStore({
  url: 'mongodb+srv://team:hello@major-project.mclgk.mongodb.net/major-project?retryWrites=true&w=majority',
  secret: 'justasecret',
  touchAfter: 24 * 3600
})

store.on("error", function(e) {
  console.log("SESSION STORE ERROR", e);
})

app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(__dirname + "/public"))
app.use(session({store,
                 secret: "Anything",
                 resave: false,
                 saveUninitialized: true
               }));
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
})

app.get("/", (req, res) => {
  res.render("landing")
})

app.post("/register", async (req, res) => {
  try {
    const username = req.body.regusername;
    const email = req.body.regemail;
    const password = req.body.regpassword;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if(err) return next(err)
      res.redirect('/')
    })
  } catch(e) {
       res.redirect("/login");
  }
})

app.get("/login", (req, res) => {
  res.render("authentication/login");
})

app.post("/login", passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
  res.redirect("/");
})

app.get("/:username/profile", (req, res) => {
  User.findOne({username: req.params.username}).populate("reviews").exec(function(err, user) {
    if(err) {
      console.log(err);
    } else {
      res.render("user/user", {user: user})
    }
  })
})

app.get("/find", (req, res) => {
  User.find({}, (err, user) => {
    if(err) {
      console.log(err);
    } else {
      res.render("user/finduser", {user: user});
    }
  })
})

app.post("/find", (req, res) => {
  User.findOne({username: req.body.searchuser}, (err, user) => {
    if(err) {
      console.log(err);
    } else {
      res.render("user/finduser", {user:user})
    }
  })
})

app.get("/:id/update", (req,res) => {
  User.findOne({_id: req.params.id}, (err, user) => {
    if(err) {
      console.log(err);
    } else {
      res.render("user/update", {user: user});
    }
  })
})

app.put("/:id/update", async (req, res) => {
  const user = await User.findByIdAndUpdate({_id: req.params.id}, {address: req.body.address, pincode: req.body.pincode, contact: req.body.phone})
  res.redirect(`/${user.username}/profile`)
})

app.post("/:id/reviews", (req, res) => {
  var review = {body: req.body.reviewbody, rating: req.body.reviewrating}
  User.findOne({_id: req.params.id}, (err, user) => {
    if(err) {
      console.log(err);
    } else {
      var reviews = new Review(review)
      user.reviews.push(reviews)
      reviews.save()
      user.save()
      res.redirect(`/${user.username}/profile`)
    }
  })
})


app.get("/:username/jobs", (req, res) => {
  res.render("job/job")
})

app.post("/:username/jobs", (req, res) => {
  var title = req.body.jobTitle
  var description = req.body.jobDescription
  var creator = {
    id: req.user._id,
    username: req.user.username
  }
  var date = new Date()
  var category = req.body.jobChoice;
  var newJob = {title: title, description: description, date: date, creator: creator, category: category}
  Job.create(newJob, (err, job) => {
    if(err) {
      console.log(err);
    } else {
      res.redirect("/")
    }
  })
})

app.get("/jobs", (req, res) => {
  Job.find({}, function(err, job) {
    if(err) {
      console.log(err);
    } else {
      res.render("job/showjobs", {job: job})
    }
  })
})

app.post("/findjob", (req, res) => {
  var regex = new RegExp(req.body.title, 'i')
  Job.find({title: regex}, (err, job) => {
    if(err) {
      console.log(err);
    } else {
      res.render("job/showjobs", {job:job})
    }
  })
})
  // Job.find({title: req.body.title}, (err, job) => {
  //   if(err) {
  //     console.log(err);
  //   } else {
  //     res.render("job/showjobs", {job: job})
  //   }
  // })

  app.get("/:id/details", (req, res) => {
    Job.findOne({_id: req.params.id}, (err, job) => {
      if(err) {
        console.log(err);
      } else {
        res.render("job/onejob", {job:job});
      }
    })
  })

app.get("/logout", (req, res) => {
  req.logout()
  res.redirect("/")
})

var port = process.env.PORT || 3000

app.listen(port, () => {
  console.log("Server has started")
})
