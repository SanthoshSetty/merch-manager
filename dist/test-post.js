"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Simple test file to check if POST endpoint works
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.post('/test', async (req, res) => {
    res.json({ success: true });
});
console.log('Test file compiled successfully');
//# sourceMappingURL=test-post.js.map