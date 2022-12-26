import IncomingGoods from "../models/IncomingGoodsModels.js";
import Products from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import {Op} from "sequelize";
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890', 9);

export const getIncomings = async (req, res) =>{
    try {
        let response;
        if(req.role === "admin"){
            response = await IncomingGoods.findAll({
                attributes:['uuid', 'kode_brg_masuk', 'quantity', 'createdAt', 'updatedAt'],
                include:[
                    {
                        model: User, 
                        attributes:['name','email']
                    },
                    {
                        model: Products, 
                        attributes:['name', 'typeProduct', 'brand']
                    }
                ]
            });
        }else{
            response = await IncomingGoods.findAll({
                attributes:['uuid', 'kode_brg_masuk', 'quantity', 'createdAt', 'updatedAt'],
                where:{
                    userId: req.userId
                },
                include:[
                    {
                        model: User, 
                        attributes:['name','email']
                    },
                    {
                        model: Products, 
                        attributes:['name', 'typeProduct', 'brand']
                    }
                ]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getIncomingById = async(req, res) =>{
    try {
        const incomingGoods = await IncomingGoods.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!incomingGoods) return res.status(404).json({msg: "Data tidak ditemukan"});
        let response;
        if(req.role === "admin"){
            response = await IncomingGoods.findOne({
                attributes:['uuid', 'kode_brg_masuk', 'quantity', 'createdAt', 'updatedAt'],
                where:{
                    id: incomingGoods.id
                },
                include:[
                    {
                        model: User, 
                        attributes:['name','email']
                    },
                    {
                        model: Products, 
                        attributes:['name', 'typeProduct', 'brand']
                    }
                ]
            });
        }else{
            response = await IncomingGoods.findOne({
                attributes:['uuid', 'kode_brg_masuk', 'quantity', 'createdAt', 'updatedAt'],
                where:{
                    [Op.and]:[{id: incomingGoods.id}, {userId: req.userId}]
                },
                include:[
                    {
                        model: User, 
                        attributes:['name','email']
                    },
                    {
                        model: Products, 
                        attributes:['name', 'typeProduct', 'brand']
                    }
                ]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const createIncoming = async(req, res) =>{
    const quantity = req.body.quantites;
    const uuid = req.body.id;

    const product = await Products.findOne({
        where: {
            uuid: uuid
        }
    });
    if(!product) return res.status(404).json({msg: "Data produk tidak ditemukan!"})

    const amount = Number(quantity) + Number(product.quantity);

    try {
        await IncomingGoods.create({
            quantity: quantity,
            userId: req.userId,
            productId: product.id,
            kode_brg_masuk: `BMK${nanoid()}`
        });
        await Products.update({quantity: amount},{
            where: {
                uuid: product.uuid
            }
        });
        res.status(201).json({msg: "Barang masuk berhasil ditambahkan"})
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const updateIncoming = async(req, res) =>{
    const incomingGoods = await IncomingGoods.findOne({
        where:{
            uuid: req.params.id
        }
    });
    if(!incomingGoods) return res.status(404).json({msg: "Data tidak ditemukan"});
    
    const name = req.body.title;
    const typeProduct = req.body.type;
    const brand = req.body.brand;
    const quantity = req.body.quantites;

    try {
        if(req.role === "admin"){
            await IncomingGoods.update({name, typeProduct, brand, quantity},{
                where:{
                    id: incomingGoods.id
                }
            });
        }else{
            if(req.userId !== incomingGoods.userId) return res.status(403).json({msg: "Akses terlarang"});
            await IncomingGoods.update({name, typeProduct, brand, quantity},{
                where:{
                    [Op.and]:[{id: incomingGoods.id}, {userId: req.userId}]
                }
            });
        }
        res.status(200).json({msg: "Barang masuk berhasil diperbarui"});
    } catch (error) {
        res.status(500).json({msg: "Pastikan semua data terisi dengan benar dan tidak ada yang kosong. Mohon periksa kembali!"});
    }
}

export const deleteIncoming = async(req, res) =>{
    try {
        const incomingGoods = await IncomingGoods.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!incomingGoods) return res.status(404).json({msg: "Data tidak ditemukan"});

        const product = await Products.findOne({
            where: {
                id: incomingGoods.productId
            }
        })
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});
        if(Number(product.quantity) < Number(incomingGoods.quantity)) return res.status(404).json({msg: `Barang di stok kurang : ${product.quantity} < ${incomingGoods.quantity}`});
        const total = Number(product.quantity) - Number(incomingGoods.quantity);

        if(req.role === "admin"){
            await IncomingGoods.destroy({
                where:{
                    id: incomingGoods.id
                }
            });
        }else{
            if(req.userId !== incomingGoods.userId) return res.status(403).json({msg: "Akses terlarang"});
            await IncomingGoods.destroy({
                where:{
                    [Op.and]:[{id: incomingGoods.id}, {userId: req.userId}]
                }
            });
        }

        await Products.update({quantity: total}, {
            where: {
                uuid: product.uuid
            }
        })

        res.status(200).json({msg: "Barang masuk berhasil dihapus"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}