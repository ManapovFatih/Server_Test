require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const Category = require('./models/category')
const Product = require('./models/product')
const MediaProduct = require('./models/mediaProduct')
const cors = require('cors')
const router = require('./controller/StateController')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const fs = require('fs-extra');
const path = require('path');

const PORT = process.env.PORT || 5000

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', router)
const initial = process.env.INITIAL === 'true';
app.use(errorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        if (initial) {
            await importData();
        }
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

async function importData() {
    // Считываем данные из JSON файлов
    const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));
    const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'categories.json'), 'utf8'));

    for (const categoryData of categoriesData) {
        try {
            // Проверяем, существует ли категория
            const existingCategory = await Category.findOne({
                where: { title: categoryData.name },
            });

            if (!existingCategory) {
                // Если категории нет, создаем ее
                await Category.create({
                    title: categoryData.name,
                    parent: 0, // Родительская категория
                });
                console.log(`Category ${categoryData.name} created.`);

                // Импорт дочерних категорий
                if (categoryData.subcategories && categoryData.subcategories.length > 0) {
                    const parentCategory = await Category.findOne({ where: { title: categoryData.name } }); // Получаем ID родительской категории

                    for (const subcategoryData of categoryData.subcategories) {
                        try {
                            // Проверяем, существует ли дочерняя категория
                            const existingSubcategory = await Category.findOne({
                                where: { title: subcategoryData.name },
                            });

                            if (!existingSubcategory) {
                                // Если дочерней категории нет, создаем ее
                                await Category.create({
                                    title: subcategoryData.name,
                                    parent: parentCategory.id, // ID родительской категории
                                });
                                console.log(`Subcategory ${subcategoryData.name} created.`);
                            } else {
                                console.log(`Subcategory ${subcategoryData.name} already exists.`);
                            }
                        } catch (error) {
                            console.error(`Error creating subcategory ${subcategoryData.name}:`, error);
                        }
                    }
                }
            } else {
                console.log(`Category ${categoryData.name} already exists.`);
            }
        } catch (error) {
            console.error(`Error creating category ${categoryData.name}:`, error);
        }
    }

    // Импорт продуктов
    for (const productData of productsData) {
        try {
            const category = await Category.findOne({ where: { title: productData.subcategory ?? productData.category } });
            if (!category) {
                console.error(`Category ${productData.category} not found for product ${productData.title}.`);
                continue; // Пропускаем этот продукт
            }
            // Проверяем, существует ли продукт
            const existingProduct = await Product.findOne({
                where: { title: productData.title, categoryId: category.id },
            });

            if (!existingProduct) {
                // Если продукта нет, создаем его
                // Привязываем продукт к категории

                const newProduct = await Product.create({
                    ...productData,
                    categoryId: category.id, // Привязываем продукт к категории
                });
                console.log(`Product ${productData.title} created.`);

                // Импорт медиа-продуктов
                if (productData.images && productData.images.length > 0) {
                    for (const imageData of productData.images) {
                        // Проверяем, существует ли медиа-продукт (по URL, если он доступен)
                        const existingMedia = await MediaProduct.findOne({
                            where: {
                                productId: newProduct.id,
                                media: imageData,
                            },
                        });

                        if (!existingMedia) {
                            await MediaProduct.create({
                                productId: newProduct.id,
                                media: imageData,
                            });
                            console.log(`Media for product ${productData.name} created.`);
                        } else {
                            console.log(`Media for product ${productData.name} already exists.`);
                        }
                    }
                }
            } else {
                console.log(`Product ${productData.title} already exists.`);
            }
        } catch (error) {
            console.error(`Error creating product ${productData.title}:`, error);
        }
    }
    console.log("productsData:", productsData.length)
    console.log("categoriesData:", categoriesData.length)
}

start()