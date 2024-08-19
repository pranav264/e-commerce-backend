const sendStatus = (res, message) => {
    res.status(res.statusCode).json(message);
}

module.exports = sendStatus;