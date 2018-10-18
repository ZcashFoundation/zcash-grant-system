import { Router, Request, Response } from "express";
import {
  recoverTypedSignature,
  recoverTypedSignatureLegacy
} from "eth-sig-util";
const router: Router = Router();

router.post("/recover", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");

  const recoveryFunction = req.body.legacy
    ? recoverTypedSignatureLegacy
    : recoverTypedSignature;

  try {
    const recoveredAddress = recoveryFunction({
      data: req.body.body,
      sig: req.body.sig
    });
    res.send(JSON.stringify({recoveredAddress}));
  } catch (e) {
    res.status(400);
    const message =
      "Something went wrong when attempting to recover the typed signature. Please try again after checking your data and sig";
    res.send(JSON.stringify({ message }));
  }
});

export const MessageController: Router = router;
