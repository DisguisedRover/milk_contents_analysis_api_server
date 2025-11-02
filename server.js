const express = require('express');
const db = require('./lib/models/db');


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

app.use('/customers/', require('./lib/routes/customersRoutes'));
app.use('/categories/', require('./lib/routes/categoriesRoutes'));
app.use('/stockTransactions/', require('./lib/routes/stockTransactionRoutes'));
app.use('/warehouses/', require('./lib/routes/warehousesRoutes'));
app.use('/suppliers/', require('./lib/routes/suppliersRoutes')); 
app.use('/product/', require('./lib/routes/productRoutes'));
app.use('/auth/', require('./lib/routes/authRoutes'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;