
async function importData() {
    // Считываем данные из JSON файлов
    const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));
    const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'categories.json'), 'utf8'));

    // Импорт категорий
    for (const categoryData of categoriesData) {
        try {
            // Проверяем, существует ли категория
            const existingCategory = await Category.findOne({
                where: { name: categoryData.name },
            });

            if (!existingCategory) {
                // Если категории нет, создаем ее
                await Category.create(categoryData);
                console.log(`Category ${categoryData.name} created.`);
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
            // Проверяем, существует ли продукт
            const existingProduct = await Product.findOne({
                where: { name: productData.name },
            });

            if (!existingProduct) {
                // Если продукта нет, создаем его
                // Привязываем продукт к категории
                const category = await Category.findOne({ where: { name: productData.category } });
                if (!category) {
                    console.error(`Category ${productData.category} not found for product ${productData.name}.`);
                    continue; // Пропускаем этот продукт
                }
                const newProduct = await Product.create({
                    ...productData,
                    categoryId: category.id, // Привязываем продукт к категории
                });
                console.log(`Product ${productData.name} created.`);

                // Импорт медиа-продуктов
                if (productData.images && productData.images.length > 0) {
                    for (const mediaData of productData.images) {
                        // Проверяем, существует ли медиа-продукт
                        const existingMedia = await MediaProduct.findOne({
                            where: {
                                productId: newProduct.id, // Используем ID продукта, который только что создали
                                // ... Другие поля для проверки уникальности (например, URL)
                            },
                        });

                        if (!existingMedia) {
                            await MediaProduct.create({
                                productId: newProduct.id,
                                // ... Добавьте данные из `mediaData`
                            });
                            console.log(`Media for product ${productData.name} created.`);
                        } else {
                            console.log(`Media for product ${productData.name} already exists.`);
                        }
                    }
                }
            } else {
                console.log(`Product ${productData.name} already exists.`);
            }
        } catch (error) {
            console.error(`Error creating product ${productData.name}:`, error);
        }
    }
}