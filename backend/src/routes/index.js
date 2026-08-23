// Mounts every route module onto one router — server.js only needs to know about this file.
const express = require("express");

const router = express.Router();

router.use(require("./health"));
router.use(require("./analytics"));
router.use(require("./caseCrud"));
router.use(require("./rights"));
router.use(require("./evidence"));
router.use(require("./formFiller"));
router.use(require("./complaints"));
router.use(require("./handoff"));

module.exports = router;
