const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const dotenv = require('dotenv/config');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = process.env.dbURI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(process.env.PORT || 3030))
  .catch((err) => console.log(err));



// routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'));

app.post('/verify', function (req, res) {
  const { token } = req.body;

  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, async (err, decodedToken) => {
      if (err) {
        res.status(400).json({
          error: "unverified"
      });
      }
      else {
        
        //let user = await User.findById(decodedToken.id);

        const user_id = decodedToken.id;
        const user_email = decodedToken.email;
        const user_role = decodedToken.role;
        
        res.status(201).json({
          user: {
            id: user_id,
            email: user_email,
            role: user_role
          },
          status: "verified"
        });
      }
    });
  }
  else {
    res.status(400).json({
      error: "unverified"
  });
  }
})

app.use(authRoutes);