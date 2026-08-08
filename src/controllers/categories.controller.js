import Category from '../db/models/Category.js'

export async function getCategoriesController(req, res, next) {
  try {
    const categories = await Category.findAll({
      attributes: ['id_category', 'name'],
    })

    res.status(200).json({
      success: true,
      categories,
    })
  } catch (err) {
    next(err)
  }
}
