const express = require("express");
const router = express.Router();
const lightwallet = require("eth-lightwallet"); // TIP! github: https://github.com/ConsenSys/eth-lightwallet#readme
const fs = require("fs");

// 랜덤한 니모닉 코드 생성
router.post("/newMnemonic", async (req, res) => {
  let mnemonic;
  try {
    // generateRandomSeed(): Generates a string consisting of a random 12-word seed and returns it.
    mnemonic = lightwallet.keystore.generateRandomSeed();
    res.json({ mnemonic });
  } catch (err) {
    console.log(err);
  }
});

// 니모닉 코드와 패스워드를 이용해 keystore와 address 생성
router.post("/newWallet", async (req, res) => {
  let password = req.body.password;
  let mnemonic = req.body.mnemonic;

  try {
    // createVault(options, callback): the interface to create a new lightwallet keystore.
    lightwallet.keystore.createVault(
      {
        password: password,
        seedPhrase: mnemonic, //Optionally provide a 12-word seed phrase
        hdPathString: "m/0'/0'/0'", // Optional custom HD Path String; default:"m/0'/0'/0'"
      },
      function (err, ks) {
        // Some methods will require providing the `pwDerivedKey`,
        // Allowing you to only decrypt private keys on an as-needed basis.
        // You can generate that value with this convenient method:
        ks.keyFromPassword(password, function (err, pwDerivedKey) {
          // generateNewAddress(pwDerivedKey, [num]): default of num = 1
          // generate 'num' new address/private key pairs
          // the corresponding private keys are also encrypted
          ks.generateNewAddress(pwDerivedKey, 1);
          // getAddresses(): Returns a list of hex-string addresses currently stored in the keystore.
          let address = ks.getAddresses().toString();
          // serialize(): Serializes the current keystore object into a JSON-encoded string and returns that string.
          let keystore = ks.serialize();

          fs.writeFile("wallet.json", keystore, function (err, data) {
            if (err) {
              res.json({ code: 999, message: "실패" });
            } else {
              res.json({ code: 1, message: "성공" });
            }
          });
        });
      }
    );
  } catch (exception) {
    console.log("NewWallet ==>>>> " + exception);
  }
});

module.exports = router;
