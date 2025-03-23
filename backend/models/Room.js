const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
    name: String,
    price: Number,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookedDates: [Date]
});

module.exports = mongoose.model("Room", RoomSchema);
