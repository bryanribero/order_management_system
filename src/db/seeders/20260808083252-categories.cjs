'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('categories', [
      { name: 'Alimentos' },
      { name: 'Bebidas' },
      { name: 'Limpieza' },
      { name: 'Higiene y cuidado personal' },
      { name: 'Hogar' },
      { name: 'Ropa' },
      { name: 'Calzado' },
      { name: 'Accesorios' },
      { name: 'Electrónica' },
      { name: 'Informática' },
      { name: 'Herramientas' },
      { name: 'Construcción' },
      { name: 'Automotor' },
      { name: 'Deportes' },
      { name: 'Juguetes' },
      { name: 'Librería y papelería' },
      { name: 'Mascotas' },
      { name: 'Belleza y cosmética' },
      { name: 'Jardinería' },
      { name: 'Otros' },
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {})
  },
}
