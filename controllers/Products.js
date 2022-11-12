import Product from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import fs from "fs";
import path from "path";
import {Op} from "sequelize";

export const getProducts = async (req, res) =>{
    try {
        const response = await Product.findAll({
            attributes:['uuid', 'name', 'typeProduct', 'brand', 'quantity', 'image', 'url', 'createdAt', 'updatedAt'],
            include:[{
                model: User,
                attributes:['name','email']
            }]
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getProductById = async(req, res) =>{
    try {
        const product = await Product.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});
            const response = await Product.findOne({
                attributes:['uuid', 'name', 'typeProduct', 'brand', 'quantity', 'image', 'url', 'createdAt', 'updatedAt'],
                where:{
                    id: product.id
                },
                include:[{
                    model: User,
                    attributes:['name','email']
                }]
            });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const createProduct = async(req, res) =>{
    if(req.files === null ) return res.status(400).json({msg: 'Tidak ada file gambar yang diuploud. Silahkan uploud file gambar terlebih dahulu'})

    const name = req.body.title;
    const typeProduct = req.body.type;
    const brand = req.body.brand;
    const quantity = req.body.quantites;
    const file = req.files.file;

    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/products/${fileName}`;
    const allowedType = ['.png', '.jpg', 'jpeg'];
    
    
    if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Gambar tidak sesuai!"});
    if(fileSize > 20000000) return res.status(422).json({msg: "Gambar harus lebih kecil dari 20MB"});

    try {
        await Product.create({
            name: name,
            typeProduct: typeProduct,
            brand: brand,
            quantity: quantity,
            image: fileName,
            url: url,
            userId: req.userId
        });
        file.mv(`./public/images/products/${fileName}`)
        res.status(201).json({msg: "Product berhasil dibuat"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const updateProduct = async(req, res) =>{
    const product = await Product.findOne({
        where:{
            uuid: req.params.id
        }
    });
    if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});

    let fileName = "";
    
    const name = req.body.title;
    const typeProduct = req.body.type;
    const brand = req.body.brand;
    const quantity = req.body.quantites;

    try {
        await Product.update({name, typeProduct, brand, quantity},{
            where:{
                id: product.id
            }
        });

        if(req.files === null) {
            fileName = product.image;
        } else {
            const file = req.files.file;
            const fileSize = file.data.length;
            const ext = path.extname(file.name);
            fileName = file.md5 + ext;
            const allowedType = ['.png', '.jpg', 'jpeg'];

            if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Gambar tidak sesuai!"});
            if(fileSize > 20000000) return res.status(422).json({msg: "Gambar harus lebih kecil dari 20MB"});
            const filePath = `./public/images/products/${product.image}`;
            fs.unlinkSync(filePath);
            file.mv(`./public/images/products/${fileName}`);
        }

        const image = fileName;
        const url = `${req.protocol}://${req.get("host")}/images/products/${fileName}`;

        await Product.update({image, url},{
            where:{
                id: product.id
            }
        });
        res.status(200).json({msg: "Product berhasil diperbarui"});
    } catch (error) {
        res.status(500).json({msg: "Pastikan semua data terisi dengan benar dan tidak ada yang kosong. Mohon periksa kembali!"});
    }
}

export const deleteProduct = async(req, res) =>{
    try {
        const product = await Product.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});
        
        const filePath = `./public/images/products/${product.image}`
        fs.unlinkSync(filePath);
        await Product.destroy({
            where:{
                id: product.id
            }
        });
        res.status(200).json({msg: "Produk berhasil dihapus"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}