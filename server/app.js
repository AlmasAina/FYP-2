const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helpdeskRoutes = require('./router/helpdeskroutes');

dotenv.config();
const app = express();

const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use('/api/helpdesk', helpdeskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});