const express = require('express');
const db = require('./lib/models/db');


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());


app.use('/systemSettings/', require('./lib/routes/systemSettingsRoutes'));
app.use('/reorderLevels/', require('./lib/routes/reorderLevelsRoutes'));
app.use('/productBatches/', require('./lib/routes/productBatchesRoutes'));
app.use('/units/', require('./lib/routes/uintsRoutes'));
app.use('/stockTransfers/', require('./lib/routes/stockTransferRoutes'));
app.use('/srockLevels/', require('./lib/routes/stockLevelRoutes'));
app.use('/salesOrders/', require('./lib/routes/salesOrderRoutes'));
app.use('/purchaseOrders/', require('./lib/routes/purchaseOrderRoutes'));
app.use('/customers/', require('./lib/routes/customersRoutes'));
app.use('/categories/', require('./lib/routes/categoriesRoutes'));
app.use('/stockTransactions/', require('./lib/routes/stockTransactionRoutes'));
app.use('/warehouses/', require('./lib/routes/warehousesRoutes'));
app.use('/suppliers/', require('./lib/routes/suppliersRoutes')); 
app.use('/product/', require('./lib/routes/productDetailRoutes'));
app.use('/product/', require('./lib/routes/productRoutes'));
app.use('/auth/', require('./lib/routes/authRoutes'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;