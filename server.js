const express = require('express');
const db = require('./lib/models/db');


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

app.use('/suppliers/', require('./lib/routes/supplersRoutes')); 
app.use('/product/', require('./lib/routes/productRoutes'));
app.use('/auth/', require('./lib/routes/authRoutes'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;