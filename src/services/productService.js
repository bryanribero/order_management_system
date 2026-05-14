import Product from '../db/models/Product.js'

async function createProduct() {
  const product = await Product.create({
    id_user: 1,
    sku: 'ASF5432',
    name: 'Palo',
    price: 200,
    stock: 10,
  })

  console.log(product.toJSON())
}

async function updateProduct() {
  const product = await Product.update(
    {
      name: 'television',
    },
    {
      where: {
        id_product: 1,
      },
      returning: true,
    }
  )

  product[1].map((i) => console.log(i.toJSON()))
}
updateProduct()
//createProduct()
