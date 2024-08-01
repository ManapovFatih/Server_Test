const axios = require('axios');
const { JSDOM } = require('jsdom'); // Импортируйте jsdom
const fs = require('fs-extra');
const path = require('path');

const BASE_URL = 'https://www.sy-et.com/';
async function HtmlData(url) {
    try {
        const response = await axios.get(url);
        const htmlCode = response.data;
        return htmlCode;
    } catch (error) {
        console.error('Произошла ошибка:', error);
        throw error; // Перебросьте ошибку для дальнейшей обработки
    }
}
async function downloadImage(url, filepath) {
    const writer = fs.createWriteStream(filepath); // создаем поток записи в файл
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer); // перенаправляем поток данных из ответа в поток записи

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve); // разрешаем обещание, когда запись в файл завершена
            writer.on('error', reject); // отклоняем обещание, если возникла ошибка во время записи
        });

    } catch (error) {
        // Обработка ошибки при запросе или записи в файл
        console.error(`Ошибка при скачивании изображения: ${error}`);
        throw error; // перебрасываем ошибку вверх по стеку вызовов 
    } finally {
        // Закрываем поток записи, даже если произошла ошибка
        writer.close();
    }
}

async function getCategories(url) {
    try {
        const html = await HtmlData(url);
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const categories = (() => {
            const categoryElements = document.querySelectorAll('.pro_cate'); // Выбираем все категории

            const categoriesWithSubcategories = [];

            categoryElements.forEach(categoryElement => {
                const categoryName = categoryElement.querySelector('.page_name a').textContent.trim();
                const categoryUrl = categoryElement.querySelector('.page_name a').href;
                const subcategories = [];

                // Находим подкатегории
                const subcategoryElements = categoryElement.querySelectorAll('.content .list .first_cate a');
                subcategoryElements.forEach(subcategoryElement => {
                    subcategories.push({
                        name: subcategoryElement.textContent.trim(),
                        url: subcategoryElement.href
                    });
                });

                // Добавляем категорию с подкатегориями
                categoriesWithSubcategories.push({
                    name: categoryName,
                    url: categoryUrl,
                    subcategories: subcategories
                });
            });

            return categoriesWithSubcategories;
        })();

        return categories;

    } catch (error) {
        console.error('Произошла ошибка при получении категорий:', error);
        throw error;
    }
}
async function getPage(url) {
    try {
        const html = await HtmlData(url);
        const dom = new JSDOM(html);
        const document = dom.window.document;
        const pages = document.querySelectorAll('.page_item');
        const maxPage = pages.length + 1;

        return maxPage;

    } catch (error) {
        console.error('Произошла ошибка при получении количества страниц:', error);
        throw error;
    }
}
async function getProducts(url) {
    try {
        const html = await HtmlData(url);
        const dom = new JSDOM(html);
        const document = dom.window.document;
        const products = (() => {
            const productElements = document.querySelectorAll('.pro');
            const productsContent = [];
            for (const productElement of productElements) {
                const productUrl = productElement.querySelector('.name a').href;
                productsContent.push({
                    url: productUrl,
                });
            }
            return productsContent;
        })();

        return products;

    } catch (error) {
        console.error('Произошла ошибка при получении продуктов:', error);
        throw error;
    }
}
async function getProduct(url) {
    try {
        const html = await HtmlData(url);
        const dom = new JSDOM(html);
        const document = dom.window.document;
        const title = document.querySelector('.name').textContent.trim();
        const description = document.querySelector('.desc').textContent.trim();
        const images = (() => {
            const imageElements = document.querySelectorAll('.left_small_img_inner span');

            const imagesContent = [];
            for (const imageElement of imageElements) {
                const imageUrl = imageElement.querySelector('a img').src;
                const cleanedUrl = imageUrl.replace(/240x240/, '500x500')
                imagesContent.push({
                    url: cleanedUrl,
                });
            }
            return imagesContent;
        })();


        const productsContent = ({
            title: title,
            description: description,
            imageUrl: images,
        });
        return productsContent;

    } catch (error) {
        console.error('Произошла ошибка при получении продукта:', error);
        throw error;
    }
}
// Пример использования:
(async () => {
    const categories = await getCategories('https://www.sy-et.com/products/'); // Замените на ваш URL
    const categoriesContent = ({
        name: categories.name,
        subcategories: categories.subcategories,
    });
    const productDetails = []
    for (const category of categories) {
        console.log(`Scraping category: ${category.name}`);
        if (category.subcategories && category.subcategories.length > 0) {
            for (const subcategory of category.subcategories) {
                console.log(`Scraping subcategory: ${subcategory.name}`);
                const maxPage = await getPage(BASE_URL + subcategory.url);
                let currentPage = 1;
                while (currentPage <= maxPage) {
                    const products = await getProducts(BASE_URL + subcategory.url + `/${currentPage}.html`);
                    currentPage++;
                    for (const product of products) {
                        const detail = await getProduct(BASE_URL + product.url);
                        const images = []
                        for (const image of detail.imageUrl) {
                            const imageName = image.url.split('/').pop().replace(/\.[\d]+x[\d]+\.(jpg|png)$/, ''); // Извлекаем имя файла
                            const imageFilePath = path.join(__dirname, 'files', imageName);
                            images.push(
                                imageName
                            );
                            if (!fs.existsSync(imageFilePath)) {
                                await downloadImage(image.url, imageFilePath)
                            }

                        }
                        productDetails.push({
                            title: detail.title,
                            description: detail.description,
                            images: images,
                            category: category.name,
                            subcategory: subcategory.name,
                        });
                    }
                }
            }
        }
        else {
            const maxPage = await getPage(BASE_URL + category.url);
            let currentPage = 1;
            while (currentPage <= maxPage) {
                const products = await getProducts(BASE_URL + category.url + `/${currentPage}.html`);
                currentPage++;
                for (const product of products) {
                    const detail = await getProduct(BASE_URL + product.url);
                    const images = []
                    for (const image of detail.imageUrl) {

                        const imageName = image.url.split('/').pop().replace(/\.[\d]+x[\d]+\.(jpg|png)$/, '');
                        const imageFilePath = path.join(__dirname, 'files', imageName);
                        images.push(
                            imageName
                        );

                        if (!fs.existsSync(imageFilePath)) {
                            await downloadImage(image.url, imageFilePath)
                        }

                    }
                    productDetails.push({
                        title: detail.title,
                        description: detail.description,
                        images: images,
                        category: category.name,
                        subcategory: null,
                    });
                }
            }
        }
    }
    const categoriesData = JSON.stringify(categories, null, 2);
    fs.writeFileSync('categories.json', categoriesData);
    const productsData = JSON.stringify(productDetails, null, 2);
    fs.writeFileSync('products.json', productsData);
    console.log('Scraping complete!');
    console.log('Products: ', productDetails.length);
})();
