const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');

// GET all categories
router.get('/', categoriesController.getAllCategories);

// POST a new category (base64 image in JSON body)
router.post('/', categoriesController.addCategory);

// PATCH update image for an existing category (base64 image in JSON body)
router.patch('/:id/image', categoriesController.updateCategoryImage);

module.exports = router;