"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var eth_sig_util_1 = require("eth-sig-util");
var router = express_1.Router();
router.post("/recover", function (req, res) {
    res.setHeader("Content-Type", "application/json");
    var recoveryFunction = req.body.legacy
        ? eth_sig_util_1.recoverTypedSignatureLegacy
        : eth_sig_util_1.recoverTypedSignature;
    try {
        var recoveredAddress = recoveryFunction({
            data: req.body.data,
            sig: req.body.sig
        });
        res.send(JSON.stringify({ recoveredAddress: recoveredAddress }));
    }
    catch (e) {
        console.log(e);
        res.status(400);
        var message = "Something went wrong when attempting to recover the typed signature. Please try again after checking your data and sig";
        res.send(JSON.stringify({ message: message }));
    }
});
exports.MessageController = router;
