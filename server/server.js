const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = 5000;
const server = 'http://localhost:5001';

app.use("/styles", express.static(path.join(__dirname, '../styles')));
app.use("/scripts", express.static(path.join(__dirname, '../scripts')));
app.use("/assests", express.static(path.join(__dirname, '../assests')));

const ROUTER = express.Router({
    caseSensitive: true,
    strict       : true
});

app.use(ROUTER);

ROUTER.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
})
.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, '../test.html'));
})
.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, '../registration.html'));
})
.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../login.html'));
})
.get('/tourism', (req, res) => {
    res.sendFile(path.join(__dirname, '../tourism.html'));
})
.get('/vehicle-booking', (req, res) => {
    res.sendFile(path.join(__dirname, '../vehicle_booking.html'));
})
.get('/hotels', (req, res) => {
    res.sendFile(path.join(__dirname, '../hotels.html'));
})
.get('/introduction', (req, res) => {
    res.sendFile(path.join(__dirname, '../introduction.html'));
})
.get('/history-and-heritage', (req, res) => {
    res.sendFile(path.join(__dirname, '../history_and_heritage.html'));
})
.get('/economy', (req, res) => {
    res.sendFile(path.join(__dirname, '../economy.html'));
})
.get('/festival', (req, res) => {
    res.sendFile(path.join(__dirname, '../festival.html'));
})
.get('/sports', (req, res) => {
    res.sendFile(path.join(__dirname, '../sports.html'));
})
.get('/health', (req, res) => {
    res.sendFile(path.join(__dirname, '../health.html'));
})
.get('/parks', (req, res) => {
    res.sendFile(path.join(__dirname, '../parks.html'));
})
.get('/offers', (req, res) => {
    res.sendFile(path.join(__dirname, '../offers.html'));
})
.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../profile_details.html'));
})
.get('/booked-vehicles', (req, res) => {
    res.sendFile(path.join(__dirname, '../booked_vehicles.html'));
})
.get('/local-employment', (req, res) => {
    res.sendFile(path.join(__dirname, '../local_employment.html'));
})
.get('/admin/:uid', (req, res) => {
    fetch(`${ server }/admin/${ req.params.uid }`)
    .then(response => {
        if (response.status === 200)
            res.sendFile(path.join(__dirname, '../admin_dashboard.html'));
        else
            res.sendStatus(401);
    });
});

app.use((req, res, next) => {
    res.sendStatus(404);
});

app.listen(PORT, () => {
    console.log(`Visit: http://localhost:${PORT}`);
});